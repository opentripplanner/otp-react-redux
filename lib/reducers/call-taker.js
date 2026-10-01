import { randId } from '@opentripplanner/core-utils/lib/storage'
import update from 'immutability-helper'

import { compareEndTimes } from '../util/call-taker'
import { getISOLikeTimestamp } from '../util/state'
import { getModuleConfig, Modules } from '../util/config'

function getCalltakerConfig(config) {
  return getModuleConfig({ otp: { config } }, Modules.CALL_TAKER)
}

function createCallTakerReducer(config) {
  const calltakerConfig = getCalltakerConfig(config)
  if (!calltakerConfig) {
    // Don't include the calltaker reducer at all if calltaker is not enabled in config.
    return undefined
  }

  const initialState = {
    activeCall: null,
    callHistory: {
      calls: [],
      fetched: false,
      visible: calltakerConfig?.options?.showCallHistoryOnLoad
    },
    mailables: {
      visible: false
    }
  }
  // eslint-disable-next-line complexity
  return (state = initialState, action) => {
    switch (action.type) {
      case 'ADD_CALL': {
        const newCall = action.payload
        return update(state, {
          callHistory: {
            calls: { $push: [...state.callHistory.calls, newCall] }
          }
        })
      }
      case 'BEGIN_CALL': {
        const newCall = {
          id: randId(),
          searches: [],
          startTime: getISOLikeTimestamp(config.homeTimezone)
        }
        // Initialize new call and show call history window.
        return update(state, {
          activeCall: { $set: newCall },
          callHistory: { visible: { $set: true } }
        })
      }
      case 'RECEIVED_CALLS': {
        const data = action.payload.calls.calls || []
        const calls = data.sort(compareEndTimes)
        return update(state, {
          callHistory: { calls: { $set: calls }, fetched: { $set: true } }
        })
      }
      case 'ROUTING_RESPONSE': {
        const { searchId } = action.payload
        if (state.activeCall) {
          // If call is in progress, record search ID when a routing response is
          // fulfilled, except in the case where the
          // searchId contains _CALL and call history window is visible, which indicates that a user is viewing a
          // past call record
          // TODO: How should we handle routing errors.
          if (
            !(state.callHistory.visible && searchId.indexOf('_CALL') !== -1)
          ) {
            return update(state, {
              activeCall: { searches: { $push: [searchId] } }
            })
          }
        }
        // Otherwise, ignore.
        return state
      }
      case 'TOGGLE_CALL_HISTORY': {
        return update(state, {
          callHistory: { visible: { $set: !state.callHistory.visible } }
        })
      }
      case 'TOGGLE_MAILABLES': {
        return update(state, {
          mailables: { visible: { $set: !state.mailables.visible } }
        })
      }
      case 'END_CALL': {
        localStorage.setItem(
          Modules.CALL_TAKER,
          JSON.stringify(state.callHistory)
        )
        return update(state, {
          activeCall: { $set: null }
        })
      }
      default:
        return state
    }
  }
}

export default createCallTakerReducer
