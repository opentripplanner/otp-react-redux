import update from 'immutability-helper'

// TODO: port user-specific code from the otp reducer.
function createUserReducer () {
  const initialState = {}

  return (state = initialState, action) => {
    switch (action.type) {
      case 'SET_CURRENT_USER': {
        return update(state, {
          accessToken: { $set: action.payload.accessToken },
          loggedInUser: { $set: action.payload.user }
        })
      }

      case 'SET_CURRENT_USER_MONITORED_TRIPS': {
        return update(state, {
          loggedInUserMonitoredTrips: { $set: action.payload }
        })
      }

      case 'SET_PATH_BEFORE_SIGNIN': {
        return update(state, {
          pathBeforeSignIn: { $set: action.payload }
        })
      }

      default:
        return state
    }
  }
}

export default createUserReducer
