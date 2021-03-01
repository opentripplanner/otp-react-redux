import clone from 'clone'
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'
import { createAction } from 'redux-actions'

import { routingQuery } from './api'
import { setQueryParam } from './form'
import { routeTo } from './ui'
import {
  PERSIST_TO_LOCAL_STORAGE,
  PERSIST_TO_OTP_MIDDLEWARE,
  TRIPS_PATH,
  URL_ROOT
} from '../util/constants'
import { secureFetch } from '../util/middleware'
import { isBlank } from '../util/ui'
import { convertToPlace, getPersistenceStrategy, isHomeOrWork, isNewUser, positionHomeAndWorkFirst } from '../util/user'

const { planParamsToQuery } = coreUtils.query
const { OTP_API_DATE_FORMAT } = coreUtils.time

// Middleware API paths.
const API_MONITORED_TRIP_PATH = '/api/secure/monitoredtrip'
const API_TRIP_HISTORY_PATH = '/api/secure/triprequests'
const API_OTPUSER_PATH = '/api/secure/user'
const API_OTPUSER_VERIFY_SMS_SUBPATH = '/verify_sms'

// Middleware user actions
const setAccessToken = createAction('SET_ACCESS_TOKEN')
const setCurrentUser = createAction('SET_CURRENT_USER')
const setCurrentUserMonitoredTrips = createAction('SET_CURRENT_USER_MONITORED_TRIPS')
const setCurrentUserTripRequests = createAction('SET_CURRENT_USER_TRIP_REQUESTS')
const setLastPhoneSmsRequest = createAction('SET_LAST_PHONE_SMS_REQUEST')
export const setPathBeforeSignIn = createAction('SET_PATH_BEFORE_SIGNIN')
export const clearItineraryExistence = createAction('CLEAR_ITINERARY_EXISTENCE')
const setitineraryExistence = createAction('SET_ITINERARY_EXISTENCE')

// localStorage user actions
export const deleteLocalUserRecentPlace = createAction('DELETE_LOCAL_USER_RECENT_PLACE')
export const deleteLocalUserSavedPlace = createAction('DELETE_LOCAL_USER_SAVED_PLACE')
export const deleteLocalUserStop = createAction('FORGET_STOP')
const rememberLocalUserPlace = createAction('REMEMBER_LOCAL_USER_PLACE')

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
 * Attempts to fetch the auth0 access token and store it in the redux state, under state.user.
 * @param auth0 The auth0 context used to obtain the access token for subsequent middleware fetches.
 */
export function fetchAuth0Token (auth0) {
  return async function (dispatch, getState) {
    try {
      const accessToken = await auth0.getAccessTokenSilently()

      dispatch(setAccessToken(accessToken))
    } catch (error) {
      // TODO: improve UI if there is an error.
      alert('Error obtaining an authorization token.')
    }
  }
}

/**
 * Updates the redux state with the provided user data, including
 * placing the Home and Work locations at the beginning of the list
 * of saved places for rendering in several UI components.
 *
 * Also, fetches monitored trips if requested, i.e. when
 * - initializing the user state with an existing persisted user, or
 * - POST-ing a user for the first time.
 */
function setUser (user, fetchTrips) {
  return function (dispatch, getState) {
    positionHomeAndWorkFirst(user)

    dispatch(setCurrentUser(user))

    if (fetchTrips) {
      dispatch(fetchMonitoredTrips())
      dispatch(fetchTripRequests())
    }
  }
}

/**
 * Attempts to fetch user preferences (or set initial values if the user is being created)
 * into the redux state, under state.user.
 * @param auth0User If provided, the auth0.user object used to initialize the default user object (with email and auth0 id).
 */
export function fetchOrInitializeUser (auth0User) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/fromtoken`

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
    const userData = isNewAccount ? createNewUser(auth0User) : user

    // Set user in redux state.
    // (This sorts saved places, and, for existing users, fetches trips.)
    dispatch(setUser(userData, !isNewAccount))
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
    let method, requestUrl

    // Before persisting, filter out entries from userData.savedLocations with blank addresses.
    userData.savedLocations = userData.savedLocations.filter(
      ({ address }) => !isBlank(address)
    )

    // Determine URL and method to use.
    const isCreatingUser = isNewUser(loggedInUser)
    if (isCreatingUser) {
      requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}`
      method = 'POST'
    } else {
      requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${id}`
      method = 'PUT'
    }

    const { data: returnedUser, message, status } = await secureFetch(requestUrl, accessToken, apiKey, method, {
      body: JSON.stringify(userData)
    })

    // TODO: improve the UI feedback messages for this.
    if (status === 'success' && returnedUser) {
      if (!silentOnSuccess) {
        alert('Your preferences have been saved.')
      }

      // Update application state with the user entry as saved
      // (as returned) by the middleware.
      // (This sorts saved places, and, for existing users, fetches trips.)
      dispatch(setUser(returnedUser, isCreatingUser))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Deletes a user (and their corresponding trips, requests, etc.) from the
 * middleware database.
 * @param userData the user account to delete
 * @param auth0 auth0 object (gives access to logout function)
 */
export function deleteUser (userData, auth0) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const { id } = userData // Middleware ID, NOT auth0 (or similar) id.
    const { data: deletedUser, message, status } = await secureFetch(
      `${apiBaseUrl}${API_OTPUSER_PATH}/${id}`,
      accessToken,
      apiKey,
      'DELETE'
    )
    // TODO: improve the UI feedback messages for this.
    if (status === 'success' && deletedUser) {
      alert(`Your user account (${userData.email}) has been deleted.`)
      // Log out user and route them to the home page.
      auth0.logout({returnTo: URL_ROOT})
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Requests the verification email for the new user to be resent.
 */
export function resendVerificationEmail () {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())

    // TODO: add any throttling.
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/verification-email`
    const { status } = await secureFetch(requestUrl, accessToken, apiKey)

    // TODO: improve the UI feedback messages for this.
    if (status === 'success') {
      alert('The email verification message has been resent.')
    }
  }
}

/**
 * Converts a middleware trip request to the search format.
 */
function convertRequestToSearch (config) {
  return function (tripRequest) {
    const { id, dateCreated, queryParams } = tripRequest
    const { host, path } = config.api
    return {
      canDelete: false,
      id,
      query: planParamsToQuery(qs.parse(queryParams)),
      timestamp: dateCreated,
      url: `${host}${path}/plan?${queryParams}`
    }
  }
}

/**
 * Fetches the most recent (default 10) trip history for a user.
 */
export function fetchTripRequests () {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_TRIP_HISTORY_PATH}?userId=${loggedInUser.id}`

    const { data: requests, status: emptyStatus } = await secureFetch(`${requestUrl}&limit=0`, accessToken, apiKey, 'GET')
    const DEFAULT_LIMIT = 10

    if (emptyStatus === 'success') {
      const { data: trips, status } = await secureFetch(`${requestUrl}&offset=${requests.total - DEFAULT_LIMIT}`, accessToken, apiKey, 'GET')
      if (status === 'success') {
        // Convert tripRequests to search format.
        const convertedTrips = trips.data.map(convertRequestToSearch(getState().otp.config))
        dispatch(setCurrentUserTripRequests(convertedTrips))
      }
    }
  }
}

/**
 * Fetches the most saved/monitored trips for a user.
 */
export function fetchMonitoredTrips () {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}`

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
export function createOrUpdateUserMonitoredTrip (
  tripData,
  isNew,
  silentOnSuccess,
  noRedirect
) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const { id } = tripData
    let method, requestUrl

    // Determine URL and method to use.
    if (isNew) {
      requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}`
      method = 'POST'
    } else {
      requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}/${id}`
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
      await dispatch(fetchMonitoredTrips())

      if (noRedirect) return

      // Finally, navigate to the saved trips page.
      dispatch(routeTo(TRIPS_PATH))
    } else {
      alert(`An error was encountered:\n${JSON.stringify(message)}`)
    }
  }
}

/**
 * Toggles the isActive status of a monitored trip
 */
export function togglePauseTrip (trip) {
  return function (dispatch, getState) {
    const clonedTrip = clone(trip)
    clonedTrip.isActive = !clonedTrip.isActive

    // Silent update of existing trip.
    dispatch(createOrUpdateUserMonitoredTrip(clonedTrip, false, true, true))
  }
}

/**
 * Toggles the snoozed status of a monitored trip
 */
export function toggleSnoozeTrip (trip) {
  return function (dispatch, getState) {
    const newTrip = clone(trip)
    newTrip.snoozed = !newTrip.snoozed

    // Silent update of existing trip.
    dispatch(createOrUpdateUserMonitoredTrip(newTrip, false, true, true))
  }
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function confirmAndDeleteUserMonitoredTrip (tripId) {
  return async function (dispatch, getState) {
    if (!confirm('Would you like to remove this trip?')) return

    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}/${tripId}`

    const { message, status } = await secureFetch(requestUrl, accessToken, apiKey, 'DELETE')
    if (status === 'success') {
      // Reload user's monitored trips after deletion.
      dispatch(fetchMonitoredTrips())
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
    // or enough time has elapsed since the last request (1 minute?).
    // TODO: Should throttling be handled in the middleware?
    if (number !== newPhoneNumber || (now - timestamp) >= 60000) {
      const { accessToken, apiBaseUrl, apiKey, loggedInUser } = getMiddlewareVariables(state)
      const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${loggedInUser.id}${API_OTPUSER_VERIFY_SMS_SUBPATH}/${encodeURIComponent(newPhoneNumber)}`

      const { message, status } = await secureFetch(requestUrl, accessToken, apiKey, 'GET')

      dispatch(setLastPhoneSmsRequest({
        number: newPhoneNumber,
        status,
        timestamp: now
      }))

      if (status === 'success') {
        // Refetch user and update application state with new phone number and verification status.
        dispatch(fetchOrInitializeUser())
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
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${loggedInUser.id}${API_OTPUSER_VERIFY_SMS_SUBPATH}/${code}`

    const { data, status } = await secureFetch(requestUrl, accessToken, apiKey, 'POST')

    // If the check is successful, status in the returned data will be "approved".
    if (status === 'success' && data) {
      if (data.status === 'approved') {
        // Refetch user and update application state with new phone number and verification status.
        dispatch(fetchOrInitializeUser())
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

/**
 * Check itinerary existence for the given monitored trip.
 */
export function checkItineraryExistence (trip) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}/checkitinerary`

    // Empty state before performing the checks.
    dispatch(clearItineraryExistence())

    const { data, status } = await secureFetch(requestUrl, accessToken, apiKey, 'POST', {
      body: JSON.stringify(trip)
    })

    if (status === 'success' && data) {
      dispatch(setitineraryExistence(data))
    } else {
      alert('Error checking whether your selected trip is possible.')
    }
  }
}

/**
 * Plans a new trip for the current date given the query parameters in the given
 * monitored trip
 */
export function planNewTripFromMonitoredTrip (monitoredTrip) {
  return function (dispatch, getState) {
    // update query params in store
    const newQuery = planParamsToQuery(qs.parse(monitoredTrip.queryParams))
    newQuery.date = moment().format(OTP_API_DATE_FORMAT)

    dispatch(setQueryParam(newQuery))

    dispatch(routeTo('/'))

    // This prevents some kind of race condition whose origin I can't figure
    // out. Unless this is called after redux catches up with routing to the '/'
    // path, then the old path will be used and the screen won't change.
    // Therefore, this timeout occurs so that the view of the homepage has time
    // to render itself.
    // FIXME: remove hack
    setTimeout(() => {
      dispatch(routingQuery())
    }, 300)
  }
}

/**
 * Saves the given place data at the specified index for the logged-in user.
 * Note: places with blank addresses will not appear in persistence.
 */
export function saveUserPlace (placeToSave, placeIndex) {
  return function (dispatch, getState) {
    const { loggedInUser } = getState().user

    if (placeIndex === 'new') {
      loggedInUser.savedLocations.push(placeToSave)
    } else {
      loggedInUser.savedLocations[placeIndex] = placeToSave
    }

    dispatch(createOrUpdateUser(loggedInUser, true))
  }
}

/**
 * Delete the place data at the specified index for the logged-in user.
 */
export function deleteLoggedInUserPlace (placeIndex) {
  return function (dispatch, getState) {
    if (!confirm('Would you like to remove this place?')) return

    const { loggedInUser } = getState().user
    loggedInUser.savedLocations.splice(placeIndex, 1)

    dispatch(createOrUpdateUser(loggedInUser, true))
  }
}

/**
 * Delete place data by id for the logged-in or local user
 * according to the persistence strategy.
 */
export function deleteUserPlace (placeId) {
  return function (dispatch, getState) {
    const { otp, user } = getState()
    const persistenceStrategy = getPersistenceStrategy(otp.config.persistence)
    const { loggedInUser } = user

    if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE && loggedInUser) {
      // For middleware loggedInUsers, this method should only be triggered by the
      // 'Forget home' or 'Forget work' links from OTP UI's EndPointOverlay/EndPoint,
      // with placeId set to 'home' or 'work'.
      if (isHomeOrWork({ type: placeId })) {
        // Find the index of the place in the loggedInUser.savedLocations
        const placeIndex = loggedInUser.savedLocations.findIndex(loc => loc.type === placeId)
        if (placeIndex > -1) {
          dispatch(deleteLoggedInUserPlace(placeIndex))
        }
      }
    } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
      dispatch(deleteLocalUserSavedPlace(placeId))
    }
  }
}

/**
 * Remembers a place for the logged-in or local user
 * according to the persistence strategy.
 */
export function rememberPlace (placeTypeLocation) {
  return function (dispatch, getState) {
    const { otp, user } = getState()
    const persistenceStrategy = getPersistenceStrategy(otp.config.persistence)
    const { loggedInUser } = user

    if (persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE && loggedInUser) {
      // For middleware loggedInUsers, this method should only be triggered by the
      // 'Save as home' or 'Save as work' links from OTP UI's EndPointOverlay/EndPoint.
      const { location } = placeTypeLocation
      if (isHomeOrWork(location)) {
        // Find the index of the place in the loggedInUser.savedLocations
        const placeIndex = loggedInUser.savedLocations.findIndex(loc => loc.type === location.type)
        if (placeIndex > -1) {
          // Convert to loggedInUser saved place
          dispatch(saveUserPlace(convertToPlace(location), placeIndex))
        }
      }
    } else if (persistenceStrategy === PERSIST_TO_LOCAL_STORAGE) {
      dispatch(rememberLocalUserPlace(placeTypeLocation))
    }
  }
}
