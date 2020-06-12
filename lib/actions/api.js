/* globals fetch */
import { push, replace } from 'connected-react-router'
import haversine from 'haversine'
import moment from 'moment'
import hash from 'object-hash'
import coreUtils from '@opentripplanner/core-utils'
import queryParams from '@opentripplanner/core-utils/lib/query-params'
import { createAction } from 'redux-actions'
import qs from 'qs'

import { rememberPlace } from './map'
import { getStopViewerConfig, queryIsValid } from '../util/state'
if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

// FIXME: Remove formatPlace func.
const formatPlace = (location, alternateName) => {
  if (!location) return null
  const name =
    location.name ||
    `${alternateName || 'Place'} (${location.lat},${location.lon})`
  return `${name}::${location.lat},${location.lon}`
}

// FIXME Add these new query params to otp-ui
queryParams.push(
  {
    /* to - the trip destination. stored internally as a location (lat/lon/name) object  */
    name: 'bannedRoutes',
    routingTypes: ['ITINERARY'],
    default: ''
  },
  {
    /* to - the trip destination. stored internally as a location (lat/lon/name) object  */
    name: 'numItineraries',
    routingTypes: ['ITINERARY'],
    default: 3
  },
  {
    name: 'intermediatePlaces',
    default: [],
    routingTypes: ['ITINERARY'],
    itineraryRewrite: places => Array.isArray(places) && places.length > 0
      ? ({intermediatePlaces: places.map(place => formatPlace(place)).join(',')})
      : undefined
  },
  {
    name: 'otherThanPreferredRoutesPenalty',
    default: 2147483647,
    routingTypes: ['ITINERARY']
  },
  {
    /* to - the trip destination. stored internally as a location (lat/lon/name) object  */
    name: 'preferredRoutes',
    routingTypes: ['ITINERARY'],
    default: ''
  }
)

const { hasCar } = coreUtils.itinerary
const { getTripOptionsFromQuery, getUrlParams } = coreUtils.query
const { randId } = coreUtils.storage
const { OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } = coreUtils.time

// Generic API actions

export const nonRealtimeRoutingResponse = createAction('NON_REALTIME_ROUTING_RESPONSE')
export const routingRequest = createAction('ROUTING_REQUEST')
export const routingResponse = createAction('ROUTING_RESPONSE')
export const routingError = createAction('ROUTING_ERROR')
export const toggleTracking = createAction('TOGGLE_TRACKING')
export const rememberSearch = createAction('REMEMBER_SEARCH')
export const forgetSearch = createAction('FORGET_SEARCH')

function formatRecentPlace (place) {
  return {
    ...place,
    type: 'recent',
    icon: 'clock-o',
    id: `recent-${randId()}`,
    timestamp: new Date().getTime()
  }
}

function formatRecentSearch (url, otpState) {
  return {
    query: getTripOptionsFromQuery(otpState.currentQuery, true),
    url,
    id: randId(),
    timestamp: new Date().getTime()
  }
}

function isStoredPlace (place) {
  return ['home', 'work', 'suggested', 'stop'].indexOf(place.type) !== -1
}

/**
 * Compute the initial activeItinerary. If this is the first search of
 * session (i.e. searches lookup is empty/null) AND an activeItinerary ID
 * is specified in URL parameters, use that ID. Otherwise, use null/0.
 */
function getActiveItinerary (otpState) {
  // FIXME: provide config option to set default active itinerary?
  let activeItinerary = null
  // We cannot use window.history.state here to check for the active
  // itinerary param because it is unreliable in some states (e.g.,
  // when the print layout component first loads).
  const urlParams = getUrlParams()
  if (
    (!otpState.searches || Object.keys(otpState.searches).length === 0) &&
    urlParams.ui_activeItinerary
  ) {
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
 */
export function routingQuery (searchId = null) {
  return async function (dispatch, getState) {
    // FIXME: batchId is searchId for now.
    const isNewSearch = !searchId
    if (isNewSearch) searchId = randId()
    const otpState = getState().otp
    // Don't permit a routing query if the query is invalid
    if (!queryIsValid(otpState)) {
      console.warn('Query is invalid. Aborting routing query', otpState.currentQuery)
      return
    }
    const activeItinerary = getActiveItinerary(otpState)
    const routingType = otpState.currentQuery.routingType
    // For multiple mode combinations, gather injected params from config/query.
    // Otherwise, inject nothing (rely on what's in current query) and perform
    // one iteration.
    const iterations = otpState.config.modes.combinations
      ? otpState.config.modes.combinations.map(({mode, params}) => ({mode, ...params}))
      : [{}]
    dispatch(routingRequest({ activeItinerary, routingType, searchId, pending: iterations.length }))
    iterations.forEach((injectedParams, i) => {
      const requestId = randId()
      // fetch a realtime route
      const query = constructRoutingQuery(otpState, false, injectedParams)
      fetch(query)
        .then(getJsonAndCheckResponse)
        .then(json => {
          dispatch(routingResponse({ response: json, requestId, searchId }))
          // If tracking is enabled, store locations and search after successful
          // search is completed.
          if (otpState.user.trackRecent) {
            const { from, to } = otpState.currentQuery
            if (!isStoredPlace(from)) {
              dispatch(rememberPlace({ type: 'recent', location: formatRecentPlace(from) }))
            }
            if (!isStoredPlace(to)) {
              dispatch(rememberPlace({ type: 'recent', location: formatRecentPlace(to) }))
            }
            dispatch(rememberSearch(formatRecentSearch(query, otpState)))
          }
        })
        .catch(error => {
          dispatch(routingError({ error, requestId, searchId }))
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
        dispatch(updateOtpUrlParams(otpState, searchId))
      }
      // also fetch a non-realtime route
      // FIXME: This has been disabled for now in anticipation of FDOT RMCE
      // enhancements.
      // fetch(constructRoutingQuery(otpState, true))
      //   .then(getJsonAndCheckResponse)
      //   .then(json => {
      //     // FIXME: This is only performed when ignoring realtimeupdates currently, just
      //     // to ensure it is not repeated twice.
      //     dispatch(nonRealtimeRoutingResponse({ response: json, searchId }))
      //   })
      //   .catch(error => {
      //     console.error(error)
      //     // do nothing
      //   })
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

function constructRoutingQuery (otpState, ignoreRealtimeUpdates, injectedParams = {}) {
  const { config, currentQuery } = otpState
  const routingType = currentQuery.routingType
  // Check for routingType-specific API config; if none, use default API
  const rt = config.routingTypes && config.routingTypes.find(rt => rt.key === routingType)
  const api = (rt && rt.api) || config.api
  const planEndpoint = `${api.host}${api.port
    ? ':' + api.port
    : ''}${api.path}/plan`
  const params = getRoutingParams(currentQuery, ignoreRealtimeUpdates)
  // Apply mode override, if specified (for batch routing).
  Object.keys(injectedParams).forEach(key => {
    params[key] = injectedParams[key]
  })
  return `${planEndpoint}?${qs.stringify(params)}`
}

export function getRoutingParams (query, config, ignoreRealtimeUpdates) {
  const routingType = query.routingType
  const isItinerary = routingType === 'ITINERARY'
  let params = {}

  // Start with the universe of OTP parameters defined in query-params.js:
  queryParams
    .filter(qp => {
      // A given parameter is included in the request if all of the following:
      // 1. Must apply to the active routing type (ITINERARY or PROFILE)
      // 2. Must be included in the current user-defined query
      // 3. Must pass the parameter's applicability test, if one is specified
      return qp.routingTypes.indexOf(routingType) !== -1 &&
        qp.name in query &&
        (typeof qp.applicable !== 'function' || qp.applicable(query, config))
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
          ? rewriteFunction(query[qp.name])
          : { [qp.name]: query[qp.name] }
      )
    })

  // Additional processing specific to ITINERARY mode
  if (isItinerary) {
    // override ignoreRealtimeUpdates if provided
    if (typeof ignoreRealtimeUpdates === 'boolean') {
      params.ignoreRealtimeUpdates = ignoreRealtimeUpdates
    }

    // check date/time validity; ignore both if either is invalid
    const dateValid = moment(params.date, OTP_API_DATE_FORMAT).isValid()
    const timeValid = moment(params.time, OTP_API_TIME_FORMAT).isValid()

    if (!dateValid || !timeValid) {
      delete params.time
      delete params.date
    }

    // temp: set additional parameters for CAR_HAIL or CAR_RENT trips
    if (
      params.mode &&
      (params.mode.includes('CAR_HAIL') || params.mode.includes('CAR_RENT'))
    ) {
      params.minTransitDistance = '50%'
      // increase search timeout because these queries can take a while
      params.searchTimeout = 10000
    }

    // set onlyTransitTrips for car rental searches
    if (params.mode && params.mode.includes('CAR_RENT')) {
      params.onlyTransitTrips = true
    }

  // Additional processing specific to PROFILE mode
  } else {
    // check start and end time validity; ignore both if either is invalid
    const startTimeValid = moment(params.startTime, OTP_API_TIME_FORMAT).isValid()
    const endTimeValid = moment(params.endTime, OTP_API_TIME_FORMAT).isValid()

    if (!startTimeValid || !endTimeValid) {
      delete params.startTimeValid
      delete params.endTimeValid
    }
  }

  // TODO: check that valid from/to locations are provided

  // hack to add walking to driving/TNC trips
  if (hasCar(params.mode)) {
    params.mode += ',WALK'
  }

  return params
}

// Park and Ride location query

export const parkAndRideError = createAction('PARK_AND_RIDE_ERROR')
export const parkAndRideResponse = createAction('PARK_AND_RIDE_RESPONSE')

export function parkAndRideQuery (params) {
  let endpoint = 'park_and_ride'
  if (params && Object.keys(params).length > 0) {
    endpoint += '?' + Object.keys(params).map(key => key + '=' + params[key]).join('&')
  }
  return createQueryAction(endpoint, parkAndRideResponse, parkAndRideError)
}

// bike rental station query

export const bikeRentalError = createAction('BIKE_RENTAL_ERROR')
export const bikeRentalResponse = createAction('BIKE_RENTAL_RESPONSE')

export function bikeRentalQuery (params) {
  return createQueryAction('bike_rental', bikeRentalResponse, bikeRentalError)
}

// Car rental (e.g. car2go) locations lookup query

export const carRentalResponse = createAction('CAR_RENTAL_RESPONSE')
export const carRentalError = createAction('CAR_RENTAL_ERROR')

export function carRentalQuery (params) {
  return createQueryAction('car_rental', carRentalResponse, carRentalError)
}

// Vehicle rental locations lookup query. For now, there are 3 seperate
// "vehicle" rental endpoints - 1 for cars, 1 for bicycle rentals and another
// for micromobility. In the future, the hope is to consolidate these 3
// endpoints into one.

export const vehicleRentalResponse = createAction('VEHICLE_RENTAL_RESPONSE')
export const vehicleRentalError = createAction('VEHICLE_RENTAL_ERROR')

export function vehicleRentalQuery (params) {
  return createQueryAction('vehicle_rental', vehicleRentalResponse, vehicleRentalError)
}

// Single stop lookup query
const findStopResponse = createAction('FIND_STOP_RESPONSE')
const findStopError = createAction('FIND_STOP_ERROR')

export function findStop (params) {
  return createQueryAction(
    `index/stops/${params.stopId}`,
    findStopResponse,
    findStopError,
    {
      serviceId: 'stops',
      postprocess: (payload, dispatch) => {
        dispatch(findRoutesAtStop(params.stopId))
        dispatch(findStopTimesForStop(params))
      },
      noThrottle: true
    }
  )
}

// TODO: Optionally substitute GraphQL queries? Note: this is not currently
// possible because gtfsdb (the alternative transit index used by TriMet) does not
// support GraphQL queries.
// export function findStop (params) {
//   const query = `
// query stopQuery($stopId: [String]) {
//   stops (ids: $stopId) {
//     id: gtfsId
//     code
//     name
//     url
//     lat
//     lon
//     stoptimesForPatterns {
//       pattern {
//         id: semanticHash
//         route {
//           id: gtfsId
//           longName
//           shortName
//           sortOrder
//         }
//       }
//       stoptimes {
//         scheduledArrival
//         realtimeArrival
//         arrivalDelay
//         scheduledDeparture
//         realtimeDeparture
//         departureDelay
//         timepoint
//         realtime
//         realtimeState
//         serviceDay
//         headsign
//       }
//     }
//   }
// }
// `
//   return createGraphQLQueryAction(
//     query,
//     { stopId: params.stopId },
//     findStopResponse,
//     findStopError,
//     {
//       // find stop should not be throttled since it can make quite frequent
//       // updates when fetching stop times for a stop
//       noThrottle: true,
//       serviceId: 'stops',
//       rewritePayload: (payload) => {
//         // convert pattern array to ID-mapped object
//         const patterns = []
//         const { stoptimesForPatterns, ...stop } = payload.data.stops[0]
//         stoptimesForPatterns.forEach(obj => {
//           const { pattern, stoptimes: stopTimes } = obj
//           // It's possible that not all stop times for a pattern will share the
//           // same headsign, but this is probably a minor edge case.
//           const headsign = stopTimes[0]
//             ? stopTimes[0].headsign
//             : pattern.route.longName
//           const patternIndex = patterns.findIndex(p =>
//             p.headsign === headsign && pattern.route.id === p.route.id)
//           if (patternIndex === -1) {
//             patterns.push({ ...pattern, headsign, stopTimes })
//           } else {
//             patterns[patternIndex].stopTimes.push(...stopTimes)
//           }
//         })
//         return {
//           ...stop,
//           patterns
//         }
//       }
//     }
//   )
// }

// Single trip lookup query

export const findTripResponse = createAction('FIND_TRIP_RESPONSE')
export const findTripError = createAction('FIND_TRIP_ERROR')

export function findTrip (params) {
  return createQueryAction(
    `index/trips/${params.tripId}`,
    findTripResponse,
    findTripError,
    {
      postprocess: (payload, dispatch) => {
        dispatch(findStopsForTrip({tripId: params.tripId}))
        dispatch(findStopTimesForTrip({tripId: params.tripId}))
        dispatch(findGeometryForTrip({tripId: params.tripId}))
      }
    }
  )
}

// Stops for trip query

export const findStopsForTripResponse = createAction('FIND_STOPS_FOR_TRIP_RESPONSE')
export const findStopsForTripError = createAction('FIND_STOPS_FOR_TRIP_ERROR')

export function findStopsForTrip (params) {
  return createQueryAction(
    `index/trips/${params.tripId}/stops`,
    findStopsForTripResponse,
    findStopsForTripError,
    {
      rewritePayload: (payload) => {
        return {
          tripId: params.tripId,
          stops: payload
        }
      }
    }
  )
}

// Stop times for trip query

export const findStopTimesForTripResponse = createAction('FIND_STOP_TIMES_FOR_TRIP_RESPONSE')
export const findStopTimesForTripError = createAction('FIND_STOP_TIMES_FOR_TRIP_ERROR')

export function findStopTimesForTrip (params) {
  return createQueryAction(
    `index/trips/${params.tripId}/stoptimes`,
    findStopTimesForTripResponse,
    findStopTimesForTripError,
    {
      rewritePayload: (payload) => {
        return {
          tripId: params.tripId,
          stopTimes: payload
        }
      },
      noThrottle: true
    }
  )
}

// Geometry for trip query

export const findGeometryForTripResponse = createAction('FIND_GEOMETRY_FOR_TRIP_RESPONSE')
export const findGeometryForTripError = createAction('FIND_GEOMETRY_FOR_TRIP_ERROR')

export function findGeometryForTrip (params) {
  const { tripId } = params
  return createQueryAction(
    `index/trips/${tripId}/geometry`,
    findGeometryForTripResponse,
    findGeometryForTripError,
    {
      rewritePayload: (payload) => ({ tripId, geometry: payload })
    }
  )
}

const findStopTimesForStopResponse = createAction('FIND_STOP_TIMES_FOR_STOP_RESPONSE')
const findStopTimesForStopError = createAction('FIND_STOP_TIMES_FOR_STOP_ERROR')

/**
 * Stop times for stop query (used in stop viewer).
 */
export function findStopTimesForStop (params) {
  return function (dispatch, getState) {
    let { stopId, ...otherParams } = params
    // If other params not provided, fall back on defaults from stop viewer config.
    const queryParams = { ...getStopViewerConfig(getState().otp), ...otherParams }
    // If no start time is provided, pass in the current time. Note: this is not
    // a required param by the back end, but if a value is not provided, the
    // time defaults to the server's time, which can make it difficult to test
    // scenarios when you may want to use a different date/time for your local
    // testing environment.
    if (!queryParams.startTime) {
      const nowInSeconds = Math.floor((new Date()).getTime() / 1000)
      queryParams.startTime = nowInSeconds
    }
    dispatch(createQueryAction(
      `index/stops/${stopId}/stoptimes?${qs.stringify(queryParams)}`,
      findStopTimesForStopResponse,
      findStopTimesForStopError,
      {
        rewritePayload: (stopTimes) => {
          return {
            stopId,
            stopTimes
          }
        },
        noThrottle: true
      }
    ))
  }
}

// Routes lookup query

const findRoutesResponse = createAction('FIND_ROUTES_RESPONSE')
const findRoutesError = createAction('FIND_ROUTES_ERROR')

export function findRoutes (params) {
  return createQueryAction(
    'index/routes',
    findRoutesResponse,
    findRoutesError,
    {
      serviceId: 'routes',
      rewritePayload: (payload) => {
        const routes = {}
        payload.forEach(rte => { routes[rte.id] = rte })
        return routes
      }
    }
  )
}

// export function findRoutes (params) {
//   const query = `
// {
//   routes {
//     id: gtfsId
//     color
//     longName
//     shortName
//     mode
//     type
//     desc
//     bikesAllowed
//     sortOrder
//     textColor
//     url
//     agency {
//       id: gtfsId
//       name
//       url
//     }
//   }
// }
//   `
//   return createGraphQLQueryAction(
//     query,
//     {},
//     findRoutesResponse,
//     findRoutesError,
//     {
//       serviceId: 'routes',
//       rewritePayload: (payload) => {
//         const routes = {}
//         payload.data.routes.forEach(rte => { routes[rte.id] = rte })
//         return routes
//       }
//     }
//   )
// }

// Patterns for Route lookup query
// TODO: replace with GraphQL query for route => patterns => geometry
const findPatternsForRouteResponse = createAction('FIND_PATTERNS_FOR_ROUTE_RESPONSE')
const findPatternsForRouteError = createAction('FIND_PATTERNS_FOR_ROUTE_ERROR')

// Single Route lookup query

export const findRouteResponse = createAction('FIND_ROUTE_RESPONSE')
export const findRouteError = createAction('FIND_ROUTE_ERROR')

export function findRoute (params) {
  return createQueryAction(
    `index/routes/${params.routeId}`,
    findRouteResponse,
    findRouteError,
    {
      postprocess: (payload, dispatch) => {
        // load patterns
        dispatch(findPatternsForRoute({ routeId: params.routeId }))
      },
      noThrottle: true
    }
  )
}

export function findPatternsForRoute (params) {
  return createQueryAction(
    `index/routes/${params.routeId}/patterns`,
    findPatternsForRouteResponse,
    findPatternsForRouteError,
    {
      rewritePayload: (payload) => {
        // convert pattern array to ID-mapped object
        const patterns = {}
        payload.forEach(ptn => { patterns[ptn.id] = ptn })

        return {
          routeId: params.routeId,
          patterns
        }
      },
      postprocess: (payload, dispatch) => {
        // load geometry for each pattern
        payload.forEach(ptn => {
          dispatch(findGeometryForPattern({
            routeId: params.routeId,
            patternId: ptn.id
          }))
        })
      }
    }
  )
}

// Geometry for Pattern lookup query

const findGeometryForPatternResponse = createAction('FIND_GEOMETRY_FOR_PATTERN_RESPONSE')
const findGeometryForPatternError = createAction('FIND_GEOMETRY_FOR_PATTERN_ERROR')

export function findGeometryForPattern (params) {
  return createQueryAction(
    `index/patterns/${params.patternId}/geometry`,
    findGeometryForPatternResponse,
    findGeometryForPatternError,
    {
      rewritePayload: (payload) => {
        return {
          routeId: params.routeId,
          patternId: params.patternId,
          geometry: payload
        }
      }
    }
  )
}

// export function findRoute (params) {
//   const query = `
//   query routeQuery($routeId: [String]) {
//     routes (ids: $routeId) {
//       id: gtfsId
//       patterns {
//         id: semanticHash
//         directionId
//         headsign
//         name
//         semanticHash
//         geometry {
//           lat
//           lon
//         }
//       }
//     }
//   }
//   `
//   return createGraphQLQueryAction(
//     query,
//     { routeId: params.routeId },
//     findPatternsForRouteResponse,
//     findPatternsForRouteError,
//     {
//       rewritePayload: (payload) => {
//         // convert pattern array to ID-mapped object
//         const patterns = {}
//         payload.data.routes[0].patterns.forEach(ptn => {
//           patterns[ptn.id] = {
//             routeId: params.routeId,
//             patternId: ptn.id,
//             geometry: ptn.geometry
//           }
//         })
//
//         return {
//           routeId: params.routeId,
//           patterns
//         }
//       }
//     }
//   )
// }

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
    {
      rewritePayload: (payload) => {
        return {
          from,
          estimates: payload.estimates
        }
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

const receivedNearbyStopsResponse = createAction('NEARBY_STOPS_RESPONSE')
const receivedNearbyStopsError = createAction('NEARBY_STOPS_ERROR')

export function findNearbyStops (params) {
  return createQueryAction(
    `index/stops?${qs.stringify({radius: 1000, ...params})}`,
    receivedNearbyStopsResponse,
    receivedNearbyStopsError,
    {
      serviceId: 'stops',
      rewritePayload: stops => {
        if (stops) {
          // Sort the stops by proximity
          stops.forEach(stop => {
            stop.distance = haversine(
              { latitude: params.lat, longitude: params.lon },
              { latitude: stop.lat, longitude: stop.lon }
            )
          })
          stops.sort((a, b) => { return a.distance - b.distance })
          if (params.max && stops.length > params.max) stops = stops.slice(0, params.max)
        }
        return {stops}
      },
      // retrieve routes for each stop
      postprocess: (stops, dispatch, getState) => {
        if (params.max && stops.length > params.max) stops = stops.slice(0, params.max)
        stops.forEach(stop => dispatch(findRoutesAtStop(stop.id)))
      }
    }
  )
}

// Routes at Stop query

const receivedRoutesAtStopResponse = createAction('ROUTES_AT_STOP_RESPONSE')
const receivedRoutesAtStopError = createAction('ROUTES_AT_STOP_ERROR')

export function findRoutesAtStop (stopId) {
  return createQueryAction(
    `index/stops/${stopId}/routes`,
    receivedRoutesAtStopResponse,
    receivedRoutesAtStopError,
    {
      serviceId: 'stops/routes',
      rewritePayload: routes => ({ stopId, routes }),
      noThrottle: true
    }
  )
}

// Stops within Bounding Box Query

const receivedStopsWithinBBoxResponse = createAction('STOPS_WITHIN_BBOX_RESPONSE')
const receivedStopsWithinBBoxError = createAction('STOPS_WITHIN_BBOX_ERROR')

export function findStopsWithinBBox (params) {
  return createQueryAction(
    `index/stops?${qs.stringify(params)}`,
    receivedStopsWithinBBoxResponse,
    receivedStopsWithinBBoxError,
    {
      serviceId: 'stops',
      rewritePayload: stops => ({stops})
    }
  )
}

export const clearStops = createAction('CLEAR_STOPS_OVERLAY')

const throttledUrls = {}

function now () {
  return (new Date()).getTime()
}

const TEN_SECONDS = 10000

// automatically clear throttled urls older than 10 seconds
window.setInterval(() => {
  Object.keys(throttledUrls).forEach(key => {
    if (throttledUrls[key] < now() - TEN_SECONDS) {
      delete throttledUrls[key]
    }
  })
}, 1000)

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

function createQueryAction (endpoint, responseAction, errorAction, options = {}) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    let url
    if (options.serviceId && otpState.config.alternateTransitIndex &&
      otpState.config.alternateTransitIndex.services.includes(options.serviceId)
    ) {
      console.log('Using alt service for ' + options.serviceId)
      url = otpState.config.alternateTransitIndex.apiRoot + endpoint
    } else {
      const api = otpState.config.api
      url = `${api.host}${api.port ? ':' + api.port : ''}${api.path}/${endpoint}`
    }

    if (!options.noThrottle) {
      // don't make a request to a URL that has already seen the same request
      // within the last 10 seconds
      const throttleKey = options.fetchOptions
        ? `${url}-${hash(options.fetchOptions)}`
        : url
      if (throttledUrls[throttleKey] && throttledUrls[throttleKey] > now() - TEN_SECONDS) {
        // URL already had a request within last 10 seconds, warn and exit
        console.warn(`Request throttled for url: ${url}`)
        return
      } else {
        throttledUrls[throttleKey] = now()
      }
    }
    let payload
    try {
      const response = await fetch(url, options.fetchOptions)
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
      dispatch(responseAction(options.rewritePayload(payload)))
    } else {
      dispatch(responseAction(payload))
    }

    if (typeof options.postprocess === 'function') {
      options.postprocess(payload, dispatch, getState)
    }
  }
}

// TODO: Determine how we might be able to use GraphQL with the alternative
// transit index. Currently this is not easily possible because the alternative
// transit index does not have support for GraphQL and handling both Rest and
// GraphQL queries could introduce potential difficulties for maintainers.
// function createGraphQLQueryAction (query, variables, responseAction, errorAction, options) {
//   const endpoint = `index/graphql`
//   const fetchOptions = {
//     method: 'POST',
//     body: JSON.stringify({ query, variables }),
//     headers: { 'Content-Type': 'application/json' }
//   }
//   return createQueryAction(
//     endpoint,
//     responseAction,
//     errorAction,
//     { ...options, fetchOptions }
//   )
// }

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 */
export function setUrlSearch (params, replaceCurrent = false) {
  return function (dispatch, getState) {
    const base = getState().router.location.pathname
    const path = `${base}?${qs.stringify(params)}`
    if (replaceCurrent) dispatch(replace(path))
    else dispatch(push(path))
  }
}

/**
 * Update the OTP Query parameters in the URL and ensure that the active search
 * is set correctly. Leaves any other existing URL parameters (e.g., UI) unchanged.
 */
export function updateOtpUrlParams (otpState, searchId) {
  const {config, currentQuery} = otpState
  const otpParams = getRoutingParams(currentQuery, config, true)
  return function (dispatch, getState) {
    const params = {}
    // Get all OTP-specific params, which will be retained unchanged in the URL
    const urlParams = getUrlParams()
    Object.keys(urlParams)
      .filter(key => key.indexOf('_') !== -1)
      .forEach(key => { params[key] = urlParams[key] })
    params.ui_activeSearch = searchId
    // Assumes this is a new search and the active itinerary should be reset.
    params.ui_activeItinerary = 0
    // Merge in the provided OTP params and update the URL
    dispatch(setUrlSearch(Object.assign(params, otpParams)))
  }
}
