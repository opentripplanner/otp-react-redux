import { getUrlParams } from '@opentripplanner/core-utils/lib/query'
import { serialize } from 'object-to-formdata'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {toggleFieldTrips} from './field-trip'
import {resetForm} from './form'
import {searchToQuery, sessionIsInvalid} from '../util/call-taker'
import {URL_ROOT} from '../util/constants'
import {getTimestamp} from '../util/state'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const endingCall = createAction('END_CALL')
const receivedCalls = createAction('RECEIVED_CALLS')
const receivedQueries = createAction('RECEIVED_QUERIES')
const requestingCalls = createAction('REQUESTING_CALLS')
const requestingQueries = createAction('REQUESTING_QUERIES')
const storeSession = createAction('STORE_SESSION')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')
export const toggleMailables = createAction('TOGGLE_MAILABLES')

/**
 * Fully reset form and toggle call history (and close field trips if open).
 */
export function resetAndToggleCallHistory () {
  return function (dispatch, getState) {
    dispatch(resetForm(true))
    dispatch(toggleCallHistory())
    if (getState().callTaker.fieldTrip.visible) dispatch(toggleFieldTrips())
  }
}

/**
 * End the active call and store the queries made during the call.
 */
export function endCall () {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {activeCall, session} = callTaker
    const { sessionId } = session
    if (sessionIsInvalid(session)) return
    // Make POST request to store new call.
    const callData = serialize({
      sessionId,
      call: {
        startTime: activeCall.startTime,
        endTime: getTimestamp()
      }
    })
    fetch(`${otp.config.datastoreUrl}/calltaker/call`,
      {method: 'POST', body: callData}
    )
      .then(res => res.json())
      .then(id => {
        // Inject call ID into active call and save queries.
        dispatch(saveQueriesForCall({...activeCall, id}))
        dispatch(fetchCalls())
      })
      .catch(err => {
        console.error(err)
        alert(`Could not save call: ${JSON.stringify(err)}`)
      })
    dispatch(endingCall())
  }
}

/**
 * Initialize the Call Taker and Field Trip modules by checking the session
 * query param against sessions in the datastore backend or initializing a new
 * session via Trinet.
 */
export function initializeModules () {
  return function (dispatch, getState) {
    const {datastoreUrl, trinetReDirect} = getState().otp.config
    // Initialize session if datastore enabled.
    if (datastoreUrl && trinetReDirect) {
      // TODO: Generalize for non-TriNet instances.
      const sessionId = getUrlParams().sessionId
      if (sessionId) {
        // Initialize the session if found in URL query params.
        dispatch(checkSession(datastoreUrl, sessionId))
      } else {
        // No sessionId was passed in, so we must request one from server.
        newSession(datastoreUrl, trinetReDirect, URL_ROOT)
      }
    }
  }
}

/**
 * Handle initializing a new Trinet session by redirecting to Trinet auth and
 * returning once authenticated successfully.
 */
function newSession (datastoreUrl, verifyLoginUrl, redirect) {
  fetch(datastoreUrl + '/auth/newSession')
    .then(res => res.json())
    .then(data => {
      const {sessionId: session} = data
      const windowUrl = `${verifyLoginUrl}?${qs.stringify({session, redirect})}`
      // Redirect to login url.
      window.location = windowUrl
    })
    .catch(error => {
      console.error('newSession error', error)
    })
}

/**
 * Check that a particular session ID is valid and store resulting session
 * data.
 */
function checkSession (datastoreUrl, sessionId) {
  return function (dispatch, getState) {
    fetch(datastoreUrl + `/auth/checkSession?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(session => dispatch(storeSession({session})))
      .catch(error => {
        dispatch(storeSession({session: null}))
        alert(`Error establishing auth session: ${JSON.stringify(error)}`)
      })
  }
}

/**
 * Fetch latest calls for a particular session.
 */
export function fetchCalls () {
  return function (dispatch, getState) {
    dispatch(requestingCalls())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    const limit = 30
    fetch(`${datastoreUrl}/calltaker/call?${qs.stringify({limit, sessionId})}`)
      .then(res => res.json())
      .then(calls => dispatch(receivedCalls({calls})))
      .catch(err => alert(`Error fetching calls: ${JSON.stringify(err)}`))
  }
}

/**
 * Store the trip queries made over the course of a call (to be called when the
 * call terminates).
 */
export function saveQueriesForCall (call) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    if (!call) {
      alert(`Could not find call for ${call.id}. Cancelling save queries request.`)
      return
    }
    return Promise.all(call.searches.map(searchId => {
      const search = otp.searches[searchId]
      const query = searchToQuery(search, call, otp.config)
      const {sessionId} = callTaker.session
      const queryData = serialize({ sessionId, query })
      return fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}`,
        {method: 'POST', body: queryData}
      )
        .then(res => res.json())
        .catch(err => {
          alert(`Error storing call queries: ${JSON.stringify(err)}`)
        })
    }))
  }
}

/**
 * Fetch the trip queries that were made during a particular call.
 */
export function fetchQueries (callId) {
  return function (dispatch, getState) {
    dispatch(requestingQueries())
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}&call.id=${callId}`)
      .then(res => res.json())
      .then(queries => {
        dispatch(receivedQueries({callId, queries}))
      })
      .catch(err => {
        alert(`Error fetching queries: ${JSON.stringify(err)}`)
      })
  }
}
