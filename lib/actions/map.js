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
    dispatch(settingLocation(payload))
    dispatch(formChanged())
  }
}

/* payload is simply { type: 'from'|'to' }; location filled in automatically */

export function setLocationToCurrent (payload) {
  return function (dispatch, getState) {
    const currentPosition = getState().otp.location.currentPosition
    if (!currentPosition) return
    payload.location = {
      lat: currentPosition.coords.latitude,
      lon: currentPosition.coords.longitude,
      name: '(Current Location)'
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
