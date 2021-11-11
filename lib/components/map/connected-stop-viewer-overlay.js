import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import VehicleRentalOverlay from '@opentripplanner/vehicle-rental-overlay'
import ZoomBasedMarkers from '@opentripplanner/zoom-based-markers'
import React from 'react'
import { FeatureGroup, MapLayer, withLeaflet } from 'react-leaflet'
import { connect } from 'react-redux'

import * as mapActions from '../../actions/map'

import EnhancedStopMarker from './enhanced-stop-marker'

// Minimum zoom to show stop-viewer overlay content
const MIN_ZOOM = 17

/**
 * An overlay to view a collection of stops.
 */
class StopViewerOverlay extends MapLayer {
  componentDidMount () {}

  componentWillUnmount () {}

  createLeafletElement () {}

  updateLeafletElement () {}

  componentDidUpdate (prevProps) {
    const {leaflet, stopData} = this.props
    // If a new stop is clicked, close the stop viewer popup
    if (stopData?.id !== prevProps?.stopData?.id) {
      leaflet.map && leaflet.map.closePopup()
    }
  }

  render () {
    const {
      configCompanies,
      leaflet,
      mapConfig,
      setLocation,
      stopData,
      stops
    } = this.props
    if (!stopData) return null
    const { bikeRental, parkAndRideLocations, vehicleRental } = stopData
    // Don't render if no map or no stops are defined.
    // (ZoomBasedMarkers will also not render below the minimum zoom threshold defined in the symbols prop.)
    if (!leaflet || !leaflet.map) {
      return <FeatureGroup />
    }
    const stopSymbols = [
      {
        minZoom: MIN_ZOOM,
        symbol: EnhancedStopMarker
      }
    ]
    const zoom = leaflet.map.getZoom()
    // if (zoom < stopSymbols[0].minZoom) return <FeatureGroup />
    return (
      <FeatureGroup>
        {stops && stops.length > 0 &&
          <ZoomBasedMarkers entities={stops} symbols={stopSymbols} zoom={zoom} />
        }
        <ParkAndRideOverlay
          parkAndRideLocations={parkAndRideLocations}
          setLocation={setLocation}
          visible />
        {mapConfig.overlays && mapConfig.overlays.map((overlayConfig, k) => {
          switch (overlayConfig.type) {
            case 'bike-rental': return (
              <VehicleRentalOverlay
                key={k}
                {...overlayConfig}
                configCompanies={configCompanies}
                stations={bikeRental && bikeRental.stations}
                visible={zoom >= MIN_ZOOM - 1}
              />
            )
            case 'micromobility-rental': return (
              <VehicleRentalOverlay
                key={k}
                {...overlayConfig}
                configCompanies={configCompanies}
                stations={vehicleRental?.stations}
                visible={zoom >= MIN_ZOOM - 1}
              />
            )
            default: return null
          }
        })}
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const stopLookup = state.otp.transitIndex.stops
  const stopData = stopLookup[state.otp.ui.viewedStop?.stopId]
  const nearbyStops = stopData?.nearbyStops?.map(stopId => stopLookup[stopId])
  const stops = []
  if (stopData) stops.push(stopData)
  if (nearbyStops && nearbyStops.length > 0) stops.push(...nearbyStops)
  return {
    configCompanies: state.otp.config.companies,
    mapConfig: state.otp.config.map,
    stopData,
    stops
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(StopViewerOverlay))
