import { getUrlParams, planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {routingQuery} from './api'
import {setQueryParam} from './form'
import {getGroupSize, searchToQuery} from '../util/call-taker'
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
const receivedFieldTripDetails = createAction('RECEIVED_FIELD_TRIP_DETAILS')
const requestingFieldTripDetails = createAction('REQUESTING_FIELD_TRIP_DETAILS')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const setFieldTripFilter = createAction('SET_FIELD_TRIP_FILTER')
export const setActiveFieldTrip = createAction('SET_ACTIVE_FIELD_TRIP')
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
 * Fetch all field trip requests (as summaries).
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
      .then(fieldTrips => dispatch(receivedFieldTrips({fieldTrips})))
      .catch(err => alert(`Error fetching field trips: ${JSON.stringify(err)}`))
  }
}

/**
 * Fetch details for a particular field trip request.
 */
export function fetchFieldTripDetails (requestId) {
  return function (dispatch, getState) {
    dispatch(requestingFieldTripDetails())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/fieldtrip/getRequest?${qs.stringify({requestId, sessionId})}`)
      .then(res => res.json())
      .then(fieldTrip => dispatch(receivedFieldTripDetails({fieldTrip})))
      .catch(err => {
        alert(`Error fetching field trips: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Add note for field trip request.
 */
export function addFieldTripNote (request, note) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId, userName} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('note.note', note.note)
    queryData.append('note.type', note.type)
    queryData.append('note.userName', userName)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/addNote`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error adding field trip note: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Delete a specific note for a field trip request.
 */
export function deleteFieldTripNote (request, noteId) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('noteId', noteId)
    return fetch(`${datastoreUrl}/fieldtrip/deleteNote`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error deleting field trip note: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Edit teacher (AKA submitter) notes for a field trip request.
 */
export function editSubmitterNotes (request, submitterNotes) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('notes', submitterNotes)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/editSubmitterNotes`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error editing submitter notes: ${JSON.stringify(err)}`)
      })
  }
}

export function planOutbound (request) {
  return async function (dispatch, getState) {
    const {config} = getState().otp
    // this.clearTrip()
    const locations = await planParamsToQueryAsync({
      fromPlace: request.startLocation,
      toPlace: request.endLocation
    }, config)
    const queryParams = {
      date: moment(request.travelDate).format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE',
      groupSize: getGroupSize(request),
      time: moment(request.arriveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(routingQuery())
  }
}

export function planInbound (request) {
  return async function (dispatch, getState) {
    const {config} = getState().otp
    const locations = await planParamsToQueryAsync({
      fromPlace: request.endLocation,
      toPlace: request.startLocation
    }, config)
    // this.clearTrip()
    const queryParams = {
      date: moment(request.travelDate).format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART',
      groupSize: getGroupSize(request),
      time: moment(request.leaveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(routingQuery())
  }
}

/**
 * Set field trip request status (e.g., cancelled).
 */
export function setRequestStatus (request, status) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('status', status)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/setRequestStatus`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error setting request status: ${JSON.stringify(err)}`)
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
