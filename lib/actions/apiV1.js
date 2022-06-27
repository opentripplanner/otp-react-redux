import maplibregl from 'maplibre-gl'
import qs from 'qs'

import {
  bikeRentalQuery,
  createQueryAction,
  findGeometryForPattern,
  findGeometryForTrip,
  findNearbyAmenitiesError,
  findNearbyAmenitiesResponse,
  findNearbyStops,
  findPatternsForRouteError,
  findPatternsForRouteResponse,
  findRouteError,
  findRouteResponse,
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
import { setViewedStop } from './ui'
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

function findNearbyAmenities({ lat, lon, radius = 300 }, stopId) {
  return function (dispatch, getState) {
    const bounds = new maplibregl.LngLat(lon, lat).toBounds(radius)
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

export const findStop = (params) =>
  createQueryAction(
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

const fetchStopInfo = (stop) =>
  async function (dispatch, getState) {
    await dispatch(findStop({ stopId: stop.stopId }))
    const state = getState()
    const { nearbyRadius } = state.otp?.config?.stopViewer
    const fetchedStop = state.otp.transitIndex.stops?.[stop?.stopId]
    // TODO: stop not found message
    if (!fetchedStop) return

    const { lat, lon } = fetchedStop
    if (nearbyRadius > 0) {
      dispatch(
        findNearbyStops(
          {
            includeRoutes: true,
            includeStopTimes: true,
            lat,
            lon,
            nearbyRadius
          },
          stop.stopId
        )
      )
      dispatch(
        findNearbyAmenities({ lat, lon, radius: nearbyRadius }, stop.stopId)
      )
      dispatch(zoomToStop(fetchedStop))
    }
  }

const getVehiclePositionsForRoute = (routeId) =>
  createQueryAction(
    `index/routes/${routeId}/vehicles`,
    receivedVehiclePositions,
    receivedVehiclePositionsError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          routeId: routeId,
          vehicles: payload
        }
      }
    }
  )

export const findPatternsForRoute = (params) =>
  createQueryAction(
    `index/routes/${params.routeId}/patterns?includeGeometry=true`,
    findPatternsForRouteResponse,
    findPatternsForRouteError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        // load geometry for each pattern
        payload.forEach((ptn) => {
          // Some OTP instances don't support includeGeometry.
          // We need to manually fetch geometry in these cases.
          if (!ptn.geometry) {
            dispatch(
              findGeometryForPattern({
                patternId: ptn.id,
                routeId: params.routeId
              })
            )
          }
        })
      },

      rewritePayload: (payload) => {
        // convert pattern array to ID-mapped object
        const patterns = {}
        payload.forEach((ptn) => {
          patterns[ptn.id] = ptn
        })

        return {
          patterns,
          routeId: params.routeId
        }
      }
    }
  )

export const findRoute = (params) =>
  createQueryAction(
    `index/routes/${params.routeId}`,
    findRouteResponse,
    findRouteError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        // load patterns
        dispatch(findPatternsForRoute({ routeId: params.routeId }))
        dispatch(setViewedStop(null))
      }
    }
  )

export default {
  fetchStopInfo,
  findPatternsForRoute,
  findRoute,
  findTrip,
  getVehiclePositionsForRoute,
  vehicleRentalQuery
}
