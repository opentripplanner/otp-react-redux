import update from 'immutability-helper'

function createOtpUserReducer () {
  const initialState = {}
  return (state = initialState, action) => {
    switch (action.type) {
      case 'SET_CURRENT_USER': {
        return update(state, {
          accessToken: { $set: action.payload.accessToken },
          loggedInUser: { $set: action.payload.user }
        })
      }
      default:
        return state
    }
  }
}

export default createOtpUserReducer
