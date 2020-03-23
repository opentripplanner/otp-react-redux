import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
} from '../../actions/api'

import BaseMap from './base-map'
import EndpointsOverlay from './endpoints-overlay'
import ParkAndRideOverlay from './park-and-ride-overlay'
import RouteViewerOverlay from './route-viewer-overlay'
import StopsOverlay from './stops-overlay'
import StopViewerOverlay from './stop-viewer-overlay'
import TileOverlay from './tile-overlay'
import TransitiveOverlay from './transitive-overlay'
import TripViewerOverlay from './connected-trip-viewer-overlay'
import VehicleRentalOverlay from './vehicle-rental-overlay'
import ZipcarOverlay from './zipcar-overlay'

class DefaultMap extends Component {
  render () {
    const {
      bikeRentalQuery,
      bikeRentalStations,
      carRentalQuery,
      carRentalStations,
      mapConfig,
      vehicleRentalQuery,
      vehicleRentalStations
    } = this.props
    return (
      <BaseMap
        toggleLabel={<span><i className='fa fa-map' /> Map View</span>}
        {...this.props}
      >
        {/* The default overlays */}
        <TripViewerOverlay />
        <StopViewerOverlay />
        <RouteViewerOverlay />
        <TransitiveOverlay />
        <EndpointsOverlay />

        {/* The configurable overlays */}
        {mapConfig.overlays && mapConfig.overlays.map((overlayConfig, k) => {
          switch (overlayConfig.type) {
            case 'bike-rental': return (
              <VehicleRentalOverlay
                key={k}
                {...overlayConfig}
                refreshVehicles={bikeRentalQuery}
                stations={bikeRentalStations}
              />
            )
            case 'car-rental': return (
              <VehicleRentalOverlay
                key={k}
                baseIconClass='car-rental-icon'
                {...overlayConfig}
                refreshVehicles={carRentalQuery}
                stations={carRentalStations}
              />
            )
            case 'park-and-ride': return <ParkAndRideOverlay key={k} {...overlayConfig} />
            case 'stops': return <StopsOverlay key={k} {...overlayConfig} />
            case 'tile': return <TileOverlay key={k} {...overlayConfig} />
            case 'micromobility-rental': return (
              <VehicleRentalOverlay
                key={k}
                baseIconClass='micromobility-rental-icon'
                {...overlayConfig}
                refreshVehicles={vehicleRentalQuery}
                stations={vehicleRentalStations}
              />
            )
            case 'zipcar': return <ZipcarOverlay key={k} {...overlayConfig} />
            default: return null
          }
        })}
      </BaseMap>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    bikeRentalStations: state.otp.overlay.bikeRental.stations,
    carRentalStations: state.otp.overlay.carRental.stations,
    mapConfig: state.otp.config.map,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  }
}

const mapDispatchToProps = {
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultMap)
