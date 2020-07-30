import clone from 'lodash/cloneDeep'
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
 * Fetches user preferences to state.user, or set initial values under state.user if no user has been loaded.
 */
export function fetchOrInitializeUser (auth) {
  return async function (dispatch, getState) {
    const { otp } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
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
        const { data: trips, status: tripFetchStatus } = await getTrips(otpMiddleware, accessToken)
        if (tripFetchStatus === 'success') {
          dispatch(setCurrentUserMonitoredTrips(trips))
        }

        dispatch(setCurrentUser({ accessToken, user }))
      } else {
        dispatch(setCurrentUser({ accessToken, user: getStateForNewUser(authUser) }))
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
 * then, if that was successful, refreshes the redux monitoredTrips
 * with the updated trip.
 */
export function createOrUpdateUserMonitoredTrip (tripData, isNew) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken, loggedInUserMonitoredTrips: trips } = user

      let result
      if (isNew) {
        result = await addTrip(otpMiddleware, accessToken, tripData)
      } else {
        result = await updateTrip(otpMiddleware, accessToken, tripData)
      }

      // TODO: improve the UI feedback messages for this.
      if (result.status === 'success' && result.data) {
        const newTrip = result.data

        // For updating the monitoredTrips state,
        // make a clone of the trips array,
        // find the index of the trip being updated (using trip.id),
        // and assign the trip returned from the middleware at that index
        // (or append to array if index was not found).
        const newTrips = trips ? clone(trips) : []
        const tripIndex = newTrips.findIndex(trip => trip.id === newTrip.id)
        if (tripIndex !== -1) {
          newTrips[tripIndex] = newTrip
        } else {
          newTrips.push(newTrip)
        }

        dispatch(setCurrentUserMonitoredTrips(newTrips))

        alert('Your preferences have been saved.')
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
      const { accessToken, loggedInUserMonitoredTrips: trips } = user
      const deleteResult = await deleteTrip(otpMiddleware, accessToken, id)

      if (deleteResult.status === 'success') {
        // For updating the monitoredTrips state,
        // keep the trips whose id is not that of the deleted trip.
        if (trips) {
          const newTrips = trips.filter(trip => trip.id !== id)
          dispatch(setCurrentUserMonitoredTrips(newTrips))
        }
      } else {
        alert(`An error was encountered:\n${JSON.stringify(deleteResult)}`)
      }
    }
  }
}
