import update from 'immutability-helper'

// TODO: port user-specific code from the otp reducer.
function createUserReducer () {
  const initialState = {
    accessToken: null,
    itineraryAvailability: null,
    lastPhoneSmsRequest: {
      number: null,
      status: null,
      timestamp: new Date(0)
    },
    loggedInUser: null,
    loggedInUserMonitoredTrips: null,
    pathBeforeSignIn: null
  }

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

      case 'SET_LAST_PHONE_SMS_REQUEST': {
        return update(state, {
          lastPhoneSmsRequest: { $set: action.payload }
        })
      }

      case 'SET_ITINERARY_AVAILABILITY': {
        return update(state, {
          itineraryAvailability: { $set: action.payload }
        })
      }

      case 'CLEAR_ITINERARY_AVAILABILITY': {
        return update(state, {
          itineraryAvailability: { $set: null }
        })
      }

      default:
        return state
    }
  }
}

export default createUserReducer
