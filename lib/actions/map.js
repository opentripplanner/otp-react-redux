import { createAction } from 'redux-actions'

import { reverse } from '../util/geocoder'

/* SET_LOCATION action creator. Updates a from or to location in the store
 *
 * payload format: {
 *   type: 'from' or 'to'
 *   location: {
 *     name: (string),
 *     lat: (number)
 *     lat: (number)
 *   }
 */

export const clearingLocation = createAction('CLEAR_LOCATION')
export const settingLocation = createAction('SET_LOCATION')
export const switchingLocations = createAction('SWITCH_LOCATIONS')

export const forgetPlace = createAction('FORGET_PLACE')
export const rememberPlace = createAction('REMEMBER_PLACE')

export function clearLocation (payload) {
  return function (dispatch, getState) {
    dispatch(clearingLocation(payload))
  }
}

export function setLocation (payload) {
  return function (dispatch, getState) {
    const otpState = getState().otp

    // reverse geocode point location if requested
    if (payload.reverseGeocode) {
      reverse(payload.location, otpState.config.geocoder).then((location) => {
        dispatch(settingLocation({
          type: payload.type,
          location
        }))
      }).catch(err => {
        dispatch(settingLocation({
          type: payload.type,
          location: payload.location
        }))
        console.warn(err)
      })
    } else {
      // update the location in the store
      dispatch(settingLocation(payload))
    }
  }
}

/* payload is simply { type: 'from'|'to' }; location filled in automatically */

export function setLocationToCurrent (payload) {
  return function (dispatch, getState) {
    const currentPosition = getState().otp.location.currentPosition
    if (currentPosition.error || !currentPosition.coords) return
    payload.location = {
      lat: currentPosition.coords.latitude,
      lon: currentPosition.coords.longitude,
      name: '(Current Location)',
      category: 'CURRENT_LOCATION'
    }
    dispatch(settingLocation(payload))
  }
}

export function switchLocations () {
  return function (dispatch, getState) {
    const {from, to} = getState().otp.currentQuery
    dispatch(settingLocation({
      type: 'from',
      location: to
    }))
    dispatch(settingLocation({
      type: 'to',
      location: from
    }))
  }
}

export const showLegDiagram = createAction('SHOW_LEG_DIAGRAM')

export const setElevationPoint = createAction('SET_ELEVATION_POINT')

export const setMapPopupLocation = createAction('SET_MAP_POPUP_LOCATION')

export function setMapPopupLocationAndGeocode (payload) {
  return function (dispatch, getState) {
    dispatch(setMapPopupLocation(payload))
    reverse(payload.location, getState().otp.config.geocoder).then((location) => {
      dispatch(setMapPopupLocation({ location }))
    }).catch(err => {
      console.warn(err)
    })
  }
}
