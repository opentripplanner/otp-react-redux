import { getUrlParams } from '@opentripplanner/core-utils/lib/query'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {getRoutingParams} from '../actions/api'
// import {getCallForId} from '../util/call-taker'
import {URL_ROOT} from '../util/constants'
import {getTimestamp} from '../util/state'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const endingCall = createAction('END_CALL')
const requestingCalls = createAction('REQUESTING_CALLS')
const receivedCalls = createAction('RECEIVED_CALLS')
const requestingQueries = createAction('REQUESTING_QUERIES')
const receivedQueries = createAction('RECEIVED_QUERIES')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')

export function endCall () {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {activeCall, session} = callTaker
    if (sessionIsInvalid(session)) return
    // Make POST request to store call.
    const formData = new FormData()
    formData.append('sessionId', session.sessionId)
    formData.append('call.startTime', activeCall.startTime)
    formData.append('call.endTime', getTimestamp())
    fetch(`${otp.config.datastoreUrl}/calltaker/call`,
      {method: 'POST', body: formData}
    )
      .then(res => res.json())
      .then(id => {
        // Inject call ID into active call and save queries.
        dispatch(saveQueriesForCall({...activeCall, id}))
          .then(() => {
            console.log('finished saving queries for call', id)
          })
        dispatch(fetchCalls())
      })
      .catch(err => {
        alert(`Could not save call: ${JSON.stringify(err)}`)
      })
    dispatch(endingCall())
  }
}

export function initializeModules () {
  return function (dispatch, getState) {
    const {datastoreUrl, trinetReDirect} = getState().otp.config
    // Initialize session if datastore enabled.
    if (datastoreUrl && trinetReDirect) {
      // TODO: Use session storage?
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

const storeSession = createAction('STORE_SESSION')

function checkSession (datastoreUrl, sessionId, checkSessionSuccessCallback) {
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

function placeToLatLonStr (place) {
  return `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`
}

function sessionIsInvalid (session) {
  if (!session || !session.sessionId) {
    console.error('No valid OTP datastore session found.')
    return true
  }
  return false
}

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
      const {from, to} = search.query
      const {sessionId} = callTaker.session
      // FIXME: how to handle realtime updates?
      const queryParams = getRoutingParams(search.query, otp.config, true)
      const formData = new FormData()
      formData.append('sessionId', sessionId)
      formData.append('query.queryParams', JSON.stringify(queryParams))
      formData.append('query.fromPlace', from.name || placeToLatLonStr(from))
      formData.append('query.toPlace', to.name || placeToLatLonStr(to))
      formData.append('query.timeStamp', search.query.timestamp)
      formData.append('query.call.id', call.id)
      return fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}`,
        {method: 'POST', body: formData}
      )
        .then(res => res.json())
        .catch(err => {
          alert(`Could not fetch calls: ${JSON.stringify(err)}`)
        })
    }))
  }
}

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
