import { createAction } from 'redux-actions'

import { fetchUser } from '../util/middleware'

export const settingCurrentUser = createAction('SET_CURRENT_USER')

export function setCurrentUser (user) {
  return function (dispatch, getState) {
    dispatch(settingCurrentUser(user))
  }
}

function getStateForNewUser (auth0User) {
  return {
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false, // User must agree to terms.
    isEmailVerified: auth0User.email_verified,
    notificationChannel: 'email',
    phoneNumber: '',
    recentLocations: [],
    savedLocations: [],
    storeTripHistory: false // User must opt in.
  }
}

/**
 * Fetches user preferences or sets an initial state to state.otp.loggedInUser if it is null.
 */
export function ensureLoggedInUserIsFetched (auth) {
  return async function (dispatch, getState) {
    const { otp } = getState()
    const loggedInUser = otp.user.loggedInUser
    const persistence = otp.config.persistence

    if (auth.isAuthenticated && !loggedInUser) {
      try {
        const result = await fetchUser(
          persistence.otp_middleware,
          auth.accessToken,
          auth.user.sub
        )

        // Beware! On AWS, for a nonexistent user, the call above will return, for example:
        // {
        //    status: 'success',
        //    data: {
        //      "result": "ERR",
        //      "message": "No user with auth0UserId=000000 found.",
        //      "code": 404,
        //      "detail": null
        //    }
        // }
        //
        // On direct middleware interface, for a nonexistent user, the call above will return:
        // {
        //    status: 'error',
        //    message: 'Error get-ing user...'
        // }
        // TODO: Improve AWS response.

        const resultData = result.data
        const isNewAccount = result.status === 'error' || (resultData && resultData.result === 'ERR')

        if (!isNewAccount) {
          // TODO: Move next line somewhere else.
          if (resultData.savedLocations === null) resultData.savedLocations = []
          dispatch(settingCurrentUser(resultData))
        } else {
          dispatch(settingCurrentUser(getStateForNewUser(auth.user)))
        }
      } catch (error) {
        // TODO: improve error handling.
        alert(`An error was encountered:\n${error}`)
      }
    }
  }
}
