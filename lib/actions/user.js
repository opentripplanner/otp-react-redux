import { createAction } from 'redux-actions'
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import isEmpty from 'lodash.isempty'
import qs from 'qs'
import toast from 'react-hot-toast'

import {
  convertToPlace,
  getPersistenceMode,
  isHomeOrWork,
  isNewUser,
  positionHomeAndWorkFirst,
  setAtLeastNoMobilityDevice
} from '../util/user'
import { isBlank } from '../util/ui'
import { secureFetch } from '../util/middleware'
import { TRIPS_PATH } from '../util/constants'

import { routeTo, setLocale } from './ui'
import { routingQuery } from './api'
import { setQueryParam } from './form'

const { planParamsToQuery } = coreUtils.query
const { getCurrentDate } = coreUtils.time

// Middleware API paths.
const API_MONITORED_TRIP_PATH = '/api/secure/monitoredtrip'
const API_TRIP_HISTORY_PATH = '/api/secure/triprequests'
const API_OTPUSER_PATH = '/api/secure/user'
const API_OTPUSER_VERIFY_SMS_SUBPATH = '/verify_sms'

// Middleware user actions
const setAccessToken = createAction('SET_ACCESS_TOKEN')
const setCurrentUser = createAction('SET_CURRENT_USER')
const setCurrentUserMonitoredTrips = createAction(
  'SET_CURRENT_USER_MONITORED_TRIPS'
)
const setCurrentUserTripRequests = createAction(
  'SET_CURRENT_USER_TRIP_REQUESTS'
)
const setLastPhoneSmsRequest = createAction('SET_LAST_PHONE_SMS_REQUEST')
export const setPathBeforeSignIn = createAction('SET_PATH_BEFORE_SIGNIN')
export const clearItineraryExistence = createAction('CLEAR_ITINERARY_EXISTENCE')
const setitineraryExistence = createAction('SET_ITINERARY_EXISTENCE')

// localStorage user actions
export const deleteLocalUserRecentPlace = createAction(
  'DELETE_LOCAL_USER_RECENT_PLACE'
)
const deleteLocalUserSavedPlace = createAction('DELETE_LOCAL_USER_SAVED_PLACE')
export const forgetStop = createAction('FORGET_STOP')
export const rememberStop = createAction('REMEMBER_STOP')
const rememberLocalUserPlace = createAction('REMEMBER_LOCAL_USER_PLACE')
const deleteRecentPlace = createAction('DELETE_LOCAL_USER_RECENT_PLACE')

export const UserActionResult = {
  FAILURE: 1,
  SUCCESS: 0
}

function genericErrorAlert(intl, messageObject) {
  if (intl) {
    alert(
      intl.formatMessage(
        { id: 'actions.user.genericError' },
        { err: JSON.stringify(messageObject) }
      )
    )
  }
}

function createNewUser(auth0User) {
  return {
    accessibilityRoutingByDefault: false,
    auth0UserId: auth0User.sub,
    email: auth0User.email,
    hasConsentedToTerms: false, // User must agree to terms.
    isPhoneNumberVerified: false, // User must input phone number
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
function getMiddlewareVariables(state) {
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
    throw new Error(
      'This action requires config.yml#persistence#otp_middleware to be defined.'
    )
  }
}

/**
 * Fetches the saved/monitored trips for a user.
 * We use the accessToken to fetch the data regardless of
 * whether the process to populate state.user is completed or not.
 */
export function fetchMonitoredTrips() {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}`

    const { data: trips, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey,
      'GET'
    )
    if (status === 'success') {
      dispatch(setCurrentUserMonitoredTrips(trips.data))
    }
  }
}

/**
 * Attempts to fetch the auth0 access token and store it in the redux state, under state.user.
 * @param auth0 The auth0 context used to obtain the access token for subsequent middleware fetches.
 * @param intl A formatjs intl object
 */
export function fetchAuth0Token(auth0, intl) {
  return async function (dispatch, getState) {
    try {
      const accessToken = await auth0.getAccessTokenSilently()

      dispatch(setAccessToken(accessToken))
    } catch (error) {
      // TODO: improve UI if there is an error.
      alert(intl.formatMessage({ id: 'actions.user.authTokenError' }))
    }
  }
}

/**
 * Converts a middleware trip request to the search format.
 */
function convertRequestToSearch(config) {
  return function (tripRequest) {
    const { dateCreated, id, requestParameters = {} } = tripRequest
    const { host, path } = config.api
    return {
      canDelete: false,
      id,
      query: planParamsToQuery(requestParameters || {}),
      timestamp: dateCreated,
      url: `${host}${path}/plan?${qs.stringify(requestParameters)}`
    }
  }
}

/**
 * Removes duplicate requests saved from batch queries,
 * so that only one request is displayed per batch.
 * (Except for the mode, all query params in the same batch are the same.)
 */
function removeDuplicateRequestsFromBatch() {
  const batches = {}
  return function ({ query }) {
    if (!batches[query.batchId]) {
      batches[query.batchId] = true

      // Remove the mode for display purposes
      query.mode = ''
      return true
    }
    return false
  }
}

/**
 * Fetches the most recent (default 10) trip history for a user.
 */
export function fetchTripRequests() {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } =
      getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_TRIP_HISTORY_PATH}?userId=${loggedInUser.id}`

    const { data: requests, status: emptyStatus } = await secureFetch(
      `${requestUrl}&limit=0`,
      accessToken,
      apiKey,
      'GET'
    )

    // FIXME: Revert to 10 after taking care of duplicates in the middleware.
    const DEFAULT_LIMIT = 50

    if (emptyStatus === 'success') {
      const { data: trips, status } = await secureFetch(
        `${requestUrl}&offset=${Math.max(
          0,
          requests.total - DEFAULT_LIMIT
        )}&limit=${DEFAULT_LIMIT}`,
        accessToken,
        apiKey,
        'GET'
      )
      if (status === 'success') {
        // Convert tripRequests to search format.
        const { config } = getState().otp
        const convertedTrips = trips.data
          .map(convertRequestToSearch(config))
          .filter((tripReq) => !isEmpty(tripReq.query))
          .filter(removeDuplicateRequestsFromBatch())

        dispatch(setCurrentUserTripRequests(convertedTrips))
      }
    }
  }
}

/**
 * Updates the redux state with the provided user data, including
 * placing the Home and Work locations at the beginning of the list
 * of saved places for rendering in several UI components,
 * and applying accessibility and locale settings.
 *
 * Also, fetches monitored trips if requested, i.e. when
 * - initializing the user state with an existing persisted user, or
 * - POST-ing a user for the first time.
 */
function setUser(user, fetchTrips) {
  return function (dispatch, getState) {
    positionHomeAndWorkFirst(user)
    // If mobility profile is enabled, set a default selection for "no mobility devices".
    if (getState().otp.config.mobilityProfile) {
      setAtLeastNoMobilityDevice(user)
    }
    dispatch(setCurrentUser(user))

    if (fetchTrips) {
      dispatch(fetchMonitoredTrips())
      dispatch(fetchTripRequests())
    }

    const { accessibilityRoutingByDefault, preferredLocale } = user
    if (accessibilityRoutingByDefault !== undefined) {
      dispatch(setQueryParam({ wheelchair: accessibilityRoutingByDefault }))
    }
    if (!isBlank(preferredLocale)) {
      dispatch(setLocale(preferredLocale))
    }
  }
}

/**
 * Attempts to fetch user preferences (or set initial values if the user is being created)
 * into the redux state, under state.user.
 * @param auth0User If provided, the auth0.user object used to initialize the default user object (with email and auth0 id).
 */
export function fetchOrInitializeUser(auth0User) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/fromtoken`

    const { data: user, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey
    )

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
 * @param intl the react-intl formatter
 */
export function createOrUpdateUser(userData, intl) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } =
      getMiddlewareVariables(getState())
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

    const {
      data: returnedUser,
      message,
      status
    } = await secureFetch(requestUrl, accessToken, apiKey, method, {
      body: JSON.stringify(userData)
    })

    if (status === 'success' && returnedUser) {
      // Update application state with the user entry as saved
      // (as returned) by the middleware.
      // (This sorts saved places, and, for existing users, fetches trips.)
      dispatch(setUser(returnedUser, isCreatingUser))
      return UserActionResult.SUCCESS
    } else {
      genericErrorAlert(intl, message)
      return UserActionResult.FAILURE
    }
  }
}

/**
 * Deletes a user, if created (and their corresponding trips, requests, etc.) from the
 * middleware database, and also deletes their Auth0 account.
 * @param auth0 auth0 object (gives access to logout function)
 * @param intl A formatjs intl object
 */
export function deleteUser(auth0, intl) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )
    const { message, status } = await secureFetch(
      `${apiBaseUrl}${API_OTPUSER_PATH}/fromtoken`,
      accessToken,
      apiKey,
      'DELETE'
    )
    // TODO: improve the UI feedback messages for this.
    if (status === 'success') {
      alert(
        intl.formatMessage(
          { id: 'actions.user.accountDeleted' },
          { email: auth0.user.email }
        )
      )
      // Log out user and route them to the home page.
      auth0.logout({ returnTo: window.location.origin })
    } else {
      genericErrorAlert(intl, message)
    }
  }
}

/**
 * Requests the verification email for the new user to be resent.
 */
export function resendVerificationEmail(intl) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )

    // TODO: add any throttling.
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/verification-email`
    const { status } = await secureFetch(requestUrl, accessToken, apiKey)

    if (status === 'success') {
      toast.success(
        intl.formatMessage({ id: 'actions.user.emailVerificationResent' })
      )
    }
  }
}

/**
 * Updates a logged-in user's monitored trip,
 * then, if that was successful, alerts (optional)
 * and refreshes the redux monitoredTrips with the updated trip.
 */
export function createOrUpdateUserMonitoredTrip(
  tripData,
  isNew,
  silentOnSuccess,
  noRedirect,
  intl
) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )
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

    const { data, message, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey,
      method,
      {
        body: JSON.stringify(tripData)
      }
    )

    if (status === 'success' && data) {
      if (!silentOnSuccess && intl) {
        toast.success(
          intl.formatMessage({ id: 'actions.user.preferencesSaved' })
        )
      }

      // Reload user's monitored trips after add/update.
      await dispatch(fetchMonitoredTrips())

      if (noRedirect) return

      // Finally, navigate to the saved trips page.
      dispatch(routeTo(TRIPS_PATH))
    } else {
      genericErrorAlert(intl, message)
    }
  }
}

/**
 * Toggles the isActive status of a monitored trip
 */
export function togglePauseTrip(trip, intl) {
  return function (dispatch, getState) {
    const clonedTrip = clone(trip)
    clonedTrip.isActive = !clonedTrip.isActive

    // Silent update of existing trip.
    dispatch(
      createOrUpdateUserMonitoredTrip(clonedTrip, false, true, true, intl)
    )
  }
}

/**
 * Toggles the snoozed status of a monitored trip
 */
export function toggleSnoozeTrip(trip, intl) {
  return function (dispatch, getState) {
    const newTrip = clone(trip)
    newTrip.snoozed = !newTrip.snoozed

    // Silent update of existing trip.
    dispatch(createOrUpdateUserMonitoredTrip(newTrip, false, true, true, intl))
  }
}

/**
 * Deletes a logged-in user's monitored trip,
 * then, if that was successful, refreshes the redux monitoredTrips state.
 */
export function confirmAndDeleteUserMonitoredTrip(tripId, intl) {
  return async function (dispatch, getState) {
    if (
      !window.confirm(
        intl.formatMessage({ id: 'actions.user.confirmDeleteMonitoredTrip' })
      )
    )
      return

    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(
      getState()
    )
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}/${tripId}`

    const { message, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey,
      'DELETE'
    )
    if (status === 'success') {
      // Reload user's monitored trips after deletion.
      dispatch(fetchMonitoredTrips())
      // Navigate to the list of trips
      dispatch(routeTo(TRIPS_PATH))
    } else {
      genericErrorAlert(intl, message)
    }
  }
}

/**
 * Requests a verification code via SMS for the logged-in user.
 */
export function requestPhoneVerificationSms(newPhoneNumber, intl) {
  return async function (dispatch, getState) {
    const state = getState()
    const { number, timestamp } = state.user.lastPhoneSmsRequest
    const now = new Date()

    // Request a new verification code if we are requesting a different number.
    // or enough time has elapsed since the last request (1 minute?).
    // TODO: Should throttling be handled in the middleware?
    if (number !== newPhoneNumber || now - timestamp >= 60000) {
      const { accessToken, apiBaseUrl, apiKey, loggedInUser } =
        getMiddlewareVariables(state)
      const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${
        loggedInUser.id
      }${API_OTPUSER_VERIFY_SMS_SUBPATH}/${encodeURIComponent(newPhoneNumber)}`

      const { message, status } = await secureFetch(
        requestUrl,
        accessToken,
        apiKey,
        'GET'
      )

      dispatch(
        setLastPhoneSmsRequest({
          number: newPhoneNumber,
          status,
          timestamp: now
        })
      )

      if (status === 'success') {
        // Refetch user and update application state with new phone number and verification status.
        dispatch(fetchOrInitializeUser())
      } else {
        genericErrorAlert(intl, message)
      }
    } else {
      // Alert user if they have been throttled.
      // TODO: improve this alert.
      alert(intl.formatMessage({ id: 'actions.user.smsResendThrottled' }))
    }
  }
}

/**
 * Validate the phone number verification code for the logged-in user.
 */
export function verifyPhoneNumber(code, intl) {
  return async function (dispatch, getState) {
    const { accessToken, apiBaseUrl, apiKey, loggedInUser } =
      getMiddlewareVariables(getState())
    const requestUrl = `${apiBaseUrl}${API_OTPUSER_PATH}/${loggedInUser.id}${API_OTPUSER_VERIFY_SMS_SUBPATH}/${code}`

    const { data, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey,
      'POST'
    )

    // If the check is successful, status in the returned data will be "approved".
    if (status === 'success' && data) {
      if (data.status === 'approved') {
        // Refetch user and update application state with new phone number and verification status.
        dispatch(fetchOrInitializeUser())
      } else {
        // Otherwise, the user entered a wrong/incorrect code.
        alert(intl.formatMessage({ id: 'actions.user.smsInvalidCode' }))
      }
    } else {
      // This happens when an error occurs on backend side, especially
      // when the code has expired (or was cancelled by Twilio after too many attempts).
      alert(intl.formatMessage({ id: 'actions.user.smsVerificationFailed' }))
    }
  }
}

/**
 * Check itinerary existence for the given monitored trip.
 */
export function checkItineraryExistence(trip, intl) {
  return async function (dispatch, getState) {
    const state = getState()
    const { accessToken, apiBaseUrl, apiKey } = getMiddlewareVariables(state)
    const requestUrl = `${apiBaseUrl}${API_MONITORED_TRIP_PATH}/checkitinerary`

    // Empty state before performing the checks.
    dispatch(clearItineraryExistence())

    const { data, status } = await secureFetch(
      requestUrl,
      accessToken,
      apiKey,
      'POST',
      {
        body: JSON.stringify(trip)
      }
    )

    if (status === 'success' && data) {
      dispatch(setitineraryExistence(data))
    } else {
      alert(
        intl.formatMessage({ id: 'actions.user.itineraryExistenceCheckFailed' })
      )
    }
  }
}

/**
 * Plans a new trip for the current date given the query parameters in the given
 * monitored trip
 */
export function planNewTripFromMonitoredTrip(monitoredTrip) {
  return function (dispatch, getState) {
    // update query params in store
    const newQuery = planParamsToQuery(qs.parse(monitoredTrip.queryParams))
    newQuery.date = getCurrentDate(getState().otp.config.homeTimezone)

    dispatch(routeTo('/', ''))
    dispatch(setQueryParam(newQuery))

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
export function saveUserPlace(placeToSave, placeIndex, intl) {
  return function (dispatch, getState) {
    const { loggedInUser } = getState().user
    if (placeIndex === 'new') {
      loggedInUser.savedLocations.push(placeToSave)
    } else {
      loggedInUser.savedLocations[placeIndex] = placeToSave
    }

    return dispatch(createOrUpdateUser(loggedInUser, intl))
  }
}

/**
 * Delete the place data at the specified index for the logged-in user.
 */
export function deleteLoggedInUserPlace(placeIndex, intl) {
  return function (dispatch, getState) {
    if (
      !window.confirm(
        intl.formatMessage({ id: 'actions.user.confirmDeletePlace' })
      )
    ) {
      return
    }

    const { loggedInUser } = getState().user
    loggedInUser.savedLocations.splice(placeIndex, 1)

    dispatch(createOrUpdateUser(loggedInUser, intl))
  }
}

/**
 * Delete a place for the logged-in or local user according to the persistence strategy.
 */
export function deleteUserPlace(place, intl) {
  return function (dispatch, getState) {
    const { otp, user } = getState()
    const persistenceMode = getPersistenceMode(otp.config.persistence)
    const { loggedInUser } = user

    if (persistenceMode.isOtpMiddleware && loggedInUser) {
      // Find the index of the place in the loggedInUser.savedLocations

      // If 'Forget home' or 'Forget work' links from OTP UI's EndPointOverlay/EndPoint
      // are clicked, then place will set to 'home' or 'work'.
      const placeIndex =
        place === 'home' || place === 'work'
          ? loggedInUser.savedLocations.findIndex((loc) => loc.type === place)
          : loggedInUser.savedLocations.indexOf(place)

      if (placeIndex > -1) {
        dispatch(deleteLoggedInUserPlace(placeIndex, intl))
      }
    } else if (persistenceMode.isLocalStorage) {
      dispatch(deleteLocalUserSavedPlace(place))
    }
  }
}

/**
 * Remembers a place for the logged-in or local user
 * according to the persistence strategy.
 */
export function rememberPlace(placeTypeLocation, intl) {
  return function (dispatch, getState) {
    const { otp, user } = getState()
    const persistenceMode = getPersistenceMode(otp.config.persistence)
    const { loggedInUser } = user

    if (persistenceMode.isOtpMiddleware) {
      if (loggedInUser) {
        if (loggedInUser.hasConsentedToTerms) {
          // For middleware loggedInUsers who have accepted the terms of use,
          // this method should only be triggered by the
          // 'Save as home' or 'Save as work' links from OTP UI's EndPointOverlay/EndPoint.
          const { location } = placeTypeLocation
          if (isHomeOrWork(location)) {
            // Find the index of the place in the loggedInUser.savedLocations
            const placeIndex = loggedInUser.savedLocations.findIndex(
              (loc) => loc.type === location.type
            )
            if (placeIndex > -1) {
              // Convert to loggedInUser saved place
              return dispatch(
                saveUserPlace(convertToPlace(location), placeIndex, intl)
              )
            }
          }
        } else {
          alert(
            intl.formatMessage({
              id: 'actions.user.mustAcceptTermsToSavePlace'
            })
          )
        }
      } else {
        alert(
          intl.formatMessage({ id: 'actions.user.mustBeLoggedInToSavePlace' })
        )
      }
      return UserActionResult.FAILURE
    } else if (persistenceMode.isLocalStorage) {
      dispatch(rememberLocalUserPlace(placeTypeLocation))
      return UserActionResult.SUCCESS
    }
  }
}

/**
 * Dispatches the action to delete a saved or recent place from localStorage.
 */
export function forgetPlace(placeId, intl) {
  return function (dispatch, getState) {
    // localStorage only: Recent place IDs contain the string literal 'recent'.
    if (placeId.indexOf('recent') !== -1) {
      dispatch(deleteRecentPlace(placeId))
    } else {
      dispatch(deleteUserPlace(placeId, intl))
    }
  }
}
