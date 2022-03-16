/* eslint-disable @typescript-eslint/no-use-before-define */
// FIXME: This file has many methods and variables used before they are defined.

/* globals fetch */
import { push, replace } from 'connected-react-router'
import hash from 'object-hash'
import haversine from 'haversine'
// Core-utils is preventing typescripting
import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'
import qs from 'qs'

import { convertToPlace, getPersistenceMode } from '../util/user'
import { getSecureFetchOptions } from '../util/middleware'
import { getStopViewerConfig, queryIsValid } from '../util/state'

import { ItineraryView, setItineraryView, setViewedStop } from './ui'
import { rememberPlace } from './user'
import { zoomToStop } from './map'
import v1Actions from './apiV1'
import v2Actions from './apiV2'

if (typeof fetch === 'undefined') require('isomorphic-fetch')

const { getRoutingParams, getTripOptionsFromQuery, getUrlParams } =
  coreUtils.query
const { randId } = coreUtils.storage

// set actions variable that can be set to v2Actions if v2 server is set
let actions = v1Actions

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

function formatRecentPlace(place) {
  return convertToPlace({
    ...place,
    icon: 'clock-o',
    id: `recent-${randId()}`,
    timestamp: new Date().getTime(),
    type: 'recent'
  })
}

function formatRecentSearch(url, state) {
  return {
    id: randId(),
    query: getTripOptionsFromQuery(state.otp.currentQuery, true),
    timestamp: new Date().getTime(),
    url
  }
}

function isStoredPlace(place) {
  return ['home', 'work', 'suggested', 'stop'].indexOf(place.type) !== -1
}

/**
 * Compute the initial activeItinerary. If this is the first search of
 * session (i.e. searches lookup is empty/null) AND an activeItinerary ID
 * is specified in URL parameters, use that ID. Otherwise, use null/0.
 */
function getActiveItinerary(state) {
  const { currentQuery, searches } = state.otp
  let activeItinerary = currentQuery.routingType === 'ITINERARY' ? 0 : null
  // We cannot use window.history.state here to check for the active
  // itinerary param because it is unreliable in some states (e.g.,
  // when the print layout component first loads).
  const urlParams = getUrlParams()
  const hasSearches = !searches || Object.keys(searches).length === 0
  if (hasSearches && urlParams.ui_activeItinerary) {
    activeItinerary = +urlParams.ui_activeItinerary
  }
  return activeItinerary
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
  return function (dispatch, getState) {
    // FIXME: batchId is searchId for now.
    const state = getState()
    const { config, currentQuery } = state.otp
    const persistenceMode = getPersistenceMode(config.persistence)

    const isNewSearch = !searchId
    if (isNewSearch) searchId = randId()
    // Don't permit a routing query if the query is invalid
    if (!queryIsValid(state)) {
      console.warn('Query is invalid. Aborting routing query', currentQuery)
      return
    }

    // Reset itinerary view to default (list view).
    dispatch(setItineraryView(ItineraryView.LIST))
    const activeItinerary = getActiveItinerary(state)
    const {
      combinations,
      routingType,
      wheelchair: accessibleRoutingEnabled
    } = currentQuery

    // For multiple mode combinations, gather injected params from config/query.
    // Otherwise, inject nothing (rely on what's in current query) and perform
    // one iteration.
    const iterations = combinations
      ? combinations
          .map(({ mode, params }) => ({ mode, ...params }))
          // Remove non-accessible combinations when accessible routing is enabled
          .filter((combination) => {
            if (!accessibleRoutingEnabled) return true

            // Explicit check for false is needed to avoid matching
            // combinations without the parameter set (undefined)
            return combination.accessible !== false
          })
      : [{}]
    dispatch(
      routingRequest({
        activeItinerary,
        pending: iterations.length,
        routingType,
        searchId,
        updateSearchInReducer
      })
    )
    return Promise.all(
      iterations.map((injectedParams) => {
        const requestId = randId()
        // fetch a realtime route
        const url = constructRoutingQuery(state, false, {
          batchId: searchId,
          ...injectedParams
        })

        const { user } = state
        const storeTripHistory =
          user && user.loggedInUser && user.loggedInUser.storeTripHistory

        const realTimeFetch = fetch(
          url,
          getOtpFetchOptions(state, storeTripHistory)
        )
          .then(getJsonAndCheckResponse)
          .then((json) => {
            const dispatchedRoutingResponse = dispatch(
              routingResponse({
                requestId,
                response: json,
                searchId
              })
            )
            // If tracking is enabled, store locations and search after successful
            // search is completed.
            if (
              persistenceMode.isLocalStorage &&
              state.user?.localUser?.storeTripHistory
            ) {
              const { from, to } = currentQuery
              if (!isStoredPlace(from)) {
                dispatch(
                  rememberPlace({
                    location: formatRecentPlace(from),
                    type: 'recent'
                  })
                )
              }
              if (!isStoredPlace(to)) {
                dispatch(
                  rememberPlace({
                    location: formatRecentPlace(to),
                    type: 'recent'
                  })
                )
              }
              dispatch(rememberSearch(formatRecentSearch(url, state)))
            }
            return dispatchedRoutingResponse
          })
          .catch((error) => {
            dispatch(routingError({ error, requestId, searchId, url }))
          })
        // Update OTP URL params if a new search. In other words, if we're
        // performing a search based on query params taken from the URL after a back
        // button press, we don't need to update the OTP URL.
        // TODO: For old searches that we are re-running, should we be **replacing**
        //  the URL params here (instead of **pushing** a new path to history like
        //  what currently happens in updateOtpUrlParams)? That way we could ensure
        //  that the path absolutely accurately reflects the app state.
        const params = getUrlParams()
        if (isNewSearch || params.ui_activeSearch !== searchId) {
          dispatch(updateOtpUrlParams(state, searchId))
        }

        return realTimeFetch
      })
    )
  }
}

function getJsonAndCheckResponse(res) {
  if (res.status >= 400) {
    const error = new Error('Received error from server')
    error.response = res
    throw error
  }
  return res.json()
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
  if (api.v2) actions = v2Actions
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

function constructRoutingQuery(
  state,
  ignoreRealtimeUpdates,
  injectedParams = {}
) {
  const { config, currentQuery } = state.otp
  const routingType = currentQuery.routingType
  // Check for routingType-specific API config; if none, use default API
  const rt =
    config.routingTypes &&
    config.routingTypes.find((rt) => rt.key === routingType)
  const api = (rt && rt.api) || config.api
  const planEndpoint = `${api.host}${api.port ? ':' + api.port : ''}${
    api.path
  }/plan`
  const params = {
    ...getRoutingParams(config, currentQuery, ignoreRealtimeUpdates),
    // Apply mode override, if specified (for batch routing).
    ...injectedParams
  }
  return `${planEndpoint}?${qs.stringify(params, { arrayFormat: 'repeat' })}`
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
  return actions.vehicleRentalQuery(
    params,
    responseAction,
    errorAction,
    options
  )
}

// Single stop lookup query
export const findStopResponse = createAction('FIND_STOP_RESPONSE')
export const findStopError = createAction('FIND_STOP_ERROR')

export function fetchStopInfo(stop) {
  return actions.fetchStopInfo(stop)
}

// Single trip lookup query

export const findTripResponse = createAction('FIND_TRIP_RESPONSE')
export const findTripError = createAction('FIND_TRIP_ERROR')

export function findTrip(params) {
  return actions.findTrip(params)
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

const fetchingStopTimesForStop = createAction('FETCHING_STOP_TIMES_FOR_STOP')
const findStopTimesForStopResponse = createAction(
  'FIND_STOP_TIMES_FOR_STOP_RESPONSE'
)
const findStopTimesForStopError = createAction('FIND_STOP_TIMES_FOR_STOP_ERROR')

/**
 * Stop times for stop query (used in stop viewer).
 */
export function findStopTimesForStop(params) {
  return function (dispatch, getState) {
    const state = getState()
    dispatch(fetchingStopTimesForStop(params))
    const { date, stopId, ...otherParams } = params
    let datePath = ''
    if (date) {
      const dateWithoutDashes = date.replace(/-/g, '')
      datePath = `/${dateWithoutDashes}`
    }

    // If other params not provided, fall back on defaults from stop viewer config.
    // Note: query params don't apply with the OTP /date endpoint.
    const queryParams = { ...getStopViewerConfig(state), ...otherParams }

    // If no start time is provided and no date is provided in params,
    // pass in the current time. Note: this is not
    // a required param by the back end, but if a value is not provided, the
    // time defaults to the server's time, which can make it difficult to test
    // scenarios when you may want to use a different date/time for your local
    // testing environment.
    if (!queryParams.startTime && !date) {
      const nowInSeconds = Math.floor(new Date().getTime() / 1000)
      queryParams.startTime = nowInSeconds
    }

    // (Re-)fetch stop times for the stop.
    dispatch(
      createQueryAction(
        `index/stops/${stopId}/stoptimes${datePath}?${qs.stringify(
          queryParams
        )}`,
        findStopTimesForStopResponse,
        findStopTimesForStopError,
        {
          noThrottle: true,
          rewritePayload: (stopTimes) => {
            return {
              stopId,
              stopTimes
            }
          }
        }
      )
    )
  }
}

// Routes lookup query

const findRoutesResponse = createAction('FIND_ROUTES_RESPONSE')
const findRoutesError = createAction('FIND_ROUTES_ERROR')

export function findRoutes(params) {
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

// Patterns for Route lookup query
// TODO: replace with GraphQL query for route => patterns => geometry
const findPatternsForRouteResponse = createAction(
  'FIND_PATTERNS_FOR_ROUTE_RESPONSE'
)
const findPatternsForRouteError = createAction('FIND_PATTERNS_FOR_ROUTE_ERROR')

// Single Route lookup query

export const findRouteResponse = createAction('FIND_ROUTE_RESPONSE')
export const findRouteError = createAction('FIND_ROUTE_ERROR')

export function findRoute(params) {
  return createQueryAction(
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
}

export function findPatternsForRoute(params) {
  return createQueryAction(
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

// Nearby Stops Query
export const findNearbyAmenitiesResponse = createAction(
  'FIND_NEARBY_AMENITIES_RESPONSE'
)
export const findNearbyAmenitiesError = createAction(
  'FIND_NEARBY_AMENITIES_ERROR'
)

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

// Routes at Stop query

const receivedRoutesAtStopResponse = createAction('ROUTES_AT_STOP_RESPONSE')
const receivedRoutesAtStopError = createAction('ROUTES_AT_STOP_ERROR')

export function findRoutesAtStop(stopId) {
  return createQueryAction(
    `index/stops/${stopId}/routes`,
    receivedRoutesAtStopResponse,
    receivedRoutesAtStopError,
    {
      noThrottle: true,
      rewritePayload: (routes) => ({ routes, stopId }),
      serviceId: 'stops/routes'
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
  return actions.getVehiclePositionsForRoute(routeId)
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
 * Generic helper for constructing API queries. Automatically throttles queries
 * to url to no more than once per 10 seconds.
 *
 * @param {string} endpoint - The API endpoint path (does not include
 *   '../otp/routers/router_id/')
 * @param {Function} responseAction - Action to dispatch on a successful API
 *   response. Accepts payload object parameter.
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
    const url = makeApiUrl(config, endpoint, options)

    if (!options.noThrottle) {
      // Don't make a request to a URL that has already seen the same request
      // within the last 10 seconds
      if (!handleThrottlingUrl(url, options.fetchOptions)) return
    }

    let payload
    try {
      // Need to merge headers to support graphQL POST request with an api key
      const mergedHeaders = {
        ...getOtpFetchOptions(state)?.headers,
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

    if (typeof options.rewritePayload === 'function') {
      dispatch(
        responseAction(options.rewritePayload(payload, dispatch, getState))
      )
    } else {
      dispatch(responseAction(payload))
    }

    if (typeof options.postprocess === 'function') {
      options.postprocess(payload, dispatch, getState)
    }
  }
}

/**
 * Creates the URL to use for making an API request.
 *
 * @param  {Object} config   The app-wide config
 * @param  {string} endpoint The API endpoint path
 * @param  {Object} options  The options object for the API request
 * @return {string}          The URL to use for making the http request
 */
function makeApiUrl(config, endpoint, options) {
  let url
  if (
    options.serviceId &&
    config.alternateTransitIndex &&
    config.alternateTransitIndex.services.includes(options.serviceId)
  ) {
    console.log('Using alt service for ' + options.serviceId)
    url = config.alternateTransitIndex.apiRoot + endpoint
  } else {
    const api = config.api

    // Don't crash if no api is defined (such as in the unit test env)
    if (!api?.host) return null

    url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/${endpoint}`
  }
  return url
}

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 */
export function setUrlSearch(params, replaceCurrent = false) {
  return function (dispatch, getState) {
    const base = getState().router.location.pathname
    const path = `${base}?${qs.stringify(params, { arrayFormat: 'repeat' })}`
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
    params.ui_activeItinerary = 0
    // Merge in the provided OTP params and update the URL.
    dispatch(setUrlSearch(Object.assign(params, otpParams)))
  }
}
