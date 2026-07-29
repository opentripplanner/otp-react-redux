import { randId } from '@opentripplanner/core-utils/lib/storage'
import update from 'immutability-helper'

import { compareEndTimes } from '../util/call-taker'
import { FETCH_STATUS } from '../util/constants'
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
      calls: {
        data: [],
        status: FETCH_STATUS.UNFETCHED
      },
      visible: calltakerConfig?.options?.showCallHistoryOnLoad
    },
    mailables: {
      visible: false
    },
    session: null
  }
  // eslint-disable-next-line complexity
  return (state = initialState, action) => {
    switch (action.type) {
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
      case 'REQUESTING_CALLS': {
        return update(state, {
          callHistory: { calls: { status: { $set: FETCH_STATUS.FETCHING } } }
        })
      }
      case 'RECEIVED_CALLS': {
        const data = action.payload.calls
        const calls = {
          data: data.sort(compareEndTimes),
          status: FETCH_STATUS.FETCHED
        }
        return update(state, {
          callHistory: { calls: { $set: calls } }
        })
      }
      case 'RECEIVED_QUERIES': {
        const { callId, queries } = action.payload
        const { data } = state.callHistory.calls
        const index = data.findIndex((call) => call.id === callId)
        const call = { ...data[index], queries }
        return update(state, {
          callHistory: { calls: { data: { [index]: { $set: call } } } }
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
      case 'STORE_SESSION': {
        const { session } = action.payload
        if (!session || !session.username) {
          const sessionId = session ? session.sessionId : 'N/A'
          // Session is invalid if username is missing.
          window.alert(`Session ID ${sessionId} is invalid!`)
          // TODO: Should we return to window.location.origin at this point?
          return update(state, { session: { $set: null } })
        }
        return update(state, { session: { $set: session } })
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
