import {
  createQueryAction,
  findGeometryForTrip,
  findStopError,
  findStopResponse,
  findStopTimesForStop,
  findStopTimesForTrip,
  findTripError,
  findTripResponse
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
        return payload?.data?.trip || {}
      }
    }
  )

const fetchStopInfo = (stop) => {
  const { stopId } = stop
  if (!stopId) return {}

  return createGraphQLQueryAction(
    `{
    stop(id: "${stopId}") {
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

        // TODO: nearby stops and amenities
        dispatch(findStopTimesForStop({ stopId: stop.id }))
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
          agencyId: stop?.agency?.gtfsId,
          agencyName: stop?.agency?.name,
          color
        }
      },
      serviceId: 'stops'
    }
  )
}

export default { fetchStopInfo, findTrip }
