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
 * Helper function that
 * - extracts key variables from the state
 *   (state.otp.config.persistence.otp_middleware, state.user.accessToken, state.user.loggedIUnUser)
 * - checks that otp_middleware is set, and throws an error if not.
 * @param functionToExecute the code to execute, with parameters (dispatch, otpMiddleware, accessToken, loggedInUser)
 * @return an action of type ()
 */
function executeWithMiddleware (functionToExecute) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken, loggedInUser } = user
      functionToExecute(dispatch, otpMiddleware, accessToken, loggedInUser)
    } else {
      throw new Error('This action requires a valid middleware configuration.')
    }
  }
}

/**
 * Fetches the saved/monitored trips for a user.
 * We use the accessToken to fetch the data regardless of
 * whether the process to populate state.user is completed or not.
 */
export function fetchUserMonitoredTrips (accessToken) {
  return executeWithMiddleware(async (dispatch, otpMiddleware) => {
    const { data: trips, status: fetchStatus } = await getTrips(otpMiddleware, accessToken)
    if (fetchStatus === 'success') {
      dispatch(setCurrentUserMonitoredTrips(trips))
    }
  })
}

/**
 * Fetches user preferences to state.user, or set initial values under state.user if no user has been loaded.
 */
export function fetchOrInitializeUser (auth) {
  return executeWithMiddleware(async (dispatch, otpMiddleware) => {
    const { accessToken, user: authUser } = auth
    const { data: user, status: fetchUserStatus } = await fetchUser(otpMiddleware, accessToken)

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

    const isNewAccount = fetchUserStatus === 'error' || (user && user.result === 'ERR')
    if (!isNewAccount) {
      // Load user's monitored trips before setting the user state.
      await dispatch(fetchUserMonitoredTrips(accessToken))

      dispatch(setCurrentUser({ accessToken, user }))
    } else {
      dispatch(setCurrentUser({ accessToken, user: createNewUser(authUser) }))
    }
  })
}

/**
 * Updates (or creates) a user entry in the middleware,
 * then, if that was successful, updates the redux state with that user.
 * @param userData the user entry to persist.
 * @param silentOnSuccess true to suppress the confirmation if the operation is successful (e.g. immediately after user accepts the terms).
 */
export function createOrUpdateUser (userData, silentOnSuccess = false) {
  return executeWithMiddleware(async (dispatch, otpMiddleware, accessToken, loggedInUser) => {
    let result
    if (isNewUser(loggedInUser)) {
      result = await addUser(otpMiddleware, accessToken, userData)
    } else {
      result = await updateUser(otpMiddleware, accessToken, userData)
    }

    // TODO: improve the UI feedback messages for this.
    if (result.status === 'success' && result.data) {
      if (!silentOnSuccess) {
        alert('Your preferences have been saved.')
      }

      // Update application state with the user entry as saved
      // (as returned) by the middleware.
      const newUserData = result.data
      dispatch(setCurrentUser({ accessToken, user: newUserData }))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(result)}`)
    }
  })
}

/**
 * Updates a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips
 * with the updated trip.
 */
export function createOrUpdateUserMonitoredTrip (tripData, isNew) {
  return executeWithMiddleware(async (dispatch, otpMiddleware, accessToken) => {
    let result
    if (isNew) {
      result = await addTrip(otpMiddleware, accessToken, tripData)
    } else {
      result = await updateTrip(otpMiddleware, accessToken, tripData)
    }

    // TODO: improve the UI feedback messages for this.
    if (result.status === 'success' && result.data) {
      alert('Your preferences have been saved.')

      // Reload user's monitored trips after add/update.
      await dispatch(fetchUserMonitoredTrips(accessToken))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(result)}`)
    }
  })
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function deleteUserMonitoredTrip (id) {
  return executeWithMiddleware(async (dispatch, otpMiddleware, accessToken) => {
    const deleteResult = await deleteTrip(otpMiddleware, accessToken, id)

    if (deleteResult.status === 'success') {
      // Reload user's monitored trips after deletion.
      await dispatch(fetchUserMonitoredTrips(accessToken))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(deleteResult)}`)
    }
  })
}
