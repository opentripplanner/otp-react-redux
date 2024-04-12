/* globals fetch */
import { push, replace } from 'connected-react-router'
import hash from 'object-hash'
import haversine from 'haversine'
// Core-utils is preventing typescripting
import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

import { combineQueryParams } from '../util/api'
import { FETCH_STATUS } from '../util/constants'
import { getSecureFetchOptions } from '../util/middleware'

import { MainPanelContent } from './ui-constants'
import v1Actions from './apiV1'
import v2Actions from './apiV2'

if (typeof fetch === 'undefined') require('isomorphic-fetch')

const { getRoutingParams, getUrlParams } = coreUtils.query

// Generic API actions

/*
  This is not actively used, but may be again in the future to 
  facilitate trip monitoring, which requires a non-realtime
  trip 
*/
export const nonRealtimeRoutingResponse = createAction(
  'NON_REALTIME_ROUTING_RESPONSE'
)
export const routingRequest = createAction('ROUTING_REQUEST')
export const routingResponse = createAction('ROUTING_RESPONSE')
export const routingError = createAction('ROUTING_ERROR')
export const setPendingRequests = createAction('SET_PENDING_REQUESTS')
// This action is used to replace a search's itineraries in case they need to be
// modified by some postprocess analysis such as in the field trip module
export const setActiveItineraries = createAction('SET_ACTIVE_ITINERARIES')
export const toggleTracking = createAction('TOGGLE_TRACKING')
export const rememberSearch = createAction('REMEMBER_SEARCH')
export const forgetSearch = createAction('FORGET_SEARCH')

/**
 * Dispatches a method from either v1actions or v2actions, depending on
 * which version of OTP is specified in the config.
 * @param {*} methodName    the method to execute
 * @param  {...any} params  varargs of params to send to the action
 */
function executeOTPAction(methodName, ...params) {
  return function (dispatch, getState) {
    const state = getState()
    const { api } = state.otp.config
    return dispatch(
      api?.v2
        ? v2Actions[methodName](...params)
        : v1Actions[methodName](...params)
    )
  }
}

/**
 * This method determines the fetch options (including API key and Authorization headers) for the OTP API.
 * - If the OTP server is not the middleware server (standalone OTP server),
 *   an empty object is returned.
 * - If the OTP server is the same as the middleware server,
 *   then an object is returned with the following:
 *   - A middleware API key, if it has been set in the configuration (it is most likely required),
 *   - An Auth0 accessToken, when includeToken is true and a user is logged in (userState.loggedInUser is not null).
 * This method assumes JSON request bodies.)
 */
function getOtpFetchOptions(state, includeToken = false) {
  let apiBaseUrl, apiKey, token

  const { api, persistence } = state.otp.config
  if (persistence && persistence.otp_middleware) {
    // Prettier does not understand the syntax on this line
    // eslint-disable-next-line prettier/prettier
    ({ apiBaseUrl, apiKey } = persistence.otp_middleware)
  }

  const isOtpServerSameAsMiddleware = apiBaseUrl === api.host
  if (isOtpServerSameAsMiddleware) {
    if (includeToken && state.user) {
      const { accessToken, loggedInUser } = state.user
      if (accessToken && loggedInUser) {
        token = accessToken
      }
    }

    return getSecureFetchOptions(token, apiKey)
  } else {
    return {}
  }
}

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 */
export function setUrlSearch(params, replaceCurrent = false) {
  return function (dispatch, getState) {
    const base = window.location.pathname
    const path = `${base}?${combineQueryParams(params)}`
    if (replaceCurrent) dispatch(replace(path))
    else dispatch(push(path))
  }
}

/**
 * Update the OTP Query parameters in the URL and ensure that the active search
 * is set correctly. Leaves any other existing URL parameters (e.g., UI) unchanged.
 */
export function updateOtpUrlParams(state, searchId) {
  const { config, currentQuery } = state.otp
  // Get updated OTP params from current query.
  const otpParams = getRoutingParams(config, currentQuery, true)
  return function (dispatch, getState) {
    const params = {}
    // Get all URL params and ensure non-routing params (UI, sessionId) remain
    // unchanged.
    const urlParams = getUrlParams()
    Object.keys(urlParams)
      // If param is non-routing, add to params to keep the same after update.
      .filter((key) => key.indexOf('_') !== -1 || key === 'sessionId')
      .forEach((key) => {
        params[key] = urlParams[key]
      })

    params.ui_activeSearch = searchId
    // Assumes this is a new search and the active itinerary should be reset.
    params.ui_activeItinerary = -1
    // At the same time, reset/delete the ui_itineraryView param.
    params.ui_itineraryView = undefined
    // Merge in the provided OTP params and update the URL.
    dispatch(setUrlSearch(Object.assign(params, otpParams)))
  }
}

/**
 * Send a routing query to the OTP backend.
 *
 * NOTE: We need a random ID so that when a user reloads the page (clearing the
 * state), performs searches, and presses back to load previous searches
 * that are no longer contained in the state we don't confuse the search IDs
 * with search IDs from the new session. If we were to use sequential numbers
 * as IDs, we would run into this problem.
 *
 * The updateSearchInReducer instructs the reducer to update an existing search
 * if it exists. This is used by the field trip module.
 */
export function routingQuery(searchId = null, updateSearchInReducer = false) {
  return executeOTPAction('routingQuery', searchId, updateSearchInReducer)
}

const throttledUrls = {}

function now() {
  return new Date().getTime()
}

const TEN_SECONDS = 10000

// automatically clear throttled urls older than 10 seconds
window.setInterval(() => {
  Object.keys(throttledUrls).forEach((key) => {
    if (throttledUrls[key] < now() - TEN_SECONDS) {
      delete throttledUrls[key]
    }
  })
}, 1000)

/**
 * Handle throttling URL.
 * @param  {[type]} url - API endpoint path
 * @param  {FetchOptions} fetchOptions - fetch options (e.g., method, body, headers).
 * @return {?number} - null if the URL has already been requested in the last
 *   ten seconds, otherwise the UNIX epoch millis of the request time
 */
function handleThrottlingUrl(url, fetchOptions) {
  const throttleKey = fetchOptions ? `${url}-${hash(fetchOptions)}` : url
  if (
    throttledUrls[throttleKey] &&
    throttledUrls[throttleKey] > now() - TEN_SECONDS
  ) {
    // URL already had a request within last 10 seconds, warn and exit
    console.warn(`Request throttled for url: ${url}`)
    return null
  }
  throttledUrls[throttleKey] = now()
  return throttledUrls[throttleKey]
}

/**
 * Reads the (complex + legacy) host name config to renerate a base path to
 * use in building other uris
 * @param  {Object} config   The app-wide config
 * @returns A full URL path
 */
export function assembleBasePath(config) {
  const { api } = config
  return `${api?.host}${api?.port ? ':' + api.port : ''}`
}

/**
 * Generic helper for constructing API queries. Automatically throttles queries
 * to url to no more than once per 10 seconds.
 *
 * @param {string} endpoint - The API endpoint path (does not include
 *   '../otp/routers/router_id/')
 * @param {Function} responseAction - Action to dispatch on a successful API
 * * response. Accepts payload object parameter.
 * @param {Function} errorAction - Function to invoke on API error response.
 *   Accepts error object parameter.
 * @param {Options} options - Any of the following optional settings:
 *   - rewritePayload: Function to be invoked to modify payload before being
 *       passed to responseAction. Accepts and returns payload object.
 *   - postprocess: Function to be invoked after responseAction is invoked.
 *       Accepts payload, dispatch, getState parameters.
 *   - serviceId: identifier for TransitIndex service used in
 *       alternateTransitIndex configuration.
 *   - fetchOptions: fetch options (e.g., method, body, headers).
 */
export function createQueryAction(
  endpoint,
  responseAction,
  errorAction,
  options = {}
) {
  /* eslint-disable-next-line complexity */
  return async function (dispatch, getState) {
    const state = getState()
    const { config } = state.otp

    if (options.appendBounds) {
      const bounds = config?.geocoder?.boundary?.rect
      if (bounds) {
        const stringifiedBounds = '&' + qs.stringify(bounds)
        endpoint += stringifiedBounds
      }
    }

    const { api } = config

    const url = options?.url
      ? // New definition style
        `${assembleBasePath(config)}${api?.basePath ?? '/otp'}${options.url}`
      : // Old definition style
        `${assembleBasePath(config)}${api?.path}/${endpoint}`

    if (!options.noThrottle) {
      // Don't make a request to a URL that has already seen the same request
      // within the last 10 seconds
      if (!handleThrottlingUrl(url, options.fetchOptions)) return
    }

    let payload
    try {
      // Need to merge headers to support graphQL POST request with an api key
      const mergedHeaders = {
        ...getOtpFetchOptions(state, true)?.headers,
        ...options.fetchOptions?.headers
      }

      const response = await fetch(url, {
        ...getOtpFetchOptions(state),
        ...options.fetchOptions,
        headers: mergedHeaders
      })

      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      payload = await response.json()
    } catch (err) {
      return dispatch(errorAction(err))
    }

    try {
      const rewrittenPayload =
        typeof options.rewritePayload === 'function'
          ? options.rewritePayload(payload, dispatch, getState)
          : payload
      dispatch(responseAction(rewrittenPayload))
    } catch (err) {
      return dispatch(errorAction(err))
    }

    if (typeof options.postprocess === 'function') {
      options.postprocess(payload, dispatch, getState)
    }
  }
}

// Park and Ride location query

export const parkAndRideError = createAction('PARK_AND_RIDE_ERROR')
export const parkAndRideResponse = createAction('PARK_AND_RIDE_RESPONSE')

export function parkAndRideQuery(
  params,
  responseAction = parkAndRideResponse,
  errorAction = parkAndRideResponse,
  options = {}
) {
  let endpoint = 'park_and_ride'
  if (params && Object.keys(params).length > 0) {
    endpoint += '?' + qs.stringify(params)
  }
  return createQueryAction(endpoint, responseAction, errorAction, options)
}

// bike rental station query

export const bikeRentalError = createAction('BIKE_RENTAL_ERROR')
export const bikeRentalResponse = createAction('BIKE_RENTAL_RESPONSE')

export function bikeRentalQuery(
  params,
  responseAction = bikeRentalResponse,
  errorAction = bikeRentalError,
  options = {}
) {
  const paramsString = qs.stringify(params)
  const endpoint = `bike_rental${paramsString ? `?${paramsString}` : ''}`
  return createQueryAction(endpoint, responseAction, errorAction, options)
}

// Car rental (e.g. car2go) locations lookup query

export const carRentalResponse = createAction('CAR_RENTAL_RESPONSE')
export const carRentalError = createAction('CAR_RENTAL_ERROR')

export function carRentalQuery(params) {
  return createQueryAction('car_rental', carRentalResponse, carRentalError)
}

// Vehicle rental locations lookup query. For now, there are 3 separate
// "vehicle" rental endpoints - 1 for cars, 1 for bicycle rentals and another
// for micromobility. In the future, the hope is to consolidate these 3
// endpoints into one.

export const vehicleRentalResponse = createAction('VEHICLE_RENTAL_RESPONSE')
export const vehicleRentalError = createAction('VEHICLE_RENTAL_ERROR')

export function vehicleRentalQuery(
  params,
  responseAction = vehicleRentalResponse,
  errorAction = vehicleRentalError,
  options = {}
) {
  return executeOTPAction(
    'vehicleRentalQuery',
    params,
    responseAction,
    errorAction,
    options
  )
}

// Nearby view lookup query
export const fetchNearbyResponse = createAction('FETCH_NEARBY_RESPONSE')
export const fetchNearbyError = createAction('FETCH_NEARBY_ERROR')

export function fetchNearby(coords, map) {
  return executeOTPAction('fetchNearby', coords, map)
}

// Single trip lookup query

export const findTripResponse = createAction('FIND_TRIP_RESPONSE')
export const findTripError = createAction('FIND_TRIP_ERROR')

export function findTrip(params) {
  return executeOTPAction('findTrip', params)
}

// Stops for trip query

export const findStopsForTripResponse = createAction(
  'FIND_STOPS_FOR_TRIP_RESPONSE'
)
export const findStopsForTripError = createAction('FIND_STOPS_FOR_TRIP_ERROR')

export function findStopsForTrip(params) {
  return createQueryAction(
    `index/trips/${params.tripId}/stops`,
    findStopsForTripResponse,
    findStopsForTripError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          stops: payload,
          tripId: params.tripId
        }
      }
    }
  )
}

// Stop times for trip query

export const findStopTimesForTripResponse = createAction(
  'FIND_STOP_TIMES_FOR_TRIP_RESPONSE'
)
export const findStopTimesForTripError = createAction(
  'FIND_STOP_TIMES_FOR_TRIP_ERROR'
)

export function findStopTimesForTrip(params) {
  return createQueryAction(
    `index/trips/${params.tripId}/stoptimes`,
    findStopTimesForTripResponse,
    findStopTimesForTripError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          stopTimes: payload,
          tripId: params.tripId
        }
      }
    }
  )
}

// Geometry for trip query

export const findGeometryForTripResponse = createAction(
  'FIND_GEOMETRY_FOR_TRIP_RESPONSE'
)
export const findGeometryForTripError = createAction(
  'FIND_GEOMETRY_FOR_TRIP_ERROR'
)

export function findGeometryForTrip(params) {
  const { tripId } = params
  return createQueryAction(
    `index/trips/${tripId}/geometry`,
    findGeometryForTripResponse,
    findGeometryForTripError,
    {
      noThrottle: true,
      rewritePayload: (payload) => ({ geometry: payload, tripId })
    }
  )
}

export const fetchingStopTimesForStop = createAction(
  'FETCHING_STOP_TIMES_FOR_STOP'
)
export const findStopTimesForStopResponse = createAction(
  'FIND_STOP_TIMES_FOR_STOP_RESPONSE'
)
export const findStopTimesForStopError = createAction(
  'FIND_STOP_TIMES_FOR_STOP_ERROR'
)

/**
 * Stop times for stop query (used in stop viewer).
 */
export function findStopTimesForStop(params) {
  return executeOTPAction('findStopTimesForStop', params)
}

// Routes lookup query

export const findingRoutes = createAction('FINDING_ROUTES')
export const findRoutesResponse = createAction('FIND_ROUTES_RESPONSE')
export const findRoutesError = createAction('FIND_ROUTES_ERROR')

export function findRoutesIfNeeded(params) {
  return function (dispatch, getState) {
    if (
      getState().otp.transitIndex.routesFetchStatus ===
        FETCH_STATUS.UNFETCHED &&
      getState().otp.ui.mainPanelContent !== MainPanelContent.PATTERN_VIEWER
    ) {
      dispatch(findingRoutes())
      dispatch(executeOTPAction('findRoutes', params))
    }
  }
}

// Patterns for Route lookup query
// TODO: replace with GraphQL query for route => patterns => geometry
export const findPatternsForRouteResponse = createAction(
  'FIND_PATTERNS_FOR_ROUTE_RESPONSE'
)
export const findPatternsForRouteError = createAction(
  'FIND_PATTERNS_FOR_ROUTE_ERROR'
)

// Single Route lookup query

export const findingRoute = createAction('FINDING_ROUTE')
export const findRouteResponse = createAction('FIND_ROUTE_RESPONSE')
export const findRouteError = createAction('FIND_ROUTE_ERROR')

export function findRouteIfNeeded(params) {
  return function (dispatch, getState) {
    const { routeId } = params
    if (!routeId) return

    // If route details were already requested or fetched, don't fetch them again.
    const route = getState().otp.transitIndex.routes[routeId]
    if (route?.patterns || route?.pending) return

    dispatch(findingRoute(routeId))
    dispatch(executeOTPAction('findRoute', params))
  }
}

export function findPatternsForRoute(params) {
  return executeOTPAction('findPatternsForRoute', params)
}

// Geometry for Pattern lookup query

const findGeometryForPatternResponse = createAction(
  'FIND_GEOMETRY_FOR_PATTERN_RESPONSE'
)
const findGeometryForPatternError = createAction(
  'FIND_GEOMETRY_FOR_PATTERN_ERROR'
)

export function findGeometryForPattern(params) {
  return createQueryAction(
    `index/patterns/${params.patternId}/geometry`,
    findGeometryForPatternResponse,
    findGeometryForPatternError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          geometry: payload,
          patternId: params.patternId,
          routeId: params.routeId
        }
      }
    }
  )
}

// Stops for pattern query

export const findStopsForPatternResponse = createAction(
  'FIND_STOPS_FOR_PATTERN_RESPONSE'
)
export const findStopsForPatternError = createAction(
  'FIND_STOPS_FOR_PATTERN_ERROR'
)

export function findStopsForPattern(params) {
  return createQueryAction(
    `index/patterns/${params.patternId}/stops`,
    findStopsForPatternResponse,
    findStopsForPatternError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          patternId: params.patternId,
          routeId: params.routeId,
          stops: payload
        }
      }
    }
  )
}

// TNC ETA estimate lookup query

export const transportationNetworkCompanyEtaResponse =
  createAction('TNC_ETA_RESPONSE')
export const transportationNetworkCompanyEtaError =
  createAction('TNC_ETA_ERROR')

export function getTransportationNetworkCompanyEtaEstimate(params) {
  const { companies, from } = params
  return createQueryAction(
    `transportation_network_company/eta_estimate?${qs.stringify({
      companies,
      from
    })}`, // endpoint
    transportationNetworkCompanyEtaResponse, // responseAction
    transportationNetworkCompanyEtaError, // errorAction
    {
      rewritePayload: (payload) => {
        return {
          estimates: payload.estimates,
          from
        }
      }
    }
  )
}

// TNC ride estimate lookup query

export const transportationNetworkCompanyRideResponse =
  createAction('TNC_RIDE_RESPONSE')
export const transportationNetworkCompanyRideError =
  createAction('TNC_RIDE_ERROR')

export function getTransportationNetworkCompanyRideEstimate(params) {
  const { company, from, rideType, to } = params
  return createQueryAction(
    `transportation_network_company/ride_estimate?${qs.stringify({
      company,
      from,
      rideType,
      to
    })}`, // endpoint
    transportationNetworkCompanyRideResponse, // responseAction
    transportationNetworkCompanyRideError, // errorAction
    {
      rewritePayload: (payload) => {
        return {
          company,
          from,
          rideEstimate: payload.rideEstimate,
          to
        }
      }
    }
  )
}

export const receivedNearbyStopsResponse = createAction('NEARBY_STOPS_RESPONSE')
export const receivedNearbyStopsError = createAction('NEARBY_STOPS_ERROR')

export function findNearbyStops(params, focusStopId) {
  return createQueryAction(
    `index/stops?${qs.stringify({ radius: 1000, ...params })}`,
    receivedNearbyStopsResponse,
    receivedNearbyStopsError,
    {
      noThrottle: true,
      postprocess: (stops, dispatch, getState) => {
        if (params.max && stops.length > params.max)
          stops = stops.slice(0, params.max)
      },
      rewritePayload: (stops) => {
        if (stops) {
          // Sort the stops by proximity
          stops.forEach((stop) => {
            stop.distance = haversine(
              { latitude: params.lat, longitude: params.lon },
              { latitude: stop.lat, longitude: stop.lon }
            )
          })
          stops.sort((a, b) => {
            return a.distance - b.distance
          })
          if (params.max && stops.length > params.max)
            stops = stops.slice(0, params.max)
        }
        return { focusStopId, stops }
      },
      serviceId: 'stops'
      // retrieve routes for each stop
    }
  )
}

// Stops within Bounding Box Query

const receivedStopsWithinBBoxResponse = createAction(
  'STOPS_WITHIN_BBOX_RESPONSE'
)
const receivedStopsWithinBBoxError = createAction('STOPS_WITHIN_BBOX_ERROR')

export function findStopsWithinBBox(params) {
  return createQueryAction(
    `index/stops?${qs.stringify(params)}`,
    receivedStopsWithinBBoxResponse,
    receivedStopsWithinBBoxError,
    {
      appendBounds: true,
      noThrottle: true,
      rewritePayload: (stops) => ({ stops }),
      serviceId: 'stops'
    }
  )
}

export const clearStops = createAction('CLEAR_STOPS_OVERLAY')

// Realtime Vehicle positions query

export const receivedVehiclePositions = createAction(
  'REALTIME_VEHICLE_POSITIONS_RESPONSE'
)
export const receivedVehiclePositionsError = createAction(
  'REALTIME_VEHICLE_POSITIONS_ERROR'
)

export function getVehiclePositionsForRoute(routeId) {
  return executeOTPAction('getVehiclePositionsForRoute', routeId)
}
