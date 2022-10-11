import clone from 'clone'

import {
  createQueryAction,
  findGeometryForTrip,
  findNearbyAmenitiesError,
  findNearbyAmenitiesResponse,
  findRouteError,
  findRouteResponse,
  findRoutesError,
  findRoutesResponse,
  findStopError,
  findStopResponse,
  findStopTimesForTrip,
  findTripError,
  findTripResponse,
  receivedNearbyStopsError,
  receivedNearbyStopsResponse,
  receivedVehiclePositions,
  receivedVehiclePositionsError
} from './api'
import { zoomToStop } from './map'

const LIGHT_GRAY = '666666'

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
  const endpoint = 'index/graphql'
  const fetchOptions = {
    body: JSON.stringify({ query, variables }),
    headers: { 'Content-Type': 'application/json' },
    method: 'POST'
  }
  return createQueryAction(endpoint, responseAction, errorAction, {
    ...options,
    fetchOptions
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
          zoomToStop(
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
        return {
          ...stop,
          agencyId: stop?.route?.agency?.gtfsId,
          agencyName: stop?.route?.agency?.name,
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
          type
          color
          textColor
          bikesAllowed
          routeBikesAllowed: bikesAllowed
      
          patterns {
            id
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
            newRoute.patterns.forEach((pattern) => {
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
            newRoute.patterns = routePatterns
            // TODO: avoid explicit behavior shift like this
            newRoute.v2 = true

            return newRoute
          }
        }
      )
    )
  }

export function findRoutes() {
  return function (dispatch) {
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

            // To initialize the route viewer,
            // convert the routes array to a dictionary indexed by route ids.
            return routes.reduce(
              (result, { agency, color, id, longName, mode, shortName }) => {
                const agencyParts = agency.id.split(':')
                result[id] = {
                  // agencyId is the last portion of agencyParts (the first one is the feed id)
                  agencyId: agencyParts[agencyParts.length - 1],
                  agencyName: agency.name,
                  color,
                  id,
                  longName,
                  mode,
                  shortName,
                  v2: true
                }
                return result
              },
              {}
            )
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

export default {
  fetchStopInfo,
  findPatternsForRoute,
  findRoute,
  findRoutes,
  findTrip,
  getVehiclePositionsForRoute,
  vehicleRentalQuery
}
