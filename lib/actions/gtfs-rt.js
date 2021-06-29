import { createAction } from 'redux-actions'
if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

export const receivedGtfsRtVehiclePositionsError = createAction('GTFS_RT_VEHICLE_POSITIONS_ERROR')
export const receivedGtfsRtVehiclePositionsResponse = createAction('GTFS_RT_VEHICLE_POSITIONS_RESPONSE')
export const requestGtfsRtVehiclePositionsResponse = createAction('GTFS_RT_VEHICLE_POSITIONS_REQUEST')

export function gtfsRtVehiclePositionsQuery (url) {
  return async function (dispatch, getState) {
    dispatch(requestGtfsRtVehiclePositionsResponse())
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
      return dispatch(receivedGtfsRtVehiclePositionsError(err))
    }

    dispatch(receivedGtfsRtVehiclePositionsResponse({ data: json, feedId: url }))
  }
}
