import { createAction } from 'redux-actions'

import { secureFetch } from '../util/middleware'
import { isNewUser } from '../util/user'

// Middleware API paths.
const API_MONITORTRIP_PATH = '/api/secure/monitoredtrip'
const API_USER_PATH = '/api/secure/user'
const API_USER_VERIFYSMS_PATH = '/verify_sms'

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
 * - extracts key variables from the state and passes them to the code to execute:
 *     - apiKey and apiBaseUrl from state.otp.config.persistence.otp_middleware,
 *     - accessToken and loggedIUnUser from state.user.
 * - checks that otp_middleware is set, and throws an error if not.
 * @param functionToExecute a function that can be waited upon,
 *   with parameters (dispatch, arguments), that contains the code to be
 *   executed if the OTP middleware is configured.
 * @return a redux action for the code to be executed.
 */
function executeWithMiddleware (functionToExecute) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken, loggedInUser } = user
      const { apiBaseUrl, apiKey } = otpMiddleware
      await functionToExecute(dispatch, {
        accessToken,
        apiBaseUrl,
        apiKey,
        loggedInUser
      })
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
  return executeWithMiddleware(async (dispatch, { apiBaseUrl, apiKey }) => {
    const requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}`

    const { data: trips, status } = await secureFetch(requestUrl, accessToken, apiKey, 'GET')
    if (status === 'success') {
      dispatch(setCurrentUserMonitoredTrips(trips))
    }
  })
}

/**
 * Fetches user preferences to state.user,
 * or set initial values under state.user if no user has been loaded.
 */
export function fetchOrInitializeUser (auth) {
  return executeWithMiddleware(async (dispatch, { apiBaseUrl, apiKey }) => {
    const { accessToken, user: authUser } = auth
    const requestUrl = `${apiBaseUrl}${API_USER_PATH}/fromtoken`

    const { data: user, status } = await secureFetch(requestUrl, accessToken, apiKey)

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

    const isNewAccount = status === 'error' || (user && user.result === 'ERR')
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
  return executeWithMiddleware(async (dispatch, { accessToken, apiBaseUrl, apiKey, loggedInUser }) => {
    const { id } = userData // Middleware ID, NOT auth0 (or similar) id.
    let requestUrl, method

    // Determine URL and method to use.
    if (isNewUser(loggedInUser)) {
      requestUrl = `${apiBaseUrl}${API_USER_PATH}`
      method = 'POST'
    } else if (id) {
      requestUrl = `${apiBaseUrl}${API_USER_PATH}/${id}`
      method = 'PUT'
    }

    if (requestUrl) {
      const result = await secureFetch(requestUrl, accessToken, apiKey, method, {
        body: JSON.stringify(userData)
      })

      // TODO: improve the UI feedback messages for this.
      if (result.status === 'success' && result.data) {
        if (!silentOnSuccess) {
          alert('Your preferences have been saved.')
        }

        // Update application state with the user entry as saved
        // (as returned) by the middleware.
        dispatch(setCurrentUser({ accessToken, user: result.data }))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(result)}`)
      }
    } else {
      alert('Corrupted state: User ID not available for exiting user.')
    }
  })
}

/**
 * Updates a logged-in user's monitored trip,
 * then, if that was successful, alerts (optional)
 * and refreshes the redux monitoredTrips with the updated trip.
 */
export function createOrUpdateUserMonitoredTrip (tripData, isNew, silentOnSuccess) {
  return executeWithMiddleware(async (dispatch, { accessToken, apiBaseUrl, apiKey }) => {
    const { id } = tripData
    let requestUrl, method

    // Determine URL and method to use.
    if (isNew) {
      requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}`
      method = 'POST'
    } else if (id) {
      requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}/${id}`
      method = 'PUT'
    }

    if (requestUrl) {
      const result = await secureFetch(requestUrl, accessToken, apiKey, method, {
        body: JSON.stringify(tripData)
      })

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
    } else {
      alert('Corrupted state: Trip ID not available for exiting trip.')
    }
  })
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function deleteUserMonitoredTrip (id) {
  return executeWithMiddleware(async (dispatch, { accessToken, apiBaseUrl, apiKey }) => {
    const requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}/${id}`

    if (id) {
      const deleteResult = secureFetch(requestUrl, accessToken, apiKey, 'DELETE')
      if (deleteResult.status === 'success') {
        // Reload user's monitored trips after deletion.
        await dispatch(fetchUserMonitoredTrips(accessToken))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(deleteResult)}`)
      }
    } else {
      alert('Corrupted state: Monitored Trip ID not available for exiting user.')
    }
  })
}

/**
 * Requests a verification code via SMS for the logged-in user.
 */
export function requestPhoneVerificationSms (userId, newPhoneNumber) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user

      // Send the SMS request with the phone number to update.
      const requestUrl = `${apiBaseUrl}${API_USER_PATH}/${userId}${API_USER_VERIFYSMS_PATH}/${encodeURIComponent(newPhoneNumber)}`
      const sendSmsResult = secureFetch(requestUrl, accessToken, apiKey, 'GET')

      if (sendSmsResult.status === 'success') {
        // Refetch user and update application state with new phone number and verification status.
        // (This also refetches the user's monitored trip, and that's ok.)
        await dispatch(fetchOrInitializeUser({ accessToken }))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(sendSmsResult)}`)
      }
    }
  }
}

/**
 * Validate the phone number verification code for the logged-in user.
 */
export function verifyPhoneNumber (userId, code) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user
      const requestUrl = `${apiBaseUrl}${API_USER_PATH}/${userId}${API_USER_VERIFYSMS_PATH}/${code}`
      const sendResult = secureFetch(requestUrl, accessToken, apiKey, 'POST')
      
      // If the check is successful, status in the returned data will be "approved".
      if (sendResult.status === 'success' && sendResult.data) {
        if (sendResult.data.status === 'approved') {
          // Refetch user and update application state with new phone number and verification status.
          // (This also refetches the user's monitored trip, and that's ok.)
          await dispatch(fetchOrInitializeUser({ accessToken }))
        } else {
          alert('You entered in incorrect validation code. Please try again.')
        }
      } else {
        alert(`Your phone could not be verified:\n${JSON.stringify(sendResult)}`)
      }
    }
  }
}
