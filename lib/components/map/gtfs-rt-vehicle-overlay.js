import { transit_realtime as transitRealtime } from 'gtfs-realtime-bindings'
import L from 'leaflet'
import memoize from 'lodash.memoize'
import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
import PropTypes from 'prop-types'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import { FeatureGroup, MapLayer, Marker, Polyline } from 'react-leaflet'
import styled from 'styled-components'

import { getModeFromRoute } from '../../util/viewer'

export const VehicleShape = styled.span`
  background-color: #${props => props.route?.route_color || '000000'};
  border: 1px solid #000000;
  border-radius: 50%;
  color: #${props => props.route?.route_text_color || 'ffffff'};
  display: block;
  height: 24px;
  left: -6px;
  line-height: 24px;
  margin-left: auto;
  margin-right: auto;
  position: relative;
  text-align: center;
  top: -6px;
  width: 24px;
`

/**
 * Convert GTFS-rt entities to vehicle location from OTP-UI.
 * @param vehicle The GTFS-rt vehicle position entity to convert.
 * @param routes Optional GTFS-like routes list.
 */
function gtfsRtToTransitVehicle (gtfsRtVehicle, routes) {
  const { position, stopId, timestamp, trip, vehicle } = gtfsRtVehicle.vehicle
  const route = routes.find(r => r.route_id === trip.routeId)
  let routeShortName
  let routeType = 'BUS'
  if (route) {
    routeShortName = route.route_short_name
    // Obtain the OTP route type from the GTFS route_type enum value.
    routeType = getModeFromRoute({ type: route.route_type })
  }
  return {
    heading: position.bearing,
    id: vehicle.id,
    lat: position.latitude,
    lon: position.longitude,
    reportDate: new Date(parseInt(timestamp, 10)).toLocaleString(),
    routeShortName,
    routeType,
    stopId,
    tripId: trip.tripId,
    vehicleId: vehicle.id
  }
}

/**
 * A memoized function to cache the HTML icon for each route.
 */
const getRouteIconHtml = memoize(
  route => ReactDOMServer.renderToStaticMarkup(
    <VehicleShape route={route}>
      {route.route_short_name}
    </VehicleShape>
  )
)

/**
 * Generate a vehicle shape component (a colored dot) based on the provided routes list.
 */
function makeVehicleShape (routes) {
  return props => {
    const { lat, lon, routeShortName } = props.vehicle
    const route = routes.find(r => r.route_short_name === routeShortName) || {}
    const iconHtml = getRouteIconHtml(route)
    return (
      <Marker
        icon={L.divIcon({ html: iconHtml })}
        position={[lat, lon]}
      />
    )
  }
}

/**
 * This component is a composite overlay that renders GTFS-rt vehicle positions
 * that it downloads from the liveFeedUrl prop, using the
 * @opentripplanner/transit-vehicle-overlay package.
 *
 * For transit routes not defined in a known GTFS feed, this component also
 * renders transit route shapes if available from the routeDefinitionUrl prop.
 */
class GtfsRtVehicleOverlay extends MapLayer {
  static propTypes = {
    /** URL to GTFS-rt feed in protocol buffer format. */
    liveFeedUrl: PropTypes.string,
    /** URL to GTFS-like route list in JSON format. */
    routeDefinitionUrl: PropTypes.string,
    /**
     * Sets whether the layer is initially visible
     * (inherited from MapLayer, it is not explicitly used here).
     */
    visible: PropTypes.bool
  }

  constructor (props) {
    super(props)
    this.state = {
      routes: [],
      vehicleLocations: [],
      // Set to undefined to fall back on the default symbols,
      // unless a route definition is provided.
      vehicleSymbols: undefined,
      visible: props.visible
    }
  }

  componentDidMount () {
    const { liveFeedUrl, name, registerOverlay, routeDefinitionUrl } = this.props
    registerOverlay(this)
    if (!liveFeedUrl) {
      console.warn(`liveFeedUrl prop is missing for overlay '${name}'.`)
    }
    if (!routeDefinitionUrl) {
      console.warn(`routeDefinitionUrl prop is missing for overlay '${name}'.`)
    } else {
      this._fetchRoutes()
    }
  }

  componentWillUnmount () {
    this._stopRefreshing()
  }

  onOverlayAdded = () => {
    this.setState({ visible: true })
    this._startRefreshing()
  }

  onOverlayRemoved = () => {
    this.setState({ visible: false })
    this._stopRefreshing()
  }

  createLeafletElement () {}

  updateLeafletElement () {}

  /**
   * Fetches GTFS-rt vehicle positions (protocol buffer) and converts to
   * OTP-UI transitVehicleType before saving to component state.
   */
  _fetchVehiclePositions = async () => {
    const { liveFeedUrl } = this.props
    if (liveFeedUrl) {
      try {
        const response = await fetch(liveFeedUrl)
        if (response.status >= 400) {
          const error = new Error('Received error from server')
          error.response = response
          throw error
        }
        const buffer = await response.arrayBuffer()
        const view = new Uint8Array(buffer)
        const feed = transitRealtime.FeedMessage.decode(view)

        const vehicleLocations = feed.entity.map(vehicle => gtfsRtToTransitVehicle(vehicle, this.state.routes))
        this.setState({ vehicleLocations })
      } catch (err) {
        console.log(err)
      }
    }
  }

  /**
   * Fetches GTFS-like route definitions (JSON).
   * (called once when component is mounted)
   */
  _fetchRoutes = async () => {
    const { routeDefinitionUrl } = this.props
    if (routeDefinitionUrl) {
      try {
        const response = await fetch(routeDefinitionUrl)
        if (response.status >= 400) {
          const error = new Error('Received error from server')
          error.response = response
          throw error
        }
        const routes = await response.json()

        // Generate the symbols for the overlay at this time
        // so it renders the route colors for each vehicle.
        const vehicleSymbols = [
          {
            minZoom: 0,
            symbol: makeVehicleShape(routes)
          }
        ]

        this.setState({ routes, vehicleSymbols })
      } catch (err) {
        console.log(err)
      }
    }
  }

  _startRefreshing () {
    // initial vehicle retrieval
    this._fetchVehiclePositions()

    // set up timer to refresh vehicle positions periodically.
    // defaults to every 30 sec.
    this._refreshTimer = setInterval(this._fetchVehiclePositions, 30000)
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  render () {
    const { routes, vehicleLocations, vehicleSymbols, visible } = this.state
    return (
      <FeatureGroup>
        {routes.map(r => (
          <Polyline
            color={`#${r.route_color}`}
            key={r.route_id}
            opacity={0.6}
            positions={r.shape}
          />
        ))}
        <TransitVehicleOverlay
          symbols={vehicleSymbols}
          vehicleList={visible ? vehicleLocations : null}
        />
      </FeatureGroup>
    )
  }
}

export default GtfsRtVehicleOverlay
