import update from 'immutability-helper'

// TODO: port user-specific code from the otp reducer.
function createUserReducer () {
  const initialState = {}

  return (state = initialState, action) => {
    switch (action.type) {
      case 'SET_CURRENT_USER': {
        const { accessToken, isEmailVerified, user } = action.payload

        // Only change the email verified state if it was passed in the payload.
        const emailVerifiedPart = isEmailVerified ? { isEmailVerified: { $set: isEmailVerified } } : {}

        return update(state, {
          ...emailVerifiedPart,
          accessToken: { $set: accessToken },
          loggedInUser: { $set: user }
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
