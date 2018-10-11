import {reverse} from 'isomorphic-mapzen-search'
import { createAction } from 'redux-actions'

import { formChanged } from './form'

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

export function clearLocation (payload) {
  return function (dispatch, getState) {
    dispatch(clearingLocation(payload))
    dispatch(formChanged())
  }
}

export function setLocation (payload) {
  return function (dispatch, getState) {
    const otpState = getState().otp

    // reverse geocode point location if requested
    if (payload.reverseGeocode) {
      const {MAPZEN_KEY, baseUrl} = otpState.config.geocoder
      const {location: point} = payload
      reverse({
        apiKey: MAPZEN_KEY,
        point,
        format: true,
        url: baseUrl ? `${baseUrl}/reverse` : null
      }).then((json) => {
        // override location name if reverse geocode is successful
        payload.location.name = json[0].address
        dispatch(settingLocation({
          type: payload.type,
          location: Object.assign({}, payload.location, {name: json[0].address})
        }))
        // Trigger form change after reverse geocode so that OTP query contains
        // reverse geocoded place name
        dispatch(formChanged())
      }).catch((err) => {
        dispatch(settingLocation({
          type: payload.type,
          location: payload.location
        }))
        dispatch(formChanged())
        console.warn(err)
      })
    } else {
      // update the location in the store
      dispatch(settingLocation(payload))
      dispatch(formChanged())
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
    dispatch(formChanged())
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
    dispatch(formChanged())
  }
}

export const showLegDiagram = createAction('SHOW_LEG_DIAGRAM')

export const setElevationPoint = createAction('SET_ELEVATION_POINT')
