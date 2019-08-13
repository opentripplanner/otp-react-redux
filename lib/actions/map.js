import { createAction } from 'redux-actions'

import { routingQuery } from './api'
import { clearActiveSearch } from './form'
import getGeocoder from '../util/geocoder'

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

// Private actions
const clearingLocation = createAction('CLEAR_LOCATION')
const settingLocation = createAction('SET_LOCATION')

// Public actions
export const forgetPlace = createAction('FORGET_PLACE')
export const rememberPlace = createAction('REMEMBER_PLACE')
export const forgetStop = createAction('FORGET_STOP')
export const rememberStop = createAction('REMEMBER_STOP')

export function clearLocation (payload) {
  return function (dispatch, getState) {
    // Dispatch the clear location action and then clear the active search (so
    // that the map and narrative are not showing a search when one or both
    // locations are not defined).
    dispatch(clearingLocation(payload))
    dispatch(clearActiveSearch())
  }
}

export function setLocation (payload) {
  return function (dispatch, getState) {
    const otpState = getState().otp
    const { location, reverseGeocode, type } = payload
    // reverse geocode point location if requested
    if (reverseGeocode) {
      getGeocoder(otpState.config.geocoder)
        .reverse({ point: location })
        .then((result) => {
          dispatch(settingLocation({ type, location: result }))
        }).catch(err => {
          dispatch(settingLocation({ type, location }))
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
    const { from, to } = getState().otp.currentQuery
    // First, reverse the locations.
    dispatch(settingLocation({
      type: 'from',
      location: to
    }))
    dispatch(settingLocation({
      type: 'to',
      location: from
    }))
    // Then kick off a routing query (if the query is invalid, search will abort).
    dispatch(routingQuery())
  }
}

export const showLegDiagram = createAction('SHOW_LEG_DIAGRAM')

export const setElevationPoint = createAction('SET_ELEVATION_POINT')

export const setMapPopupLocation = createAction('SET_MAP_POPUP_LOCATION')

export function setMapPopupLocationAndGeocode (payload) {
  return function (dispatch, getState) {
    dispatch(setMapPopupLocation(payload))
    getGeocoder(getState().otp.config.geocoder)
      .reverse({ point: payload.location })
      .then((location) => {
        dispatch(setMapPopupLocation({ location }))
      }).catch(err => {
        console.warn(err)
      })
  }
}
