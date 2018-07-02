/* globals fetch */

import { createAction } from 'redux-actions'
import qs from 'qs'
import moment from 'moment'
if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

import { queryIsValid } from '../util/state'
import queryParams from '../util/query-params'
import { updateOtpUrlParams } from '../util/query'
import { hasCar } from '../util/itinerary'

// Generic API actions

export const nonRealtimeRoutingResponse = createAction('NON_REALTIME_ROUTING_RESPONSE')
export const routingRequest = createAction('ROUTING_REQUEST')
export const routingResponse = createAction('ROUTING_RESPONSE')
export const routingError = createAction('ROUTING_ERROR')

let lastSearchId = 0

export function routingQuery () {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const routingType = otpState.currentQuery.routingType
    const searchId = ++lastSearchId

    if (!queryIsValid(otpState)) return
    dispatch(routingRequest({ routingType, searchId }))

    // fetch a realtime route
    fetch(constructRoutingQuery(otpState))
      .then(getJsonAndCheckResponse)
      .then(json => {
        dispatch(routingResponse({ response: json, searchId }))
      })
      .catch(error => {
        dispatch(routingError({ error, searchId }))
      })

    // also fetch a non-realtime route
    fetch(constructRoutingQuery(otpState, true))
      .then(getJsonAndCheckResponse)
      .then(json => {
        dispatch(nonRealtimeRoutingResponse({ response: json, searchId }))
      })
      .catch(error => {
        console.error(error)
        // do nothing
      })
  }
}

function getJsonAndCheckResponse (res) {
  if (res.status >= 400) {
    const error = new Error('Received error from server')
    error.response = res
    throw error
  }
  return res.json()
}

function constructRoutingQuery (otpState, ignoreRealtimeUpdates) {
  const { config, currentQuery } = otpState
  const routingType = currentQuery.routingType
  const isItinerary = routingType === 'ITINERARY'

  // Check for routingType-specific API config; if none, use default API
  const api = config.routingTypes.find(rt => rt.key === routingType).api || config.api
  const planEndpoint = `${api.host}${api.port
    ? ':' + api.port
    : ''}${api.path}/plan`

  let params = {}

  // Start with the universe of OTP parameters defined in query-params.js:
  queryParams
    .filter(qp => {
      // A given parameter is included in the request if all of the following:
      // 1. Must apply to the active routing type (ITINERARY or PROFILE)
      // 2. Must be included in the current user-defined query
      // 3. Must pass the parameter's applicability test, if one is specified
      return qp.routingTypes.indexOf(routingType) !== -1 &&
        qp.name in currentQuery &&
        (typeof qp.applicable !== 'function' || qp.applicable(currentQuery))
    })
    .forEach(qp => {
      // Translate the applicable parameters according to their rewrite
      // functions (if provided)
      const rewriteFunction = isItinerary
        ? qp.itineraryRewrite
        : qp.profileRewrite
      params = Object.assign(
        params,
        rewriteFunction
          ? rewriteFunction(currentQuery[qp.name])
          : { [qp.name]: currentQuery[qp.name] }
      )
    })

  // Additional processing specific to ITINERARY mode
  if (isItinerary) {
    // override ignoreRealtimeUpdates if provided
    if (typeof ignoreRealtimeUpdates === 'boolean') {
      params.ignoreRealtimeUpdates = ignoreRealtimeUpdates
    }

    // check date/time validity; ignore both if either is invalid
    const dateValid = moment(params.date, 'YYYY-MM-DD').isValid()
    const timeValid = moment(params.time, 'H:mm').isValid()

    if (!dateValid || !timeValid) {
      delete params.time
      delete params.date
    }

    // temp: set minTransitDistance
    if (params.mode && params.mode.includes('CAR_HAIL')) {
      params.minTransitDistance = '50%'
    }

  // Additional processing specific to PROFILE mode
  } else {
    // check start and end time validity; ignore both if either is invalid
    const startTimeValid = moment(params.startTime, 'H:mm').isValid()
    const endTimeValid = moment(params.endTime, 'H:mm').isValid()

    if (!startTimeValid || !endTimeValid) {
      delete params.startTimeValid
      delete params.endTimeValid
    }
  }

  // hack to add walking to driving/TNC trips
  if (hasCar(params.mode)) {
    params.mode += ',WALK'
  }

  // TODO: check that valid from/to locations are provided

  // FIXME: This is only performed when ignoring realtimeupdates currently, just
  // to ensure it is not repeated twice.
  if (ignoreRealtimeUpdates) updateOtpUrlParams(params)

  return `${planEndpoint}?${qs.stringify(params)}`
}

// bike rental station query

export const receivedBikeRentalError = createAction('BIKE_RENTAL_ERROR')
export const receivedBikeRentalResponse = createAction('BIKE_RENTAL_RESPONSE')
export const requestBikeRentalResponse = createAction('BIKE_RENTAL_REQUEST')

export function bikeRentalQuery () {
  return async function (dispatch, getState) {
    const otpState = getState().otp

    dispatch(requestBikeRentalResponse())
    const api = otpState.config.api
    const planEndpoint = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/bike_rental`
    const url = planEndpoint // TODO: add bbox

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
      return dispatch(receivedBikeRentalError(err))
    }

    dispatch(receivedBikeRentalResponse(json))
  }
}

// Single stop lookup query

export const findStopResponse = createAction('FIND_STOP_RESPONSE')
export const findStopError = createAction('FIND_STOP_ERROR')

export function findStop (params) {
  return createQueryAction(`index/stops/${params.stopId}`,
    findStopResponse, findStopError, null, (payload, dispatch) => {
      dispatch(findRoutesAtStop(params.stopId))
      dispatch(findStopTimesForStop({stopId: params.stopId}))
    }
  )
}

// Single trip lookup query

export const findTripResponse = createAction('FIND_TRIP_RESPONSE')
export const findTripError = createAction('FIND_TRIP_ERROR')

export function findTrip (params) {
  return createQueryAction(`index/trips/${params.tripId}`,
    findTripResponse, findTripError, null, (payload, dispatch) => {
      dispatch(findStopsForTrip({tripId: params.tripId}))
      dispatch(findStopTimesForTrip({tripId: params.tripId}))
      dispatch(findGeometryForTrip({tripId: params.tripId}))
    }
  )
}

// Stops for trip query

export const findStopsForTripResponse = createAction('FIND_STOPS_FOR_TRIP_RESPONSE')
export const findStopsForTripError = createAction('FIND_STOPS_FOR_TRIP_ERROR')

export function findStopsForTrip (params) {
  return createQueryAction(`index/trips/${params.tripId}/stops`,
    findStopsForTripResponse, findStopsForTripError,
    (payload) => {
      return {
        tripId: params.tripId,
        stops: payload
      }
    }
  )
}

// Stop times for trip query

export const findStopTimesForTripResponse = createAction('FIND_STOP_TIMES_FOR_TRIP_RESPONSE')
export const findStopTimesForTripError = createAction('FIND_STOP_TIMES_FOR_TRIP_ERROR')

export function findStopTimesForTrip (params) {
  return createQueryAction(`index/trips/${params.tripId}/stoptimes`,
    findStopTimesForTripResponse, findStopTimesForTripError,
    (payload) => {
      return {
        tripId: params.tripId,
        stopTimes: payload
      }
    }
  )
}

// Geometry for trip query

export const findGeometryForTripResponse = createAction('FIND_GEOMETRY_FOR_TRIP_RESPONSE')
export const findGeometryForTripError = createAction('FIND_GEOMETRY_FOR_TRIP_ERROR')

export function findGeometryForTrip (params) {
  return createQueryAction(`index/trips/${params.tripId}/geometry`,
    findGeometryForTripResponse, findGeometryForTripError,
    (payload) => {
      return {
        tripId: params.tripId,
        geometry: payload
      }
    }
  )
}

// Stop times for stop query

export const findStopTimesForStopResponse = createAction('FIND_STOP_TIMES_FOR_STOP_RESPONSE')
export const findStopTimesForStopError = createAction('FIND_STOP_TIMES_FOR_STOP_ERROR')

export function findStopTimesForStop (params) {
  return createQueryAction(`index/stops/${params.stopId}/stoptimes?timeRange=14400`,
    findStopTimesForStopResponse, findStopTimesForStopError,
    (payload) => {
      return {
        stopId: params.stopId,
        stopTimes: payload
      }
    }
  )
}

// Routes lookup query

export const findRoutesResponse = createAction('FIND_ROUTES_RESPONSE')
export const findRoutesError = createAction('FIND_ROUTES_ERROR')

export function findRoutes (params) {
  return createQueryAction('index/routes',
    findRoutesResponse, findRoutesError,
    (payload) => {
      const routes = {}
      payload.forEach(rte => { routes[rte.id] = rte })
      return routes
    }
  )
}

// Single Route lookup query

export const findRouteResponse = createAction('FIND_ROUTE_RESPONSE')
export const findRouteError = createAction('FIND_ROUTE_ERROR')

export function findRoute (params) {
  return createQueryAction(`index/routes/${params.routeId}`,
    findRouteResponse, findRouteError, null,
    (payload, dispatch) => {
      // load patterns
      dispatch(findPatternsForRoute({ routeId: params.routeId }))
    }
  )
}

// Patterns for Route lookup query

export const findPatternsForRouteResponse = createAction('FIND_PATTERNS_FOR_ROUTE_RESPONSE')
export const findPatternsForRouteError = createAction('FIND_PATTERNS_FOR_ROUTE_ERROR')

export function findPatternsForRoute (params) {
  return createQueryAction(`index/routes/${params.routeId}/patterns`,
    findPatternsForRouteResponse, findPatternsForRouteError,
    (payload) => {
      // convert pattern array to ID-mapped object
      const patterns = {}
      payload.forEach(ptn => { patterns[ptn.id] = ptn })

      return {
        routeId: params.routeId,
        patterns
      }
    },
    (payload, dispatch) => {
      // load geometry for each pattern
      payload.forEach(ptn => {
        dispatch(findGeometryForPattern({
          routeId: params.routeId,
          patternId: ptn.id
        }))
      })
    }
  )
}

// Geometry for Pattern lookup query

export const findGeometryForPatternResponse = createAction('FIND_GEOMETRY_FOR_PATTERN_RESPONSE')
export const findGeometryForPatternError = createAction('FIND_GEOMETRY_FOR_PATTERN_ERROR')

export function findGeometryForPattern (params) {
  return createQueryAction(`index/patterns/${params.patternId}/geometry`,
    findGeometryForPatternResponse, findGeometryForPatternError,
    (payload) => {
      return {
        routeId: params.routeId,
        patternId: params.patternId,
        geometry: payload
      }
    }
  )
}

// TNC ETA estimate lookup query

export const transportationNetworkCompanyEtaResponse = createAction('TNC_ETA_RESPONSE')
export const transportationNetworkCompanyEtaError = createAction('TNC_ETA_ERROR')

export function getTransportationNetworkCompanyEtaEstimate (params) {
  const {companies, from} = params
  return createQueryAction(
    `transportation_network_company/eta_estimate?${qs.stringify({
      companies,
      from
    })}`, // endpoint
    transportationNetworkCompanyEtaResponse, // responseAction
    transportationNetworkCompanyEtaError, // errorAction
    (payload) => { // rewritePayload
      return {
        from,
        estimates: payload.estimates
      }
    }
  )
}

// TNC ride estimate lookup query

export const transportationNetworkCompanyRideResponse = createAction('TNC_RIDE_RESPONSE')
export const transportationNetworkCompanyRideError = createAction('TNC_RIDE_ERROR')

export function getTransportationNetworkCompanyRideEstimate (params) {
  const {company, from, rideType, to} = params
  return createQueryAction(
    `transportation_network_company/ride_estimate?${qs.stringify({
      company,
      from,
      rideType,
      to
    })}`, // endpoint
    transportationNetworkCompanyRideResponse, // responseAction
    transportationNetworkCompanyRideError, // errorAction
    (payload) => { // rewritePayload
      return {
        company,
        from,
        rideEstimate: payload.rideEstimate,
        to
      }
    }
  )
}

// generic helper for constructing API queries

function createQueryAction (endpoint, responseAction, errorAction, rewritePayload, postprocess) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    const url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/${endpoint}`
    let payload
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      payload = await response.json()
    } catch (err) {
      return dispatch(errorAction(err))
    }

    if (typeof rewritePayload === 'function') {
      dispatch(responseAction(rewritePayload(payload)))
    } else {
      dispatch(responseAction(payload))
    }

    if (typeof postprocess === 'function') {
      postprocess(payload, dispatch, getState)
    }
  }
}

// Nearby Stops Query

const receivedNearbyStopsResponse = createAction('NEARBY_STOPS_RESPONSE')
const receivedNearbyStopsError = createAction('NEARBY_STOPS_ERROR')

export function findNearbyStops (params) {
  return createQueryAction(`index/stops?${qs.stringify({radius: 1000, ...params})}`,
    receivedNearbyStopsResponse, receivedNearbyStopsError,
    stops => ({stops}),
    // retrieve routes for each stop
    (stops, dispatch, getState) => stops
      .forEach(stop => dispatch(findRoutesAtStop(stop.id)))
  )
}

// Routes at Stop query

const receivedRoutesAtStopResponse = createAction('ROUTES_AT_STOP_RESPONSE')
const receivedRoutesAtStopError = createAction('ROUTES_AT_STOP_ERROR')

export function findRoutesAtStop (stopId) {
  return createQueryAction(`index/stops/${stopId}/routes`,
    receivedRoutesAtStopResponse, receivedRoutesAtStopError,
    routes => ({stopId, routes})
  )
}

// Stops within Bounding Box Query

const receivedStopsWithinBBoxResponse = createAction('STOPS_WITHIN_BBOX_RESPONSE')
const receivedStopsWithinBBoxError = createAction('STOPS_WITHIN_BBOX_ERROR')

export function findStopsWithinBBox (params) {
  return createQueryAction(`index/stops?${qs.stringify(params)}`,
    receivedStopsWithinBBoxResponse, receivedStopsWithinBBoxError,
    stops => ({stops})
  )
}

export const clearStops = createAction('CLEAR_STOPS_OVERLAY')
