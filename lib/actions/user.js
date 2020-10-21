import { createAction } from 'redux-actions'

import {
  addTrip,
  addUser,
  deleteTrip,
  fetchUser,
  getTrips,
  updateTrip,
  updateUser
} from '../util/middleware'
import { isNewUser } from '../util/user'

const setCurrentUser = createAction('SET_CURRENT_USER')
const setCurrentUserMonitoredTrips = createAction('SET_CURRENT_USER_MONITORED_TRIPS')
export const setPathBeforeSignIn = createAction('SET_PATH_BEFORE_SIGNIN')

function createNewUser (auth0User) {
  return {
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false, // User must agree to terms.
    notificationChannel: 'email',
    phoneNumber: '',
    savedLocations: [],
    storeTripHistory: false // User must opt in.
  }
}

/**
 * Fetches the saved/monitored trips for a user.
 * We use the accessToken to fetch the data regardless of
 * whether the process to populate state.user is completed or not.
 */
export function fetchUserMonitoredTrips (accessToken) {
  return async function (dispatch, getState) {
    const { otp } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { data: trips, status: fetchStatus } = await getTrips(otpMiddleware, accessToken)
      if (fetchStatus === 'success') {
        dispatch(setCurrentUserMonitoredTrips(trips))
      }
    }
  }
}

/**
 * Fetches user preferences to state.user, or set initial values under state.user if no user has been loaded.
 */
export function fetchOrInitializeUser (auth0) {
  return async function (dispatch, getState) {
    const { otp } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      // First, get the Auth0 access token.
      let accessToken
      try {
        accessToken = await auth0.getAccessTokenSilently()
      } catch (error) {
        // TODO: improve UI if there is an errror.
        alert('Error obtaining an authorization token.')
      }

      // Once accessToken is available, proceed to fetch or initialize loggedInUser.
      if (accessToken) {
        const { user: auth0User } = auth0
        const { data: user, status: fetchStatus } = await fetchUser(otpMiddleware, accessToken)

        // Beware! On AWS API gateway, if a user is not found in the middleware
        // (e.g. they just created their Auth0 password but have not completed the account setup form yet),
        // the call above will return, for example:
        // {
        //    status: 'success',
        //    data: {
        //      "result": "ERR",
        //      "message": "No user with id=000000 found.",
        //      "code": 404,
        //      "detail": null
        //    }
        // }
        //
        // The same call to a middleware instance that is not behind an API gateway
        // will return:
        // {
        //    status: 'error',
        //    message: 'Error get-ing user...'
        // }
        // TODO: Improve AWS response.

        const isNewAccount = fetchStatus === 'error' || (user && user.result === 'ERR')

        // Store the new/existing user data,
        // and also the auth0 access token and email verification state
        // (so they don't need to be retrieved again from the auth0 object).
        if (!isNewAccount) {
          // Load user's monitored trips before setting the user state,
          // so that we call setCurrentUser to set state.user.loggedInUser,
          // other parts of the UI can assume that any monitored trips have already been fetched.
          await dispatch(fetchUserMonitoredTrips(accessToken))

          dispatch(setCurrentUser({ accessToken, auth0User, user }))
        } else {
          dispatch(setCurrentUser({ accessToken, auth0User, user: createNewUser(auth0User) }))
        }
      }
    }
  }
}

/**
 * Updates (or creates) a user entry in the middleware,
 * then, if that was successful, updates the redux state with that user.
 */
export function createOrUpdateUser (userData) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken, loggedInUser } = user

      let result
      if (isNewUser(loggedInUser)) {
        result = await addUser(otpMiddleware, accessToken, userData)
      } else {
        result = await updateUser(otpMiddleware, accessToken, userData)
      }

      // TODO: improve the UI feedback messages for this.
      if (result.status === 'success' && result.data) {
        alert('Your preferences have been saved.')

        // Update application state with the user entry as saved
        // (as returned) by the middleware.
        const userData = result.data
        dispatch(setCurrentUser({ accessToken, user: userData }))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    }
  }
}

/**
 * Updates a logged-in user's monitored trip,
 * then, if that was successful, alerts (optional)
 * and refreshes the redux monitoredTrips with the updated trip.
 */
export function createOrUpdateUserMonitoredTrip (tripData, isNew, silentOnSuccess) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user

      let result
      if (isNew) {
        result = await addTrip(otpMiddleware, accessToken, tripData)
      } else {
        result = await updateTrip(otpMiddleware, accessToken, tripData)
      }

      // TODO: improve the UI feedback messages for this.
      if (result.status === 'success' && result.data) {
        if (!silentOnSuccess) {
          alert('Your preferences have been saved.')
        }

        // Reload user's monitored trips after add/update.
        await dispatch(fetchUserMonitoredTrips(accessToken))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    }
  }
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function deleteUserMonitoredTrip (id) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user
      const deleteResult = await deleteTrip(otpMiddleware, accessToken, id)

      if (deleteResult.status === 'success') {
        // Reload user's monitored trips after deletion.
        await dispatch(fetchUserMonitoredTrips(accessToken))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(deleteResult)}`)
      }
    }
  }
}
