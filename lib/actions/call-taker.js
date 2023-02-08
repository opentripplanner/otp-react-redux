import { createAction } from 'redux-actions'
import { getUrlParams } from '@opentripplanner/core-utils/lib/query'
import { serialize } from 'object-to-formdata'
import qs from 'qs'

import { getISOLikeTimestamp } from '../util/state'
import { isModuleEnabled, Modules } from '../util/config'
import { searchToQuery, sessionIsInvalid } from '../util/call-taker'

import { resetForm } from './form'

if (typeof fetch === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const endingCall = createAction('END_CALL')
const receivedCalls = createAction('RECEIVED_CALLS')
const receivedQueries = createAction('RECEIVED_QUERIES')
const requestingCalls = createAction('REQUESTING_CALLS')
const requestingQueries = createAction('REQUESTING_QUERIES')
const storeSession = createAction('STORE_SESSION')
const toggleFieldTrips = createAction('TOGGLE_FIELD_TRIPS')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')
export const toggleMailables = createAction('TOGGLE_MAILABLES')

/**
 * Fully reset form and toggle call history (and close field trips if open).
 */
export function resetAndToggleCallHistory() {
  return function (dispatch, getState) {
    dispatch(resetForm(true))
    dispatch(toggleCallHistory())
    if (getState().callTaker.fieldTrip.visible) dispatch(toggleFieldTrips())
  }
}

/**
 * Start a new call (and show the call history window) if
 * - the call module is enabled, and
 * - a call is not in progress, and
 * - the field trip window is not visible.
 */
export function beginCallIfNeeded() {
  return function (dispatch, getState) {
    const state = getState()
    const { activeCall, fieldTrip } = state.callTaker
    const callTakerEnabled = isModuleEnabled(state, Modules.CALL_TAKER)
    if (callTakerEnabled && !activeCall && !fieldTrip.visible) {
      dispatch(beginCall())
    }
  }
}

/**
 * Handle initializing a new Trinet session by redirecting to Trinet auth and
 * returning once authenticated successfully.
 */
function newSession(datastoreUrl, verifyLoginUrl, redirect) {
  fetch(datastoreUrl + '/auth/newSession')
    .then((res) => res.json())
    .then((data) => {
      const { sessionId: session } = data
      const windowUrl = `${verifyLoginUrl}?${qs.stringify({
        redirect,
        session
      })}`
      // Redirect to login url.
      window.location = windowUrl
    })
    .catch((error) => {
      console.error('newSession error', error)
    })
}

/**
 * Check that a particular session ID is valid and store resulting session
 * data.
 */
function checkSession(datastoreUrl, sessionId, intl) {
  return function (dispatch, getState) {
    fetch(datastoreUrl + `/auth/checkSession?sessionId=${sessionId}`)
      .then((res) => res.json())
      .then((session) => dispatch(storeSession({ session })))
      .catch((err) => {
        dispatch(storeSession({ session: null }))
        alert(
          intl.formatMessage(
            { id: 'actions.callTaker.checkSessionError' },
            { err: JSON.stringify(err) }
          )
        )
      })
  }
}

/**
 * Initialize the Call Taker and Field Trip modules by checking the session
 * query param against sessions in the datastore backend or initializing a new
 * session via Trinet.
 */
export function initializeModules(intl) {
  return function (dispatch, getState) {
    const { datastoreUrl, trinetReDirect } = getState().otp.config
    // Initialize session if datastore enabled.
    if (datastoreUrl && trinetReDirect) {
      // TODO: Generalize for non-TriNet instances.
      const sessionId = getUrlParams().sessionId
      if (sessionId) {
        // Initialize the session if found in URL query params.
        dispatch(checkSession(datastoreUrl, sessionId, intl))
      } else {
        // No sessionId was passed in, so we must request one from server.
        newSession(datastoreUrl, trinetReDirect, window.location.origin)
      }
    }
  }
}

/**
 * Fetch latest calls for a particular session.
 */
export function fetchCalls(intl) {
  return async function (dispatch, getState) {
    dispatch(requestingCalls())
    const { callTaker, otp } = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const { datastoreUrl } = otp.config
    const { sessionId } = callTaker.session
    const limit = 1000
    try {
      const fetchResult = await fetch(
        `${datastoreUrl}/calltaker/call?${qs.stringify({ limit, sessionId })}`
      )
      const calls = await fetchResult.json()
      dispatch(receivedCalls({ calls }))
    } catch (err) {
      alert(
        intl.formatMessage(
          { id: 'actions.callTaker.fetchCallsError' },
          { err: JSON.stringify(err) }
        )
      )
    }
  }
}

/**
 * Store the trip queries made over the course of a call (to be called when the
 * call terminates).
 */
function saveQueriesForCall(call, intl) {
  return function (dispatch, getState) {
    const { callTaker, otp } = getState()
    const { datastoreUrl } = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    if (!call) {
      alert(
        intl.formatMessage({ id: 'actions.callTaker.couldNotFindCallError' })
      )
      return
    }
    return Promise.all(
      call.searches.map((searchId) => {
        const search = otp.searches[searchId]
        const query = searchToQuery(search, call, otp.config)
        const { sessionId } = callTaker.session
        const queryData = serialize({ query, sessionId })
        return fetch(
          `${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}`,
          { body: queryData, method: 'POST' }
        )
          .then((res) => res.json())
          .catch((err) => {
            alert(
              intl.formatMessage(
                { id: 'actions.callTaker.callQuerySaveError' },
                { err: JSON.stringify(err) }
              )
            )
          })
      })
    )
  }
}

/**
 * End the active call and store the queries made during the call.
 */
export function endCall(intl) {
  return async function (dispatch, getState) {
    const { callTaker, otp } = getState()
    const { activeCall, session } = callTaker
    const { sessionId } = session
    if (sessionIsInvalid(session)) return
    // Make POST request to store new call.
    const callData = serialize({
      call: {
        endTime: getISOLikeTimestamp(otp.config.homeTimezone),
        startTime: activeCall.startTime
      },
      sessionId
    })
    try {
      const fetchResult = await fetch(
        `${otp.config.datastoreUrl}/calltaker/call`,
        { body: callData, method: 'POST' }
      )
      const id = await fetchResult.json()

      // Inject call ID into active call and save queries.
      await dispatch(saveQueriesForCall({ ...activeCall, id }, intl))
      // Wait until query was saved before re-fetching queries for this call.
      await dispatch(fetchCalls(intl))
    } catch (err) {
      console.error(err)
      alert(
        intl.formatMessage(
          { id: 'actions.callTaker.callSaveError' },
          { err: JSON.stringify(err) }
        )
      )
    }
    // Clear itineraries shown when ending call.
    dispatch(resetForm(true))
    dispatch(endingCall())
  }
}

/**
 * Fetch the trip queries that were made during a particular call.
 */
export function fetchQueries(callId, intl) {
  return function (dispatch, getState) {
    dispatch(requestingQueries())
    const { callTaker, otp } = getState()
    const { datastoreUrl } = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const { sessionId } = callTaker.session
    fetch(
      `${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}&call.id=${callId}`
    )
      .then((res) => res.json())
      .then((queries) => {
        dispatch(receivedQueries({ callId, queries }))
      })
      .catch((err) => {
        alert(
          intl.formatMessage(
            { id: 'actions.callTaker.queryFetchError' },
            { err: JSON.stringify(err) }
          )
        )
      })
  }
}
