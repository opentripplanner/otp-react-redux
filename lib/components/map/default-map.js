import React, { Component } from 'react'
import { connect } from 'react-redux'

import BaseMap from './base-map'
import BikeRentalOverlay from './bike-rental-overlay'
import CarRentalOverlay from './car-rental-overlay'
import CurrentPositionMarker from './current-position-marker'
import EndpointsOverlay from './endpoints-overlay'
import ParkAndRideOverlay from './park-and-ride-overlay'
import RoutesOverlay from './routes-overlay'
import StopsOverlay from './stops-overlay'
import StopViewerOverlay from './stop-viewer-overlay'
import TransitiveCanvasOverlay from './transitive-canvas-overlay'
import TripViewerOverlay from './trip-viewer-overlay'
import RouteViewerOverlay from './route-viewer-overlay'
import DistanceMeasure from './distance-measure'
import ZipcarOverlay from './zipcar-overlay'

import { isMobile } from '../../util/ui'

class DefaultMap extends Component {
  render () {
    const { mapConfig } = this.props
    return (
      <BaseMap
        toggleLabel={<span><i className='fa fa-map' /> Map View</span>}
        {...this.props}
      >
        <TripViewerOverlay />
        <BikeRentalOverlay controlName='Bike Stations' />
        {mapConfig.carRentalOverlay && <CarRentalOverlay controlName={mapConfig.carRentalOverlay.name} />}
        {mapConfig.zipcarOverlay && <ZipcarOverlay controlName='Zipcar Locations' />}
        {mapConfig.parkAndRideOverlay && <ParkAndRideOverlay controlName='Park & Ride Locations' />}
        <TransitiveCanvasOverlay />
        <RoutesOverlay controlName='Transit Routes' />
        <EndpointsOverlay />
        <StopsOverlay controlName='Transit Stops' visible />
        <StopViewerOverlay />
        <RouteViewerOverlay />
        {isMobile() && <CurrentPositionMarker />}
        {!isMobile() && <DistanceMeasure />}
      </BaseMap>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    mapConfig: state.otp.config.map
  }
}

export default connect(mapStateToProps)(DefaultMap)
