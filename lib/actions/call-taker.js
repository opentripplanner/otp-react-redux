import { getUrlParams } from '@opentripplanner/core-utils/lib/query'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {searchToQuery} from '../util/call-taker'
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

const receivedFieldTrips = createAction('RECEIVED_FIELD_TRIPS')
const requestingFieldTrips = createAction('REQUESTING_FIELD_TRIPS')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')
export const toggleFieldTrips = createAction('TOGGLE_FIELD_TRIPS')

/**
 * End the active call and store the queries made during the call.
 */
export function endCall () {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {activeCall, session} = callTaker
    if (sessionIsInvalid(session)) return
    // Make POST request to store call.
    const callData = new FormData()
    callData.append('sessionId', session.sessionId)
    callData.append('call.startTime', activeCall.startTime)
    callData.append('call.endTime', getTimestamp())
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
      console.log('newSession success: ' + session)
      const windowUrl = `${verifyLoginUrl}?${qs.stringify({session, redirect})}`
      console.log('redirecting to: ' + windowUrl)
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
        console.error('checkSession error', error)
        dispatch(storeSession({session: null}))
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
    const limit = 10
    fetch(`${datastoreUrl}/calltaker/call?${qs.stringify({limit, sessionId})}`)
      .then(res => res.json())
      .then(calls => {
        console.log('GET calls response', calls)
        dispatch(receivedCalls({calls}))
      })
      .catch(err => {
        alert(`Could not fetch calls: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Fetch latest calls for a particular session.
 */
export function fetchFieldTrips () {
  return function (dispatch, getState) {
    dispatch(requestingFieldTrips())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/fieldtrip/getRequestsSummary?${qs.stringify({sessionId})}`)
      .then(res => res.json())
      .then(fieldTrips => {
        console.log('GET field trips response', fieldTrips)
        dispatch(receivedFieldTrips({fieldTrips}))
      })
      .catch(err => {
        alert(`Could not fetch field trips: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * @return {boolean} - whether a calltaker session is invalid
 */
function sessionIsInvalid (session) {
  if (!session || !session.sessionId) {
    console.error('No valid OTP datastore session found.')
    return true
  }
  return false
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
      const queryData = new FormData()
      queryData.append('sessionId', sessionId)
      queryData.append('query.queryParams', query.queryParams)
      queryData.append('query.fromPlace', query.fromPlace)
      queryData.append('query.toPlace', query.toPlace)
      queryData.append('query.timeStamp', query.timeStamp)
      queryData.append('query.call.id', call.id)
      return fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}`,
        {method: 'POST', body: queryData}
      )
        .then(res => res.json())
        .catch(err => {
          alert(`Could not fetch calls: ${JSON.stringify(err)}`)
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
        alert(`Could not fetch calls: ${JSON.stringify(err)}`)
      })
  }
}
