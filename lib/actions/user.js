import { createAction } from 'redux-actions'

import {
  addTrip,
  addUser,
  deleteTrip,
  fetchUser,
  getTrips,
  startPhoneVerification,
  sendPhoneVerification,
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
        await dispatch(fetchUserMonitoredTrips(accessToken))

        dispatch(setCurrentUser({ accessToken, user }))
      } else {
        dispatch(setCurrentUser({ accessToken, user: createNewUser(authUser) }))
      }
    }
  }
}

/**
 * Updates (or creates) a user entry in the middleware,
 * then, if that was successful, updates the redux state with that user.
 */
export function createOrUpdateUser (userData, silentOnSuccess = false) {
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
    }
  }
}

/**
 * Silent-on-success version of function above.
 */
export function createOrUpdateUserSilent (userData) {
  return createOrUpdateUser(userData, true)
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
      const { accessToken } = user

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

/**
 * Initiates the phone number verification process for the logged-in user.
 * // FIXME: This requires saving the pending phone number to the OtpUser object.
 */
export function startUserPhoneVerification (userData, previousPhone) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user

      // FIXME: Temporarily save the user record with the pending phone number (required by middleware).
      // TODO: Figure out what should happen if the user refreshes the browser at this stage.
      const userUpdateResult = await updateUser(otpMiddleware, accessToken, userData)

      if (userUpdateResult.status === 'success' && userUpdateResult.data) {
        const startPhoneVerificationResult = await startPhoneVerification(otpMiddleware, accessToken, userData.id)
        if (startPhoneVerificationResult.status === 'success') {
          // Update application state AFTER the phone verification request has been sent.
          const newUserData = userUpdateResult.data

          // FIXME: Temporarily save the previous phone number so we can revert it in case verification is aborted by user.
          // We do it here instead of inside the user account UI because this is a backend-specific behavior.
          newUserData.previousPhoneNumber = previousPhone

          dispatch(setCurrentUser({ accessToken, user: newUserData }))
        } else {
          alert(`An error was encountered:\n${JSON.stringify(startPhoneVerificationResult)}`)

          // Also if there was an error in sending the verificaton request, revert the phone number.
          userData.phoneNumber = previousPhone
          const userRevertResult = await updateUser(otpMiddleware, accessToken, userData)
          const revertedUserData = userRevertResult.data
          dispatch(setCurrentUser({ accessToken, user: revertedUserData }))
        }
      } else {
        alert(`An error was encountered:\n${JSON.stringify(userUpdateResult)}`)
      }
    }
  }
}

/**
 * Reverts the phone number to the one in place prior to the verification process (if any).
 * // FIXME: This method assumes the middleware requires saving the users pending phone number prior to verification.
 */
export function revertUserPhoneNumber (userData) {
  return async function (dispatch, getState) {
    if (userData.previousPhoneNumber) {
      userData.phoneNumber = userData.previousPhoneNumber
      // Must delete extra fields to avoid error messages.
      delete userData.previousPhoneNumber

      dispatch(createOrUpdateUserSilent(userData))
    }
  }
}

/**
 * Sends the phone number verification code for the logged-in user.
 */
export function sendUserPhoneVerification (userData, code) {
  return async function (dispatch, getState) {
    const { otp, user } = getState()
    const { otp_middleware: otpMiddleware = null } = otp.config.persistence

    if (otpMiddleware) {
      const { accessToken } = user
      const sendResult = await sendPhoneVerification(otpMiddleware, accessToken, userData.id, code)
      if (sendResult.status === 'success' && sendResult.data) {
        if (sendResult.data.status === 'approved') {
          alert('Your phone is now verified and set to receive trip notifications.')

          // Update phone verification in user state.
          userData.isPhoneNumberVerified = true
          // Must delete extra fields to avoid error messages.
          delete userData.previousPhoneNumber

          dispatch(createOrUpdateUserSilent(userData))
        } else {
          alert('You entered in incorrect validation code. Please try again.')
        }
      } else {
        alert(`Your phone could not be verified:\n${JSON.stringify(sendResult)}`)
      }
    }
  }
}
