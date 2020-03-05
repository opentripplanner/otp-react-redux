import BaseMap from '@opentripplanner/base-map'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
} from '../../actions/api'
import BoundsUpdatingOverlay from './bounds-updating-overlay'
import EndpointsOverlay from './connected-endpoints-overlay'
import ParkAndRideOverlay from './connected-park-and-ride-overlay'
// import StopsOverlay from './connected-stops-overlay'
// import StopViewerOverlay from '@opentripplanner/stop-viewer-overlay'
// import TileOverlay from './tile-overlay'
import TransitiveOverlay from './connected-transitive-overlay'
// import TripViewerOverlay from '@opentripplanner/trip-viewer-overlay'
// import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'
// import VehicleRentalOverlay from '@opentripplanner/vehicle-rental-overlay'
// import ZipcarOverlay from './zipcar-overlay'

const MapContainer = styled.div`
  height: 100%;
  width: 100%;

  .map {
    height: 100%;
    width: 100%;
  }

  * {
    box-sizing: unset;
  }
`

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

    const center = mapConfig && mapConfig.initLat && mapConfig.initLon
      ? [mapConfig.initLat, mapConfig.initLon]
      : null

    return (
      <MapContainer>
        <BaseMap
          center={center}
          maxZoom={mapConfig.maxZoom}
          onClick={() => console.log('map click', arguments)}
          onOverlayAdd={() => console.log('overlay add', arguments)}
          onOverlayRemove={() => console.log('overlay remove', arguments)}
          onViewportChanged={() => console.log('viewport change', arguments)}
          zoom={mapConfig.initZoom || 13}
        >
          {/* The default overlays */}
          {/* <TripViewerOverlay />
          <StopViewerOverlay />
          <RouteViewerOverlay /> */}
          <TransitiveOverlay />
          <EndpointsOverlay />
          <BoundsUpdatingOverlay />

          {/* The configurable overlays */}
          {mapConfig.overlays && mapConfig.overlays.map((overlayConfig, k) => {
            switch (overlayConfig.type) {
              // case 'bike-rental': return (
              //   <VehicleRentalOverlay
              //     key={k}
              //     {...overlayConfig}
              //     refreshVehicles={bikeRentalQuery}
              //     stations={bikeRentalStations}
              //   />
              // )
              // case 'car-rental': return (
              //   <VehicleRentalOverlay
              //     key={k}
              //     baseIconClass='car-rental-icon'
              //     {...overlayConfig}
              //     refreshVehicles={carRentalQuery}
              //     stations={carRentalStations}
              //   />
              // )
              case 'park-and-ride':
                return <ParkAndRideOverlay key={k} {...overlayConfig} />
              // case 'stops': return <StopsOverlay key={k} {...overlayConfig} />
              // case 'tile': return <TileOverlay key={k} {...overlayConfig} />
              // case 'micromobility-rental': return (
              //   <VehicleRentalOverlay
              //     key={k}
              //     baseIconClass='micromobility-rental-icon'
              //     {...overlayConfig}
              //     refreshVehicles={vehicleRentalQuery}
              //     stations={vehicleRentalStations}
              //   />
              // )
              // case 'zipcar': return <ZipcarOverlay key={k} {...overlayConfig} />
              default: return null
            }
          })}
        </BaseMap>
      </MapContainer>
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
