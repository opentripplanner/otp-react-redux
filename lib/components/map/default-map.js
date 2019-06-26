import React, { Component } from 'react'
import { connect } from 'react-redux'

import BaseMap from './base-map'
import BikeRentalOverlay from './bike-rental-overlay'
import CarRentalOverlay from './car-rental-overlay'
import EndpointsOverlay from './endpoints-overlay'
import ParkAndRideOverlay from './park-and-ride-overlay'
import StopsOverlay from './stops-overlay'
import StopViewerOverlay from './stop-viewer-overlay'
import TileOverlay from './tile-overlay'
import TransitiveOverlay from './transitive-overlay'
import TripViewerOverlay from './trip-viewer-overlay'
import RouteViewerOverlay from './route-viewer-overlay'
import ZipcarOverlay from './zipcar-overlay'

class DefaultMap extends Component {
  render () {
    const { mapConfig } = this.props
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
            case 'car-rental': return <CarRentalOverlay key={k} {...overlayConfig} />
            case 'bike-rental': return <BikeRentalOverlay key={k} {...overlayConfig} />
            case 'park-and-ride': return <ParkAndRideOverlay key={k} {...overlayConfig} />
            case 'stops': return <StopsOverlay key={k} {...overlayConfig} />
            case 'tile': return <TileOverlay key={k} {...overlayConfig} />
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
    mapConfig: state.otp.config.map
  }
}

export default connect(mapStateToProps)(DefaultMap)
