/* eslint-disable react-hooks/exhaustive-deps */
import { Layer, Source } from 'react-map-gl'
import { TransitiveRoute } from '@opentripplanner/types'
import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
// @ts-expect-error no bindings yet
import { transit_realtime as transitRealtime } from 'gtfs-realtime-bindings'
import React, { useEffect, useState } from 'react'

import { getModeFromRoute } from '../../util/viewer'
import useInterval from '../util/use-interval-hook'

type Props = {
  /** URL to GTFS-rt feed in protocol buffer format. */
  liveFeedUrl: string
  /** URL to GTFS-like route list in JSON format. */
  routeDefinitionUrl: string
  /** Sets whether the layer is initially visible. */
  visible?: boolean
}

/*
 * Convert GTFS-rt entities to vehicle location from OTP-UI.
 * @param vehicle The GTFS-rt vehicle position entity to convert.
 * @param routes Optional GTFS-like routes list.
 *
 * TODO: typescript RT bindings
 */
function gtfsRtToTransitVehicle(gtfsRtVehicle: any, routes: TransitiveRoute[]) {
  const { position, stopId, timestamp, trip, vehicle } = gtfsRtVehicle.vehicle
  const route = routes.find((r) => r.route_id === trip.routeId)
  let routeShortName
  let routeType = 'BUS'
  let routeColor
  if (route) {
    routeShortName = route.route_short_name
    // Obtain the OTP route type from the GTFS route_type enum value.
    routeType = getModeFromRoute({ type: route.route_type })
    if (route.route_color) {
      routeColor = '#' + route.route_color
    }
  }
  return {
    heading: position.bearing,
    id: vehicle.id,
    lat: position.latitude,
    lon: position.longitude,
    reportDate: new Date(parseInt(timestamp, 10)).toLocaleString(),
    routeColor,
    routeShortName,
    routeType,
    stopId,
    tripId: trip.tripId,
    vehicleId: vehicle.id
  }
}

const GtfsRtVehicleOverlay = (props: Props): JSX.Element => {
  const { liveFeedUrl, routeDefinitionUrl } = props

  const [vehicles, setVehicleLocations] = useState([])
  const [routes, setRoutes] = useState([])

  /**
   * Fetches GTFS-rt vehicle positions (protocol buffer) and converts to
   * OTP-UI transitVehicleType before saving to component state.
   */
  const _fetchVehiclePositions = async (routes: TransitiveRoute[]) => {
    if (liveFeedUrl) {
      try {
        const response = await fetch(liveFeedUrl)
        if (response.status >= 400) {
          const error = new Error('Received error from server')
          console.error(response)
          throw error
        }
        const buffer = await response.arrayBuffer()
        const view = new Uint8Array(buffer)
        const feed = transitRealtime.FeedMessage.decode(view)

        // TODO: gtfs-rt vehicle type
        const vehicleLocations = feed.entity.map((vehicle: any) =>
          gtfsRtToTransitVehicle(vehicle, routes)
        )
        setVehicleLocations(vehicleLocations)
      } catch (err) {
        console.log(err)
      }
    }
  }

  /**
   * Fetches GTFS-like route definitions (JSON).
   * (called once when component is mounted)
   */
  const _fetchRoutes = async () => {
    if (routeDefinitionUrl) {
      try {
        const response = await fetch(routeDefinitionUrl)
        if (response.status >= 400) {
          const error = new Error('Received error from server')
          console.error(response)
          throw error
        }
        const r = await response.json()

        setRoutes(r)
      } catch (err) {
        console.log(err)
      }
    }
  }

  useEffect(() => {
    _fetchVehiclePositions(routes)
    setInterval(() => _fetchVehiclePositions(routes), 30_000)
  }, [routes])

  useEffect(() => {
    _fetchRoutes()
  }, [])

  const geojson: GeoJSON.FeatureCollection = {
    features: routes.map(
      // eslint-disable-next-line camelcase
      (route: { route_color: string; shape: [number, number][] }) => ({
        geometry: {
          coordinates: route.shape.map(([lat, lon]) => [lon, lat]),
          type: 'LineString'
        },
        properties: { color: '#' + route.route_color },
        type: 'Feature'
      })
    ),
    type: 'FeatureCollection'
  }

  return (
    <>
      <TransitVehicleOverlay alwaysRenderText ambient vehicles={vehicles} />
      <Source data={geojson} id="route" type="geojson">
        <Layer
          id="route"
          layout={{
            'line-cap': 'round',
            'line-join': 'round'
          }}
          paint={{
            'line-color': ['get', 'color'],
            'line-opacity': 0.95,
            'line-width': 3
          }}
          type="line"
        />
      </Source>
    </>
  )
}

export default GtfsRtVehicleOverlay
