import {
  aggregateModes,
  getBannedRoutesFromSubmodes,
  populateSettingWithValue
} from '@opentripplanner/trip-form'
import { createAction } from 'redux-actions'
import { decodeQueryParams, DelimitedArrayParam } from 'use-query-params'
import { toDate } from 'date-fns-tz'
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'

import { checkForRouteModeOverride } from '../util/config'
import { convertToPlace, getPersistenceMode } from '../util/user'
import { FETCH_STATUS } from '../util/constants'
import { generateModeSettingValues } from '../util/api'
import {
  getActiveItineraries,
  getActiveItinerary,
  getRouteOperator,
  isValidSubsequence,
  queryIsValid
} from '../util/state'
import {
  getRouteColorBasedOnSettings,
  getRouteIdForPattern,
  routeIsValid
} from '../util/viewer'
import { isLastStop } from '../util/stop-times'

import {
  createQueryAction,
  fetchingStopTimesForStop,
  fetchNearbyError,
  fetchNearbyResponse,
  findGeometryForTrip,
  findNearbyAmenitiesError,
  findNearbyAmenitiesResponse,
  findRouteError,
  findRouteResponse,
  findRoutesError,
  findRoutesResponse,
  findStopError,
  findStopResponse,
  findStopTimesForStopError,
  findStopTimesForStopResponse,
  findStopTimesForTrip,
  findTripError,
  findTripResponse,
  receivedNearbyStopsError,
  receivedNearbyStopsResponse,
  receivedVehiclePositions,
  receivedVehiclePositionsError,
  rememberSearch,
  routingError,
  routingRequest,
  routingResponse,
  updateOtpUrlParams
} from './api'
import { rememberPlace } from './user'
import { RoutingQueryCallResult } from './api-constants'
import { zoomToPlace } from './map'

const { generateCombinations, generateOtp2Query, SIMPLIFICATIONS } =
  coreUtils.queryGen
const { getTripOptionsFromQuery, getUrlParams } = coreUtils.query
const { convertGraphQLResponseToLegacy } = coreUtils.itinerary
const { randId } = coreUtils.storage

const LIGHT_GRAY = '666666'

function formatRecentPlace(place) {
  return convertToPlace({
    ...place,
    icon: 'clock-o',
    id: `recent-${randId()}`,
    timestamp: new Date().getTime(),
    type: 'recent'
  })
}

function formatRecentSearch(state, queryParamData) {
  return {
    id: randId(),
    query: getTripOptionsFromQuery(
      { ...state.otp.currentQuery, queryParamData },
      true
    ),
    timestamp: new Date().getTime()
  }
}

function isStoredPlace(place) {
  return ['home', 'work', 'suggested', 'stop'].indexOf(place.type) !== -1
}

/**
 * Generic helper for crafting GraphQL queries.
 */
function createGraphQLQueryAction(
  query,
  variables,
  responseAction,
  errorAction,
  options
) {
  const fetchOptions = {
    body: JSON.stringify({ query, variables }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  }
  return createQueryAction(null, responseAction, errorAction, {
    ...options,
    fetchOptions,
    noThrottle: true,
    url: '/gtfs/v1'
  })
}

const findTrip = (params) =>
  createGraphQLQueryAction(
    `{
        trip(id: "${params.tripId}") {
          id: gtfsId
          route {
            id: gtfsId
            agency {
              id: gtfsId
              name
              url
              timezone
              lang
              phone
              fareUrl
            }
            shortName
            longName
            type
            url
            color
            textColor
            routeBikesAllowed: bikesAllowed
            bikesAllowed
          }
          serviceId
          tripHeadsign
          directionId
          blockId
          shapeId
          wheelchairAccessible
          bikesAllowed
          tripBikesAllowed: bikesAllowed

          stops {
			      id: gtfsId
			      stopId: gtfsId
			      code
			      name
			      lat
			      lon			
		      }

          tripGeometry {
            length
            points
          }
        }
      }`,
    {},
    findTripResponse,
    findTripError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        // FIXME: integrate into graphql request
        dispatch(findStopTimesForTrip({ tripId: params.tripId }))
        dispatch(findGeometryForTrip({ tripId: params.tripId }))
      },
      rewritePayload: (payload) => {
        if (!payload?.data?.trip) return {}

        payload.data.trip.geometry = payload.data.trip.tripGeometry
        return payload.data.trip
      }
    }
  )

export const vehicleRentalQuery = (
  params,
  responseAction,
  errorAction,
  options
) =>
  // TODO: ErrorsByNetwork is missing
  createGraphQLQueryAction(
    `{
    rentalVehicles {
      vehicleId
      id
      name
      lat
      lon
      allowPickupNow
      vehicleType {
        formFactor
      }
      network
    }
  }
  `,
    {},
    responseAction,
    errorAction,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        if (payload.errors) {
          return errorAction(payload.errors)
        }
      },
      // TODO: most of this rewrites the OTP2 response to match OTP1.
      // we should re-write the rest of the UI to match OTP's behavior instead
      rewritePayload: (payload) => {
        return {
          stations: payload?.data?.rentalVehicles?.map((vehicle) => {
            return {
              allowPickup: vehicle.allowPickupNow,
              id: vehicle.vehicleId,
              isFloatingBike: vehicle?.vehicleType?.formFactor === 'BICYCLE',
              isFloatingVehicle: vehicle?.vehicleType?.formFactor === 'SCOOTER',
              name: vehicle.name,
              networks: [vehicle.network],
              x: vehicle.lon,
              y: vehicle.lat
            }
          })
        }
      }
    }
  )

// TODO: numberOfDepartures needs to come from config!
const stopTimeGraphQLQuery = `
stopTimes: stoptimesForPatterns(numberOfDepartures: 3) {
  pattern {
    desc: name
    headsign
    id: code
  }
  times: stoptimes {
    arrivalDelay
    departureDelay
    headsign
    realtime
    realtimeArrival
    realtimeDeparture
    realtimeState
    scheduledArrival
    scheduledDeparture
    serviceDay
    stop {
      id: gtfsId
    }
    timepoint
    trip {
      id
    }
  }
}
`

const stopGraphQLQuery = `
id: gtfsId
code
lat
lon
locationType
name
wheelchairBoarding
zoneId
geometries {
  geoJson
}
routes {
  id: gtfsId
  agency {
    gtfsId
    name
  }
  longName
  mode
  color
  textColor
  shortName
}
${stopTimeGraphQLQuery}
`

const findNearbyStops = ({ focusStopId, lat, lon, radius = 300 }) => {
  if (!focusStopId) return {}
  return createGraphQLQueryAction(
    `{
    stopsByRadius(lat: ${lat}, lon: ${lon}, radius: ${radius}) {
      edges {
        node {
          stop {
            ${stopGraphQLQuery}
          }
        }
      }
    }
  }`,
    {},
    receivedNearbyStopsResponse,
    receivedNearbyStopsError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        return {
          focusStopId,
          stops: payload?.data?.stopsByRadius?.edges?.map((edge) => {
            const { stop } = edge.node
            return {
              ...stop,
              agencyId: stop?.route?.agency?.gtfsId,
              agencyName: stop?.route?.agency?.name
            }
          })
        }
      }
    }
  )
}
const findNearbyAmenities = ({ lat, lon, radius = 300, stopId }) => {
  if (!stopId) return {}
  return createGraphQLQueryAction(
    `{
    nearest(lat: ${lat}, lon: ${lon}, maxDistance: ${radius}, maxResults: 50) {
      edges {
        node {
          place {
            id
            lat
            lon
            __typename
            ...on RentalVehicle {
              network
              vehicleType {
                 formFactor
              }
            }
            ... on VehicleRentalStation {
              network
            }
            ...on BikeRentalStation {
              bikesAvailable
              spacesAvailable
              name
              networks
            }
            ... on VehicleParking {
              carPlaces
              bicyclePlaces
              name
            }
          }
          distance
        }
      }
    }
  }`,
    {},
    findNearbyAmenitiesResponse,
    findNearbyAmenitiesError,
    {
      noThrottle: true,
      rewritePayload: (payload) => {
        if (!payload.data?.nearest)
          return {
            bikeRental: { stations: [] },
            vehicleRentalQuery: { stations: [] }
          }
        const { edges } = payload.data.nearest || []
        const bikeStations = edges?.filter(
          (edge) =>
            edge?.node?.place?.bikesAvailable !== undefined ||
            !!edge?.node?.place?.bicyclePlaces ||
            edge?.node?.place?.vehicleType?.formFactor === 'BICYCLE'
        )
        const parkAndRides = edges?.filter(
          (edge) => edge?.node?.place?.carPlaces
        )
        const vehicleRentals = edges?.filter(
          (edge) => edge?.node?.place?.vehicleType?.formFactor === 'SCOOTER'
        )
        return {
          bikeRental: {
            stations: bikeStations?.map((edge) => {
              const {
                __typename,
                bikesAvailable,
                id,
                lat,
                lon,
                name,
                network,
                networks,
                spacesAvailable
              } = edge?.node?.place
              return {
                bikesAvailable: bikesAvailable,
                distance: edge.node.distance,
                id: id,
                isFloatingBike: __typename === 'RentalVehicle',
                lat: lat,
                lon: lon,
                name: name || id || '',
                networks: networks || [network || 'null'],
                spacesAvailable: spacesAvailable,
                x: lon,
                y: lat
              }
            })
          },
          parkAndRideLocations: parkAndRides?.map((edge) => {
            const { id, lat, lon, name } = edge?.node?.place
            return {
              distance: edge.node.distance,
              id: id,
              lat: lat,
              lon: lon,
              name: name || id || '',
              x: lon,
              y: lat
            }
          }),
          stopId,
          vehicleRental: {
            stations: vehicleRentals?.map((edge) => {
              const { id, lat, lon, name, network, networks } =
                edge?.node?.place
              return {
                distance: edge.node.distance,
                id: id,
                isFloatingBike: true,
                lat: lat,
                lon: lon,
                name: name || id || '',
                networks: networks || [network || 'null'],
                x: lon,
                y: lat
              }
            })
          }
        }
      }
    }
  )
}

const mergeSameStops = (nearbyResponse) => {
  return nearbyResponse?.reduce((prev, { node }) => {
    const existingStop = prev.find(
      (stop) => stop.place.code === node.place.code
    )
    // Only merge if the stop has a code at all
    if (existingStop && node.place.code) {
      existingStop.place.stoptimesForPatterns = [
        ...(existingStop.place.stoptimesForPatterns || []),
        ...(node.place.stoptimesForPatterns || [])
      ]
    } else {
      prev.push(node)
    }
    return prev
  }, [])
}

export const fetchNearby = (position) => {
  const { lat, lon } = position

  return createGraphQLQueryAction(
    `query Nearby(
      $lat: Float!
      $lon: Float!
    ) {
      nearest(lat:$lat, lon:$lon, first: 100, filterByPlaceTypes: [STOP, VEHICLE_RENT, BIKE_PARK, CAR_PARK]) {
        edges {
          node {
            id
            distance
            place {
              __typename
              id
              lat
              lon
              ...on RentalVehicle {
                network
                name
                lat
                lon
                allowPickupNow
                operative
                rentalUris {
                  android
                  ios
                  web
                }
                vehicleType {
                  formFactor
                }
              }
              ... on VehicleRentalStation {
                network
              }
              ...on BikeRentalStation {
                bikesAvailable
                spacesAvailable
                name
                networks
              }
              ... on VehicleParking {
                carPlaces
                bicyclePlaces
                lat
                lon
                name
              }
              ... on Stop {
                name
                lat
                lon
                code
                gtfsId
                stoptimesForPatterns {
                  pattern {
                    headsign
                    route {
                      agency {
                        name
                        gtfsId
                      }
                      shortName
                      type
                      mode
                      longName
                      color
                      textColor
                    }
                  }
                  stoptimes {
                    serviceDay
                    departureDelay
                    realtimeState
                    realtimeDeparture
                    scheduledDeparture
                    headsign
                    trip {
                      route {
                        shortName
                      }
                    }
                  }
                }
              }
            }
            distance
          }
        }
      }
    }`,
    { lat, lon },
    fetchNearbyResponse,
    fetchNearbyError,
    {
      rewritePayload: (payload) => {
        // Handle GraphQL error
        if (payload.errors) {
          const error = new Error('GraphQL response error')
          error.message =
            'Check error.cause for more information. Are the OTP server and client on compatible versions?'
          error.cause = payload.errors
          throw error
        }
        return mergeSameStops(payload.data?.nearest?.edges)
      }
    }
  )
}

export const findStopTimesForStop = (params) =>
  function (dispatch, getState) {
    dispatch(fetchingStopTimesForStop(params))
    const { date, stopId } = params
    const timeZone = getState().otp.config.homeTimezone

    // const inputDateFormat = 'yyyy-MM-dd'
    // const dateObj = parse(date, inputDateFormat, new Date())
    const serviceDay =
      toDate(`${date}`, { timeZone }).getTime() / 1000 + 3 * 3600
    console.log(serviceDay)

    // Create a service date timestamp from 3am local.
    // const serviceDay = dateObj.getTime() / 1000 + 3 * 3600

    return dispatch(
      createGraphQLQueryAction(
        `query StopTimes(
          $serviceDay: Long!
          $stopId: String!
        ) {
            stop(id: $stopId) {
              gtfsId
              code
              lat
              lon
              locationType
              name
              wheelchairBoarding
              routes {
                id: gtfsId
                agency {
                  gtfsId
                  name
                }
                longName
                mode
                color
                textColor
                shortName
                patterns {
                  id
                  headsign
                }
              }
              stoptimesForPatterns(numberOfDepartures: 1000, startTime: $serviceDay, omitNonPickups: true, omitCanceled: false) {
                pattern {
                  desc: name
                  headsign
                  id: code
                  route {
                    gtfsId
                  }
                  stops {
                    gtfsId
                  }
                }
                stoptimes {
                  headsign
                  scheduledDeparture
                  serviceDay
                  trip {
                    id
                    pattern {
                      id
                    }
                    route {
                      gtfsId
                    }
                  }
                }
              }
            }
          }`,
        {
          serviceDay,
          stopId
        },
        findStopTimesForStopResponse,
        findStopTimesForStopError,
        {
          noThrottle: true,
          rewritePayload: (payload) => {
            if (payload.errors) {
              return dispatch(findStopTimesForStopError(payload.errors))
            }
            const stopData = payload.data?.stop
            return {
              ...stopData,
              fetchStatus: FETCH_STATUS.FETCHED,
              stoptimesForPatterns: stopData?.stoptimesForPatterns
                // If this stop is the last stop on this pattern, don't include any stop times from that pattern.
                // (The schedule viewer doesn't show arrival times to a terminus stop.)
                .filter(({ pattern }) => !isLastStop(stopData?.gtfsId, pattern))
                // in some cases, the TriMet transit index will not return all routes
                // that serve a stop. Perhaps it doesn't return some routes if the
                // route only performs a drop-off at the stop... not quite sure. So a
                // check is needed to make sure we don't add data for routes not found
                // from the routes query.
                .filter(({ pattern }) => {
                  const routeId = getRouteIdForPattern(pattern)
                  const route = stopData.routes.find((r) => r.id === routeId)
                  return routeIsValid(route, routeId)
                }),
              stopTimesLastUpdated: new Date().getTime()
            }
          }
        }
      )
    )
  }

const fetchStopInfo = (map, stop) => {
  const { stopId } = stop
  if (!stopId)
    return function (dispatch, getState) {
      console.warn("No stopId passed, can't fetch stop!")
    }

  return createGraphQLQueryAction(
    `{
    stop(id: "${stopId}") {
      ${stopGraphQLQuery}
    }
  }
`,
    {},
    findStopResponse,
    findStopError,
    {
      noThrottle: true,
      postprocess: (payload, dispatch) => {
        if (payload.errors) {
          return findStopError(payload.errors)
        }
        const { stop } = payload?.data
        if (!stop || !stop.lat || !stop.lon) return findStopError()

        // Fetch nearby stops and amenities
        // TODO: add radius from config
        dispatch(
          findNearbyAmenities({
            lat: stop.lat,
            lon: stop.lon,
            stopId: stop.id
          })
        )
        // TODO: add radius from config
        dispatch(
          findNearbyStops({
            focusStopId: stop.id,
            lat: stop.lat,
            lon: stop.lon
          })
        )

        dispatch(
          zoomToPlace(
            map,
            stop,
            stop?.geometries?.geoJson?.type !== 'Point' && 10
          )
        )
      },
      rewritePayload: (payload) => {
        const { stop } = payload?.data
        if (!stop) return findStopError()

        const color =
          stop.routes?.length > 0 && `#${stop.routes[0]?.color || LIGHT_GRAY}`

        // Doing some OTP1 compatibility rewriting here
        const agency = stop?.route?.agency || stop?.routes?.[0]?.agency || {}
        const { gtfsId: agencyId, name: agencyName } = agency
        return {
          ...stop,
          agencyId: agencyId || stop?.routes?.[0]?.agency?.gtfsId,
          agencyName: agencyName || stop?.routes?.[0]?.agency?.name,
          color
        }
      },
      serviceId: 'stops'
    }
  )
}

const getVehiclePositionsForRoute = (routeId) =>
  function (dispatch, getState) {
    return dispatch(
      createGraphQLQueryAction(
        `{
          route(id: "${routeId}") {
           patterns {
            vehiclePositions {
              vehicleId
              label
              lat
              lon
              stopRelationship {
                 status
                stop {
                  name
                  gtfsId
                }
              }
              speed
              heading
              lastUpdated
              trip {
                pattern {
                  id
                }
              }
            }
           }
         }
         }`,
        {},
        receivedVehiclePositions,
        receivedVehiclePositionsError,
        {
          noThrottle: true,
          rewritePayload: (payload) => {
            const vehicles = payload.data?.route?.patterns
              .reduce((prev, cur) => {
                return prev.concat(
                  cur?.vehiclePositions?.map((position) => {
                    return {
                      heading: position?.heading,
                      label: position?.label,
                      lat: position?.lat,
                      lon: position?.lon,
                      nextStopId: position?.stopRelationship?.stop?.gtfsId,
                      nextStopName: position?.stopRelationship?.stop?.name,
                      patternId: position?.trip?.pattern?.id,
                      seconds: position?.lastUpdated,
                      speed: position?.speed || 0,
                      stopStatus: position?.stopRelationship?.status,
                      vehicleId: position?.vehicleId
                    }
                  })
                )
              }, [])
              .filter((vehicle) => !!vehicle)
            return { routeId, vehicles }
          }
        }
      )
    )
  }

export const findRoute = (params) =>
  function (dispatch, getState) {
    const { routeId } = params
    if (!routeId) return

    return dispatch(
      createGraphQLQueryAction(
        `{
        route(id: "${routeId}") {
          id: gtfsId
          desc
          agency {
            id: gtfsId
            name
            url
            timezone
            lang
            phone
          }
          longName
          shortName
          mode
          type
          color
          textColor
          bikesAllowed
          routeBikesAllowed: bikesAllowed
          url
      
          patterns {
            id
            headsign
            name
            patternGeometry {
              points
              length
            }
            stops {
              code
              id: gtfsId
              lat
              lon
              name
              locationType
              geometries {
                geoJson
              }
              routes {
                textColor
                color
              }
            }
          }
        }
      }
      `,
        {},
        findRouteResponse,
        findRouteError,
        {
          noThrottle: true,
          // TODO: avoid re-writing OTP2 route object to match OTP1 style
          rewritePayload: (payload) => {
            if (payload.errors) {
              return dispatch(findRouteError(payload.errors))
            }
            const { route } = payload?.data
            if (!route) return

            const newRoute = clone(route)
            const routePatterns = {}

            // Sort patterns by length to make algorithm below more efficient
            const patternsSortedByLength = newRoute.patterns.sort(
              (a, b) => a.stops.length - b.stops.length
            )

            // Remove all patterns that are subsets of larger patterns
            const filteredPatterns = patternsSortedByLength
              // Start with the largest for performance
              .reverse()
              .filter((pattern) => {
                // Compare to all other patterns TODO: make this beat O(n^2)
                return !patternsSortedByLength.find((p) => {
                  // Don't compare against ourself
                  if (p.id === pattern.id) return false

                  // If our pattern is longer, it's not a subset
                  if (p.stops.length <= pattern.stops.length) return false

                  return isValidSubsequence(
                    p.stops.map((s) => s.id),
                    pattern.stops.map((s) => s.id)
                  )
                })
              })

            // Fallback for if the filtering leaves us with a silly number of patterns
            // If this happens, it is not possible to know which pattern to keep
            ;(filteredPatterns.length > 1
              ? filteredPatterns
              : newRoute.patterns
            ).forEach((pattern) => {
              const patternStops = pattern.stops.map((stop) => {
                const color =
                  stop.routes?.length > 0 &&
                  `#${stop.routes[0]?.color || LIGHT_GRAY}`
                if (stop.routes) delete stop.routes
                return { ...stop, color }
              })
              routePatterns[pattern.id] = {
                ...pattern,
                desc: pattern.name,
                geometry: pattern?.patternGeometry || { length: 0, points: '' },
                stops: patternStops
              }
            })
            newRoute.origColor = newRoute.color
            newRoute.color = getRouteColorBasedOnSettings(
              getRouteOperator(
                {
                  agencyId: newRoute?.agency?.id,
                  id: newRoute?.id
                },
                getState().otp.config.transitOperators
              ),
              { color: newRoute?.color, mode: newRoute.mode }
            ).split('#')?.[1]

            newRoute.patterns = routePatterns
            // TODO: avoid explicit behavior shift like this
            newRoute.v2 = true
            newRoute.mode = checkForRouteModeOverride(
              newRoute,
              getState().otp.config?.routeModeOverrides
            )

            return newRoute
          }
        }
      )
    )
  }

export function findRoutes() {
  return function (dispatch, getState) {
    dispatch(
      createGraphQLQueryAction(
        `{
          routes {
            id: gtfsId
            agency {
              id: gtfsId
              name
            }
            longName
            shortName
            mode
            type
            color
          }
        }
      `,
        {},
        findRoutesResponse,
        findRoutesError,
        {
          noThrottle: true,
          // TODO: avoid re-writing OTP2 route object to match OTP1 style
          rewritePayload: (payload) => {
            if (payload.errors) {
              return dispatch(findRoutesError(payload.errors))
            }
            const { routes } = payload?.data
            if (!routes) return

            const { config } = getState().otp
            // To initialize the route viewer,
            // convert the routes array to a dictionary indexed by route ids.
            return routes.reduce((result, route) => {
              const {
                agency,
                color: origColor,
                id,
                longName,
                mode,
                shortName,
                type
              } = route
              // Set color overrides if present
              const color = getRouteColorBasedOnSettings(
                getRouteOperator(
                  {
                    agencyId: route?.agency?.id,
                    id: route?.id
                  },
                  config.transitOperators
                ),
                {
                  color: route?.color,
                  mode: route.mode
                }
              ).split('#')?.[1]

              result[id] = {
                agencyId: agency.id,
                agencyName: agency.name,
                color,
                id,
                longName,
                mode: checkForRouteModeOverride(
                  { id, mode },
                  config?.routeModeOverrides
                ),
                origColor,
                shortName,
                type,
                v2: true
              }
              return result
            }, {})
          }
        }
      )
    )
  }
}

export const findPatternsForRoute = (params) =>
  function (dispatch, getState) {
    const state = getState()
    const { routeId } = params
    const route = state?.otp?.transitIndex?.routes?.[routeId]
    if (!route.patterns) {
      // TODO: since grabbbing only patterns would basically be the same query and
      // most crucially re-writing as findRoute() already does, we just make that request
      //
      // A proper graphQL implementation will only grab what data is needed when it is needed
      return dispatch(findRoute(params))
    }
  }

const getWalkTime = (itin) =>
  itin.legs.reduce(
    (sum, leg) => (sum + leg.mode === 'WALK' ? leg.duration : 0),
    0
  )

const aggregateAlerts = (...alerts) => alerts.flat().filter((v) => !!v)

// TODO: Remove this function by refactoring the app to use OTP2 types
const pickupDropoffTypeToOtp1 = (otp2Type) => {
  switch (otp2Type) {
    case 'COORDINATE_WITH_DRIVER':
      return 'coordinateWithDriver'
    case 'CALL_AGENCY':
      return 'mustPhone'
    case 'SCHEDULED':
      return 'scheduled'
    case 'NONE':
      return 'none'
    default:
      return null
  }
}

const queryParamConfig = { modeButtons: DelimitedArrayParam }

export function routingQuery(searchId = null, updateSearchInReducer) {
  // eslint-disable-next-line complexity
  return function (dispatch, getState) {
    const state = getState()
    const { config, currentQuery, modeSettingDefinitions } = state.otp
    const persistenceMode = getPersistenceMode(config.persistence)
    const activeItinerary =
      getActiveItinerary(state) ||
      (config.itinerary?.showFirstResultByDefault ? 0 : null)

    const isNewSearch = !searchId
    if (isNewSearch) searchId = randId()
    // Don't permit a routing query if the query is invalid
    if (!queryIsValid(state)) {
      console.warn('Query is invalid. Aborting routing query', currentQuery)
      return RoutingQueryCallResult.INVALID_QUERY
    }

    const {
      bannedTrips,
      date,
      departArrive,
      modes,
      numItineraries,
      routingType,
      time
    } = currentQuery
    const arriveBy = departArrive === 'ARRIVE'

    // Retrieve active mode keys from URL parameters or configuration defaults
    const urlSearchParams = new URLSearchParams(getUrlParams())
    const activeModeKeys =
      decodeQueryParams(queryParamConfig, {
        modeButtons: urlSearchParams.get('modeButtons')
      }).modeButtons ||
      config?.modes?.initialState?.enabledModeButtons ||
      {}

    const strictModes = !!config?.itinerary?.strictItineraryFiltering

    // Filter mode definitions based on active mode keys
    const activeModeButtons = config.modes?.modeButtons.filter((mb) =>
      activeModeKeys.includes(mb.key)
    )
    const activeModes = aggregateModes(activeModeButtons)

    // Get mode setting values from the url, or initial state config, or default value in definition
    const modeSettingValues = generateModeSettingValues(
      urlSearchParams,
      modeSettingDefinitions,
      config?.modes?.initialState?.modeSettingValues
    )
    // TODO: walkReluctance is in here, but not when set via setQueryParam
    const modeSettings = modeSettingDefinitions?.map(
      populateSettingWithValue(modeSettingValues)
    )
    // Get the raw query param strings to save for the rider's search history
    const rawModeButtonQP = urlSearchParams.get('modeButtons')
    const queryParamData = {
      modeButtons: rawModeButtonQP,
      ...modeSettingValues
    }

    const excludedRoutes =
      config.routeModeOverrides &&
      getBannedRoutesFromSubmodes(
        modeSettings,
        config.routeModeOverrides
      )?.join(',')

    const baseQuery = {
      arriveBy,
      banned: {
        routes: excludedRoutes || undefined,
        trips: bannedTrips
      },
      date,
      from: currentQuery.from,
      modes: modes || activeModes,
      modeSettings,
      numItineraries: numItineraries || config?.modes?.numItineraries || 7,
      time,
      to: currentQuery.to,
      // TODO: Does this break everything?
      ...currentQuery
    }
    // Generate combinations if the modes for query are not specified in the query
    // FIXME: BICYCLE_RENT does not appear in this list unless TRANSIT is also enabled.
    // This is likely due to the fact that BICYCLE_RENT is treated as a transit submode.
    const combinations = modes ? [baseQuery] : generateCombinations(baseQuery)

    dispatch(
      routingRequest({
        activeItinerary,
        pending: combinations.length,
        routingType,
        searchId,
        updateSearchInReducer
      })
    )

    combinations.forEach((combo, index) => {
      const query = generateOtp2Query(combo)
      dispatch(
        createGraphQLQueryAction(
          query.query,
          query.variables,
          (response) => {
            const dispatchedRoutingResponse = routingResponse(response)
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
              dispatch(
                rememberSearch(formatRecentSearch(state, queryParamData))
              )
            }
            return dispatchedRoutingResponse
          },
          routingError,
          {
            rewritePayload: (response, dispatch, getState) => {
              const itineraries = response.data?.plan?.itineraries

              // Convert user-selected transit modes from mode selector into modes recognized by OTP.
              const activeModeStrings = activeModes.map(
                (am) => SIMPLIFICATIONS[am.mode]
              )

              let filteredItineraries = itineraries
              // If "strictItineraryFiltering" is enabled, only return itineraries that contain at least one explicitly requested mode...
              if (strictModes) {
                filteredItineraries = itineraries?.filter((itin) =>
                  itin.legs.some((leg) =>
                    activeModeStrings.includes(SIMPLIFICATIONS[leg.mode])
                  )
                )
                // ... Otherwise return all itineraries.
              }

              // Filter itineraries to collapse short names and hide unnecessary errors.
              const withCollapsedShortNames = filteredItineraries?.map(
                (itin) => ({
                  ...itin,
                  legs: itin.legs
                    ?.map((leg) => {
                      return {
                        ...leg,
                        origColor: leg?.route?.color,
                        route: {
                          ...leg.route,
                          color: getRouteColorBasedOnSettings(
                            getRouteOperator(
                              {
                                agencyId: leg?.agency?.id,
                                id: leg?.route?.id
                              },
                              config.transitOperators
                            ),
                            { color: leg?.route?.color, mode: leg.mode }
                          ).split('#')?.[1]
                        }
                      }
                    })
                    ?.map(convertGraphQLResponseToLegacy)
                })
              )

              /* It is possible for a NO_TRANSIT_CONNECTION error to be
                returned even if trips were returned, since it is on a mode-by-mode basis.
                there is a chance for user confusion! 
                
                By checking if itineraries exist, we can hide this error when it is
                not applicable. */
              if (
                getActiveItineraries(getState())?.length > 0 &&
                response?.data?.plan
              ) {
                response.data.plan.routingErrors =
                  response.data?.plan?.routingErrors.filter(
                    (re) => re?.code !== 'NO_TRANSIT_CONNECTION'
                  )

                // Add accessibility error, if it is turned on
                const state = getState()
                const { displayA11yError } = state.otp.config?.itinerary
                if (displayA11yError) {
                  if (
                    response.data.plan.itineraries.find(
                      (itin) => !!itin?.accessibilityScore
                    )
                  ) {
                    if (!response.data.plan?.routingErrors) {
                      response.data.plan.routingErrors = []
                    }
                    response.data.plan.routingErrors.push({
                      code: 'OTP_RR_A11Y_ROUTING_ENABLED'
                    })
                  }
                }
              }

              return {
                index,
                response: {
                  plan: {
                    ...response.data?.plan,
                    itineraries: withCollapsedShortNames
                  },
                  requestId: searchId
                },
                searchId
              }
            }
          }
        )
      )
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

    return combinations.length === 0
      ? RoutingQueryCallResult.INVALID_MODE_SELECTION
      : RoutingQueryCallResult.SUCCESS
  }
}

const requestingServiceTimeRange = createAction('SERVICE_TIME_RANGE_REQUEST')
const receivedServiceTimeRange = createAction('SERVICE_TIME_RANGE_RESPONSE')
const receivedServiceTimeRangeError = createAction('SERVICE_TIME_RANGE_ERROR')

/** Queries for service time range. */
const retrieveServiceTimeRangeIfNeeded = () =>
  function (dispatch, getState) {
    if (getState().otp.serviceTimeRange) return
    dispatch(requestingServiceTimeRange)
    return dispatch(
      createGraphQLQueryAction(
        `{
          serviceTimeRange {
            start
            end
          }
        }`,
        {},
        receivedServiceTimeRange,
        receivedServiceTimeRangeError,
        {}
      )
    )
  }

export default {
  fetchNearby,
  fetchStopInfo,
  findPatternsForRoute,
  findRoute,
  findRoutes,
  findStopTimesForStop,
  findTrip,
  getVehiclePositionsForRoute,
  retrieveServiceTimeRangeIfNeeded,
  routingQuery,
  vehicleRentalQuery
}
