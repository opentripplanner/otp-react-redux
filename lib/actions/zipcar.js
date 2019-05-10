import { createAction } from 'redux-actions'
if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

export const receivedZipcarLocationsError = createAction('ZIPCAR_LOCATIONS_ERROR')
export const receivedZipcarLocationsResponse = createAction('ZIPCAR_LOCATIONS_RESPONSE')
export const requestZipcarLocationsResponse = createAction('ZIPCAR_LOCATIONS_REQUEST')

export function zipcarLocationsQuery (url) {
  return async function (dispatch, getState) {
    dispatch(requestZipcarLocationsResponse())
    let json
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      json = await response.json()
    } catch (err) {
      return dispatch(receivedZipcarLocationsError(err))
    }

    dispatch(receivedZipcarLocationsResponse(json))
  }
}
