import React, { Component } from 'react'

import BaseMap from './base-map'
import BikeRentalOverlay from './bike-rental-overlay'
import EndpointsOverlay from './endpoints-overlay'
import RoutesOverlay from './routes-overlay'
import StopsOverlay from './stops-overlay'
import StopViewerOverlay from './stop-viewer-overlay'
import TransitiveOverlay from './transitive-overlay'
import TripViewerOverlay from './trip-viewer-overlay'

export default class DefaultMap extends Component {
  render () {
    return (
      <BaseMap
        toggleLabel={<span><i className='fa fa-map' /> Map View</span>}
        onClick={this.props.onClick}
      >
        <TripViewerOverlay />
        <BikeRentalOverlay controlName='Bike Stations' />
        <TransitiveOverlay />
        <RoutesOverlay controlName='Transit Routes' />
        <EndpointsOverlay />
        <StopsOverlay controlName='Transit Stops' />
        <StopViewerOverlay />
      </BaseMap>
    )
  }
}
