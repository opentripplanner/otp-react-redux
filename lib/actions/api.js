/* globals fetch */

import { createAction } from 'redux-actions'
import qs from 'qs'
import { queryIsValid } from '../util/state'
import queryParams from '../util/query-params'
import moment from 'moment'

if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

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
  const api = isItinerary ? config.api : config.profileApi
  const planEndpoint = `${api.host}${api.port
    ? ':' + api.port
    : ''}${api.path}/plan`

  let params = {}
  queryParams
    .filter(
      qp => qp.routingTypes.indexOf(routingType) !== -1 && qp.name in currentQuery
    )
    .forEach(qp => {
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

  const stringParams = qs.stringify(params)

  // TODO: set url hash based on params
  // setURLSearch(stringParams)
  // TODO: check that valid from/to locations are provided

  return `${planEndpoint}?${stringParams}`
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

// TODO: convert the rest of these to use the above createQueryAction helper

// Nearby Stops Query

export const receivedNearbyStopsResponse = createAction('NEARBY_STOPS_RESPONSE')
export const receivedNearbyStopsError = createAction('NEARBY_STOPS_ERROR')

export function findNearbyStops (params) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    params = Object.assign({ radius: 1000 }, params)
    const paramStr = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    const url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/index/stops?${paramStr}`
    let stops
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      stops = await response.json()
    } catch (err) {
      return dispatch(receivedNearbyStopsError(err))
    }

    stops.sort((a, b) => a.dist - b.dist)
    if (stops.length > 5) stops = stops.slice(0, 5)
    dispatch(receivedNearbyStopsResponse({ stops }))

    // retrieve routes for each stop
    stops.forEach(stop => {
      dispatch(findRoutesAtStop(stop.id))
    })
  }
}

// Routes at Stop query

export const receivedRoutesAtStopResponse = createAction('ROUTES_AT_STOP_RESPONSE')
export const receivedRoutesAtStopError = createAction('ROUTES_AT_STOP_ERROR')

export function findRoutesAtStop (stopId) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    const url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/index/stops/${stopId}/routes`
    let routes
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      routes = await response.json()
    } catch (err) {
      return dispatch(receivedRoutesAtStopError(err))
    }

    dispatch(receivedRoutesAtStopResponse({ stopId, routes }))
  }
}

// Stops within Bounding Box Query

export const receivedStopsWithinBBoxResponse = createAction('STOPS_WITHIN_BBOX_RESPONSE')
export const receivedStopsWithinBBoxError = createAction('STOPS_WITHIN_BBOX_ERROR')

export function findStopsWithinBBox (params) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    const paramStr = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    const url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/index/stops?${paramStr}`
    let stops
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      stops = await response.json()
    } catch (err) {
      return dispatch(receivedStopsWithinBBoxError(err))
    }

    dispatch(receivedStopsWithinBBoxResponse({ stops }))
  }
}

export const clearStops = createAction('CLEAR_STOPS_OVERLAY')
