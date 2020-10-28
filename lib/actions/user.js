import { createAction } from 'redux-actions'

import { routeTo } from './ui'
import { secureFetch } from '../util/middleware'
import { isNewUser } from '../util/user'

// Middleware API paths.
const API_MONITORTRIP_PATH = '/api/secure/monitoredtrip'
const API_OTPUSER_PATH = '/api/secure/user'
const API_OTPUSER_VERIFYSMS_PATH = '/verify_sms'

const setCurrentUser = createAction('SET_CURRENT_USER')
const setCurrentUserMonitoredTrips = createAction('SET_CURRENT_USER_MONITORED_TRIPS')
const setLastPhoneSmsRequest = createAction('SET_LAST_PHONE_SMS_REQUEST')
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
 * Extracts accessToken, loggedInUser from the redux state,
 * and apiBaseUrl, apiKey from the middleware configuration.
 * If the middleware configuration does not exist, throws an error.
 */
function getMiddlewareVariables (state) {
  const { otp, user } = state
  const { otp_middleware: otpMiddleware = null } = otp.config.persistence

  if (otpMiddleware) {
    const { accessToken, loggedInUser } = user
    const { apiBaseUrl, apiKey } = otpMiddleware
    return {
      accessToken,
      apiBaseUrl,
      apiKey,
      loggedInUser
    }
  } else {
    throw new Error('This action requires config.yml#persistence#otp_middleware to be defined.')
  }
}

/**
 * Fetches the saved/monitored trips for a user.
 * We use the accessToken to fetch the data regardless of
 * whether the process to populate state.user is completed or not.
 */
export function fetchOrInitializeUser (auth0) {
  return async function (dispatch, getState) {
    const { apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/fromtoken`

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
      const { user: authUser } = auth0
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
      const userData = isNewAccount ? createNewUser(authUser) : user
      dispatch(setCurrentUser({ accessToken, user: userData }))

      // Also load monitored trips for existing users.
      if (!isNewAccount) {
        dispatch(fetchUserMonitoredTrips())
      }
    }
  }
}

/**
 * Updates (or creates) a user entry in the middleware,
 * then, if that was successful, updates the redux state with that user.
 * @param userData the user entry to persist.
 * @param silentOnSuccess true to suppress the confirmation if the operation is successful (e.g. immediately after user accepts the terms).
 */
export function createOrUpdateUser (userData, silentOnSuccess = false) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } = getMiddlewareVariables(getState())
    const { id } = userData // Middleware ID, NOT auth0 (or similar) id.
    let requestUrl, method

    // Determine URL and method to use.
    if (isNewUser(loggedInUser)) {
      requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}`
      method = 'POST'
    } else {
      requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${id}`
      method = 'PUT'
    }

    const { data, message, status } = await secureFetch(requestUrl, accessToken, apiKey, method, {
      body: JSON.stringify(userData)
    })

    // TODO: improve the UI feedback messages for this.
    if (status === 'success' && data) {
      if (!silentOnSuccess) {
        alert('Your preferences have been saved.')
      }

      // Update application state with the user entry as saved
      // (as returned) by the middleware.
      dispatch(setCurrentUser({ accessToken, user: data }))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Fetches the saved/monitored trips for a user.
 * We use the accessToken to fetch the data regardless of
 * whether the process to populate state.user is completed or not.
 */
export function fetchUserMonitoredTrips () {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}`

    const { data: trips, status } = await secureFetch(requestUrl, accessToken, apiKey, 'GET')
    if (status === 'success') {
      dispatch(setCurrentUserMonitoredTrips(trips.data))
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
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const { id } = tripData
    let requestUrl, method

    // Determine URL and method to use.
    if (isNew) {
      requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}`
      method = 'POST'
    } else {
      requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}/${id}`
      method = 'PUT'
    }

    const { data, message, status } = await secureFetch(requestUrl, accessToken, apiKey, method, {
      body: JSON.stringify(tripData)
    })

    // TODO: improve the UI feedback messages for this.
    if (status === 'success' && data) {
      if (!silentOnSuccess) {
        alert('Your preferences have been saved.')
      }

      // Reload user's monitored trips after add/update.
      await dispatch(fetchUserMonitoredTrips())

      // Finally, navigate to the saved trips page.
      dispatch(routeTo('/savedtrips'))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function deleteUserMonitoredTrip (tripId) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_MONITORTRIP_PATH}/${tripId}`

    const { message, status } = await secureFetch(requestUrl, accessToken, apiKey, 'DELETE')
    if (status === 'success') {
      // Reload user's monitored trips after deletion.
      dispatch(fetchUserMonitoredTrips())
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Requests a verification code via SMS for the logged-in user.
 */
export function requestPhoneVerificationSms (newPhoneNumber) {
  return async function (dispatch, getState) {
    const state = getState()
    const { number, timestamp } = state.user.lastPhoneSmsRequest
    const now = new Date()

    // Request a new verification code if we are requesting a different number.
    // or enough time has ellapsed since the last request (1 minute?).
    // TODO: Should throttling be handled in the middleware?
    if (number !== newPhoneNumber || (now - timestamp) >= 60000) {
      const { accessToken, apiBaseUrl, apiKey, loggedInUser } = getMiddlewareVariables(state)
      const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${loggedInUser.id}${API_OTPUSER_VERIFYSMS_PATH}/${encodeURIComponent(newPhoneNumber)}`

      const { message, status } = await secureFetch(requestUrl, accessToken, apiKey, 'GET')

      dispatch(setLastPhoneSmsRequest({
        number: newPhoneNumber,
        status,
        timestamp: now
      }))

      if (status === 'success') {
        // Refetch user and update application state with new phone number and verification status.
        // (This also refetches the user's monitored trip, and that's ok.)
        dispatch(fetchOrInitializeUser({ accessToken }))
      } else {
        alert(`An error was encountered:\n${JSON.stringify(message)}`)
      }
    } else {
      // Alert user if they have been throttled.
      // TODO: improve this alert.
      alert('A verification SMS was sent to the indicated phone number less than a minute ago. Please try again in a few moments.')
    }
  }
}

/**
 * Validate the phone number verification code for the logged-in user.
 */
export function verifyPhoneNumber (code) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${loggedInUser.id}${API_OTPUSER_VERIFYSMS_PATH}/${code}`

    const { data, status } = await secureFetch(requestUrl, accessToken, apiKey, 'POST')

    // If the check is successful, status in the returned data will be "approved".
    if (status === 'success' && data) {
      if (data.status === 'approved') {
        // Refetch user and update application state with new phone number and verification status.
        // (This also refetches the user's monitored trip, and that's ok.)
        dispatch(fetchOrInitializeUser({ accessToken }))
      } else {
        // Otherwise, the user entered a wrong/incorrect code.
        alert('The code you entered is invalid. Please try again.')
      }
    } else {
      // This happens when an error occurs on backend side, especially
      // when the code has expired (or was cancelled by Twilio after too many attempts).
      alert(`Your phone could not be verified. Perhaps the code you entered has expired. Please request a new code and try again.`)
    }
  }
}
