import update from 'immutability-helper'

// TODO: port user-specific code from the otp reducer.
function createUserReducer () {
  const initialState = {
    accessToken: null,
    auth0User: null,
    loggedInUser: null
  }

  return (state = initialState, action) => {
    switch (action.type) {
      case 'SET_CURRENT_USER': {
        const { accessToken, auth0User, user } = action.payload

        // Only change the auth0 state if it was passed in the payload.
        const auth0UserPart = auth0User ? { auth0User: { $set: auth0User } } : {}

        return update(state, {
          ...auth0UserPart,
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
