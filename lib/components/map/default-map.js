import BaseMap from '@opentripplanner/base-map'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import {
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
} from '../../actions/api'
import {
  setLocation,
  setMapPopupLocation,
  setMapPopupLocationAndGeocode
} from '../../actions/map'
import BoundsUpdatingOverlay from './bounds-updating-overlay'
import EndpointsOverlay from './connected-endpoints-overlay'
import ParkAndRideOverlay from './connected-park-and-ride-overlay'
import RouteViewerOverlay from './connected-route-viewer-overlay'
import StopViewerOverlay from './connected-stop-viewer-overlay'
import StopsOverlay from './connected-stops-overlay'
import TransitiveOverlay from './connected-transitive-overlay'
import TripViewerOverlay from './connected-trip-viewer-overlay'
import VehicleRentalOverlay from './connected-vehicle-rental-overlay'
import TileOverlay from './tile-overlay'
import ZipcarOverlay from './zipcar-overlay'

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
  onMapClick = (e) => {
    this.props.setMapPopupLocationAndGeocode(e)
  }

  onPopupClosed = () => {
    this.props.setMapPopupLocation({ location: null })
  }

  onSetLocationFromPopup = (payload) => {
    const { setLocation, setMapPopupLocation } = this.props
    setMapPopupLocation({ location: null })
    setLocation(payload)
  }

  render () {
    const {
      bikeRentalQuery,
      bikeRentalStations,
      carRentalQuery,
      carRentalStations,
      mapConfig,
      mapPopupLocation,
      vehicleRentalQuery,
      vehicleRentalStations
    } = this.props

    const center = mapConfig && mapConfig.initLat && mapConfig.initLon
      ? [mapConfig.initLat, mapConfig.initLon]
      : null

    const popup = mapPopupLocation && {
      contents: (
        <div style={{ width: 240 }}>
          <div style={{ fontSize: 14, marginBottom: 6 }}>
            {mapPopupLocation.name.split(',').length > 3
              ? mapPopupLocation.name.split(',').splice(0, 3).join(',')
              : mapPopupLocation.name
            }
          </div>
          <div>
            Plan a trip:
            <FromToLocationPicker
              location={mapPopupLocation}
              setLocation={this.onSetLocationFromPopup}
            />
          </div>
        </div>
      ),
      location: [mapPopupLocation.lat, mapPopupLocation.lon]
    }

    return (
      <MapContainer>
        <BaseMap
          center={center}
          maxZoom={mapConfig.maxZoom}
          onClick={this.onMapClick}
          popup={popup}
          onPopupClosed={this.onPopupClosed}
          zoom={mapConfig.initZoom || 13}
        >
          {/* The default overlays */}
          <BoundsUpdatingOverlay />
          <EndpointsOverlay />
          <RouteViewerOverlay />
          <StopViewerOverlay />
          <TransitiveOverlay />
          <TripViewerOverlay />

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
                  {...overlayConfig}
                  refreshVehicles={carRentalQuery}
                  stations={carRentalStations}
                />
              )
              case 'park-and-ride':
                return <ParkAndRideOverlay key={k} {...overlayConfig} />
              case 'stops': return <StopsOverlay key={k} {...overlayConfig} />
              case 'tile': return <TileOverlay key={k} {...overlayConfig} />
              case 'micromobility-rental': return (
                <VehicleRentalOverlay
                  key={k}
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
    mapPopupLocation: state.otp.ui.mapPopupLocation,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  }
}

const mapDispatchToProps = {
  bikeRentalQuery,
  carRentalQuery,
  setLocation,
  setMapPopupLocation,
  setMapPopupLocationAndGeocode,
  vehicleRentalQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultMap)
