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

export const settingLocation = createAction('SET_LOCATION')
export const clearingLocation = createAction('CLEAR_LOCATION')

export function setLocation (payload) {
  return function (dispatch, getState) {
    dispatch(settingLocation(payload))
    dispatch(formChanged())
  }
}

export function clearLocation (payload) {
  return function (dispatch, getState) {
    dispatch(clearingLocation(payload))
    dispatch(formChanged())
  }
}
