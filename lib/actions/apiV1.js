import qs from 'qs'

import {
  createQueryAction,
  findGeometryForPattern,
  findGeometryForTrip,
  findPatternsForRouteError,
  findPatternsForRouteResponse,
  findRouteError,
  findRouteResponse,
  findRoutesError,
  findRoutesResponse,
  findStopsForPattern,
  findStopsForTrip,
  findStopTimesForTrip,
  findTripError,
  findTripResponse,
  receivedVehiclePositions,
  receivedVehiclePositionsError
} from './api'
import { setViewedStop } from './ui'

// Import must be done like this as maplibregl is incompatible with jest
let maplibregl = null
if (typeof jest === 'undefined') maplibregl = require('maplibre-gl')

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

/**
 * Stop times for stop query (used in stop viewer).
 */
export function findStopTimesForStop(params) {
  return function (dispatch, getState) {
    console.warn('OTP1 is not supported.')
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
          dispatch(
            findStopsForPattern({
              patternId: ptn.id,
              routeId: params.routeId
            })
          )
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

export function findRoutes() {
  return createQueryAction(
    'index/routes',
    findRoutesResponse,
    findRoutesError,
    {
      postprocess: (payload, dispatch) => {
        dispatch(setViewedStop(null))
      },
      rewritePayload: (payload) => {
        const routes = {}
        payload.forEach((rte) => {
          routes[rte.id] = rte
        })
        return routes
      },
      serviceId: 'routes'
    }
  )
}

export function routingQuery(searchId = null, updateSearchInReducer) {
  return function (dispatch, getState) {
    console.warn('OTP1 is not supported.')
  }
}
export default {
  findPatternsForRoute,
  findRoute,
  findRoutes,
  findStopTimesForStop,
  findTrip,
  getVehiclePositionsForRoute,
  routingQuery,
  vehicleRentalQuery
}
