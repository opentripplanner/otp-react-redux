import { createAction } from 'redux-actions'
import isWithinInterval from 'date-fns/isWithinInterval'
import subHours from 'date-fns/subHours'

import { getISOLikeTimestamp } from '../util/state'
import { getModuleConfig, isModuleEnabled, Modules } from '../util/config'
import { searchToQuery } from '../util/call-taker'

import { resetForm } from './form'

if (typeof fetch === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const endingCall = createAction('END_CALL')
const receivedCalls = createAction('RECEIVED_CALLS')
const addCall = createAction('ADD_CALL')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')
export const toggleMailables = createAction('TOGGLE_MAILABLES')

/**
 * Toggle call history (and close field trips if open).
 */
export function resetAndToggleCallHistory() {
  return function (dispatch, getState) {
    dispatch(toggleCallHistory())
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
    const { activeCall } = state.callTaker
    const callTakerEnabled = isModuleEnabled(state, Modules.CALL_TAKER)
    if (callTakerEnabled && !activeCall) {
      dispatch(beginCall())
    }
  }
}

/**
 * Fetch latest calls for a particular session.
 *
 */
export function fetchCalls(intl) {
  return async function (dispatch, getState) {
    try {
      const fetchResult = localStorage.getItem(Modules.CALL_TAKER)
      const calls = JSON.parse(fetchResult)

      const callTakerConfig = getModuleConfig(getState(), Modules.CALL_TAKER)
      const { hoursToKeepEntries } = callTakerConfig?.options

      // Wipe old entries if configured
      if (hoursToKeepEntries && calls?.calls.length > 0) {
        calls.calls = calls.calls.filter((c) =>
          isWithinInterval(c.endTime, {
            end: new Date(),
            start: subHours(new Date(), hoursToKeepEntries)
          })
        )
      }
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
 * End the active call and store the queries made during the call.
 */
export function endCall(intl) {
  return async function (dispatch, getState) {
    const { callTaker, otp } = getState()
    const { activeCall } = callTaker
    // Make data structure to store new call.
    const newCall = {
      endTime: getISOLikeTimestamp(otp.config.homeTimezone),
      queries: activeCall.searches.map((searchId) =>
        searchToQuery(otp.searches[searchId], activeCall, otp.config)
      ),
      startTime: activeCall.startTime
    }
    try {
      // Wait until query was saved before re-fetching queries for this call.
      await dispatch(addCall(newCall))
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
