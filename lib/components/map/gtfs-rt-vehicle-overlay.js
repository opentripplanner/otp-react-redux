import { transit_realtime as transitRealtime } from 'gtfs-realtime-bindings'
import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
import PropTypes from 'prop-types'
import React from 'react'
import { MapLayer } from 'react-leaflet'

/**
 * Convert GTFS-rt entities to vehicle location from OTP-UI.
 * @param vehicle The GTFS-rt vehicle position entity to convert.
 */
function gtfsRtToTransitVehicle (gtfsRtVehicle) {
  const { position, stopId, timestamp, trip, vehicle } = gtfsRtVehicle.vehicle
  return {
    heading: position.bearing,
    id: vehicle.id,
    lat: position.latitude,
    lon: position.longitude,
    reportDate: timestamp,
    // FIXME: link the routeId below to GTFS to obtain route names.
    routeShortName: trip.routeId,
    routeType: 'BUS',
    stopId,
    tripId: trip.tripId,
    vehicleId: vehicle.id
  }
}

/**
 * Class that loads and renders a GTFS-rt vehicle positions feed.
 */
class GtfsRtVehicleOverlay extends MapLayer {
  static propTypes = {
    liveFeedUrl: PropTypes.string // url to GTFS-rt feed in protocol buffer format.
  }

  constructor (props) {
    super(props)
    this.state = {
      vehicleLocations: [],
      visible: props.visible
    }
  }

  componentDidMount () {
    this.props.registerOverlay(this)
    if (!this.props.liveFeedUrl) {
      console.warn(`liveFeedUrl prop is missing for overlay '${this.props.name}'.`)
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
    if (this.props.liveFeedUrl) {
      console.log('Fetching live feed for GTFS-rt')
      try {
        const response = await fetch(this.props.liveFeedUrl)
        if (response.status >= 400) {
          const error = new Error('Received error from server')
          error.response = response
          throw error
        }
        const buffer = await response.arrayBuffer()
        const view = new Uint8Array(buffer)
        const feed = transitRealtime.FeedMessage.decode(view)

        const vehicleLocations = feed.entity.map(gtfsRtToTransitVehicle)
        this.setState({ vehicleLocations })
      } catch (err) {
        console.log(err)
      }
    }
  }

  _startRefreshing () {
    // ititial vehicle retrieval
    this._fetchVehiclePositions()

    // set up timer to refresh stations periodically
    // defaults to every 30 sec.
    this._refreshTimer = setInterval(this._fetchVehiclePositions, 30000)
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  render () {
    const { vehicleLocations, visible } = this.state
    return (
      <TransitVehicleOverlay
        {...this.props}
        vehicleList={visible ? vehicleLocations : null}
      />
    )
  }
}

export default GtfsRtVehicleOverlay
