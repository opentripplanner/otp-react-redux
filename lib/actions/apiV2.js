import {
  createQueryAction,
  findGeometryForTrip,
  findNearbyAmenitiesError,
  findNearbyAmenitiesResponse,
  findRouteError,
  findRouteResponse,
  findStopError,
  findStopResponse,
  findStopTimesForTrip,
  findTripError,
  findTripResponse,
  receivedNearbyStopsError,
  receivedNearbyStopsResponse
} from './api'
import { setMapZoom } from './config'
import { zoomToStop } from './map'

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
			      gtfsId: id
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

export function vehicleRentalQuery(
  params,
  responseAction,
  errorAction,
  options
) {
  // TODO: ErrorsByNetwork is missing
  return createGraphQLQueryAction(
    `{
    rentalVehicles {
      vehicleId
      id
      name
      lat
      lon
      allowPickupNow
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
          stations: payload?.data?.rentalVehicles.map((vehicle) => {
            return {
              allowPickup: vehicle.allowPickupNow,
              id: vehicle.vehicleId,
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
}

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
    realtimeArrival
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
    bikeNearest: nearest(lat: ${lat}, lon: ${lon}, maxDistance: ${radius}, filterByPlaceTypes: BIKE_PARK) {
      edges {
        node {
          place {
            id
            lat
            lon
          }
          distance
        }
      }
    }
    scooterNearest: nearest(lat: ${lat}, lon: ${lon}, maxDistance: ${radius}, filterByPlaceTypes: BICYCLE_RENT) {
      edges {
        node {
          place {
            id
            lat
            lon
          }
          distance
        }
      }
    }
    parkingLotNearest: nearest(lat: ${lat}, lon: ${lon}, maxDistance: ${radius}, filterByPlaceTypes: CAR_PARK) {
      edges {
        node {
          place {
            id
            lat
            lon
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
        if (!payload.data)
          return {
            bikeRental: { stations: [] },
            vehicleRentalQuery: { stations: [] }
          }
        // TODO: no way to get full bike info right now from endpoint. Would have
        // to make an additional request, or patch OTP2
        return {
          bikeRental: {
            stations: payload.data.bikeNearest?.edges.map((edge) => {
              return {
                distance: edge.node.distance,
                id: edge.node?.place?.id,
                isFloatingBike: true,
                lat: edge.node?.place?.lat,
                lon: edge.node?.place?.lon,
                name: edge.node?.place?.id || '',
                networks: ['null']
              }
            })
          },
          parkAndRideLocations: payload.data.parkingLotNearest?.edges.map(
            (edge) => {
              return {
                distance: edge.node.distance,
                id: edge.node?.place?.id,
                isFloatingBike: true,
                lat: edge.node?.place?.lat,
                lon: edge.node?.place?.lon,
                name: edge.node?.place?.id || '',
                networks: ['null']
              }
            }
          ),
          stopId,
          vehicleRental: {
            stations: payload.data.scooterNearest?.edges.map((edge) => {
              return {
                distance: edge.node.distance,
                id: edge.node?.place?.id,
                isFloatingBike: true,
                lat: edge.node?.place?.lat,
                lon: edge.node?.place?.lon,
                name: edge.node?.place?.id || '',
                networks: ['null']
              }
            })
          }
        }
      }
    }
  )
}

const fetchStopInfo = (stop) => {
  const { stopId } = stop
  if (!stopId) return {}

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
        if (!stop) return findStopError()

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

        dispatch(zoomToStop(stop))

        if (stop?.geometries?.geoJson?.type !== 'Point') {
          dispatch(setMapZoom(10))
        }
      },
      rewritePayload: (payload) => {
        const { stop } = payload?.data
        if (!stop) return findStopError()

        const color = stop.routes?.length > 0 && `#${stop.routes[0].color}`

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

const getVehiclePositionsForRoute = () => {
  return function (dispatch, getState) {
    console.warn('OTP2 does not yet support vehicle positions for route!')
  }
}

export function findRoute(params) {
  return function (dispatch, getState) {
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

            const routePatterns = {}
            route.patterns.forEach((pattern) => {
              const patternStops = pattern.stops.map((stop) => {
                const color =
                  stop.routes?.length > 0 && `#${stop.routes[0].color}`
                if (stop.routes) delete stop.routes
                return { ...stop, color }
              })
              routePatterns[pattern.id] = {
                ...pattern,
                desc: pattern.name,
                geometry: pattern.patternGeometry,
                stops: patternStops
              }
            })
            route.patterns = routePatterns
            // TODO: avoid explict behavior shift like this
            route.v2 = true

            return route
          }
        }
      )
    )
  }
}

export function findPatternsForRoute(params) {
  return function (dispatch, getState) {
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
}

export default {
  fetchStopInfo,
  findPatternsForRoute,
  findRoute,
  findTrip,
  getVehiclePositionsForRoute,
  vehicleRentalQuery
}
