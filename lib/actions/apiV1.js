import { createAction } from 'redux-actions'
import L from 'leaflet'
import qs from 'qs'

import {
  bikeRentalQuery,
  createQueryAction,
  findGeometryForTrip,
  findNearbyStops,
  findRoutesAtStop,
  findStopError,
  findStopResponse,
  findStopsForTrip,
  findStopTimesForStop,
  findStopTimesForTrip,
  findTripError,
  findTripResponse,
  parkAndRideQuery,
  receivedVehiclePositions,
  receivedVehiclePositionsError
} from './api'
import { zoomToStop } from './map'

const findTrip = (params) =>
  createQueryAction(
    `index/trips/${params.tripId}`,
    findTripResponse,
    findTripError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        dispatch(findStopsForTrip({ tripId: params.tripId }))
        dispatch(findStopTimesForTrip({ tripId: params.tripId }))
        dispatch(findGeometryForTrip({ tripId: params.tripId }))
      }
    }
  )

export function vehicleRentalQuery(
  params,
  responseAction,
  errorAction,
  options
) {
  const paramsString = qs.stringify(params)
  const endpoint = `vehicle_rental${paramsString ? `?${paramsString}` : ''}`
  return createQueryAction(endpoint, responseAction, errorAction, options)
}

export const findNearbyAmenitiesResponse = createAction(
  'FIND_NEARBY_AMENITIES_RESPONSE'
)
export const findNearbyAmenitiesError = createAction(
  'FIND_NEARBY_AMENITIES_ERROR'
)

function findNearbyAmenities(params, stopId) {
  return function (dispatch, getState) {
    const { lat, lon, radius } = params
    const bounds = L.latLng(lat, lon).toBounds(radius)
    const { lat: low, lng: left } = bounds.getSouthWest()
    const { lat: up, lng: right } = bounds.getNorthEast()
    dispatch(
      parkAndRideQuery(
        { lowerLeft: `${low},${left}`, upperRight: `${up},${right}` },
        findNearbyAmenitiesResponse,
        findNearbyAmenitiesError,
        {
          noThrottle: true,
          rewritePayload: (payload) => {
            return {
              parkAndRideLocations: payload,
              stopId
            }
          }
        }
      )
    )
    dispatch(
      bikeRentalQuery(
        { lowerLeft: `${low},${left}`, upperRight: `${up},${right}` },
        findNearbyAmenitiesResponse,
        findNearbyAmenitiesError,
        {
          rewritePayload: (payload) => {
            return {
              bikeRental: payload,
              stopId
            }
          }
        }
      )
    )
    dispatch(
      vehicleRentalQuery(
        { lowerLeft: `${low},${left}`, upperRight: `${up},${right}` },
        findNearbyAmenitiesResponse,
        findNearbyAmenitiesError,
        {
          rewritePayload: (payload) => {
            return {
              stopId,
              vehicleRental: payload
            }
          }
        }
      )
    )
  }
}

export function findStop(params) {
  return createQueryAction(
    `index/stops/${params.stopId}`,
    findStopResponse,
    findStopError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        dispatch(findRoutesAtStop(params.stopId))
        dispatch(findStopTimesForStop(params))
      },
      serviceId: 'stops'
    }
  )
}

const fetchStopInfo = (stop) =>
  async function (dispatch, getState) {
    await dispatch(findStop({ stopId: stop.stopId }))
    const state = getState()
    const { nearbyRadius: radius } = state.otp.config.stopViewer
    const fetchedStop = state.otp.transitIndex.stops?.[stop?.stopId]
    // TODO: stop not found message
    if (!fetchedStop) return

    const { lat, lon } = fetchedStop
    if (radius > 0) {
      dispatch(
        findNearbyStops(
          {
            includeRoutes: true,
            includeStopTimes: true,
            lat,
            lon,
            radius
          },
          stop.stopId
        )
      )
      dispatch(findNearbyAmenities({ lat, lon, radius }, stop.stopId))
      dispatch(zoomToStop(fetchedStop))
    }
  }

const getVehiclePositionsForRoute = (routeId) =>
  createQueryAction(
    `index/routes/${routeId}/vehicles`,
    receivedVehiclePositions,
    receivedVehiclePositionsError,
    {
      rewritePayload: (payload) => {
        return {
          routeId: routeId,
          vehicles: payload
        }
      }
    }
  )

export default {
  fetchStopInfo,
  findTrip,
  getVehiclePositionsForRoute,
  vehicleRentalQuery
}
