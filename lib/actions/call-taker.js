import qs from 'qs'
import { createAction } from 'redux-actions'

import {getRoutingParams} from '../actions/api'
import {getCallForId} from '../util/call-taker'
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
  return async function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {activeCall} = callTaker
    // Make POST request to store call.
    // https://trimet-datastore.ibi-transit.com/calltaker/call
    // formdata: sessionId=test&call.startTime=2020-06-11T12%3A39%3A21&call.endTime=2020-06-11T12%3A39%3A52
    const formData = new FormData()
    formData.append('sessionId', 'test') // FIXME
    formData.append('call.startTime', activeCall.startTime)
    formData.append('call.endTime', getTimestamp())
    fetch(`${otp.config.callTakerUrl}/calltaker/call`,
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

export function fetchCalls () {
  return async function (dispatch, getState) {
    dispatch(requestingCalls())
    const {otp} = getState()
    fetch(`${otp.config.callTakerUrl}/calltaker/call?sessionId=test&limit=10`) // FIXME
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

export function saveQueriesForCall (call) {
  return async function (dispatch, getState) {
    const state = getState()
    if (!call) {
      alert(`Could not find call for ${call.id}. Cancelling save queries request.`)
      return
    }
    return Promise.all(call.searches.map(searchId => {
      const search = state.otp.searches[searchId]
      const {from, to} = search.query
      // FIXME: how to handle realtime updates?
      const queryParams = getRoutingParams(search.query, state.otp.config, true)
      const formData = new FormData()
      formData.append('sessionId', 'test') // FIXME
      formData.append('query.queryParams', JSON.stringify(queryParams))
      formData.append('query.fromPlace', from.name || placeToLatLonStr(from))
      formData.append('query.toPlace', to.name || placeToLatLonStr(to))
      formData.append('query.timeStamp', search.query.timestamp)
      formData.append('query.call.id', call.id)
      return fetch(`${state.otp.config.callTakerUrl}/calltaker/callQuery?sessionId=test`,
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
  return async function (dispatch, getState) {
    dispatch(requestingQueries())
    const {otp} = getState()
    fetch(`${otp.config.callTakerUrl}/calltaker/callQuery?sessionId=test&call.id=${callId}`) // FIXME
      .then(res => res.json())
      .then(queries => {
        dispatch(receivedQueries({callId, queries}))
      })
      .catch(err => {
        alert(`Could not fetch calls: ${JSON.stringify(err)}`)
      })
  }
}
