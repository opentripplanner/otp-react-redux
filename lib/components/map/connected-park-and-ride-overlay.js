import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setLocation } from '../../actions/map'
import { parkAndRideQuery } from '../../actions/api'

class ConnectedParkAndRideOverlay extends Component {
  componentDidMount () {
    const params = {}
    if (this.props.maxTransitDistance) {
      params['maxTransitDistance'] = this.props.maxTransitDistance
    }
    // TODO: support config-defined bounding envelope

    this.props.parkAndRideQuery(params)
  }

  render () {
    return (
      <ParkAndRideOverlay {...this.props} />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    parkAndRideLocations: state.otp.overlay.parkAndRide &&
      state.otp.overlay.parkAndRide.locations
  }
}

const mapDispatchToProps = {
  setLocation,
  parkAndRideQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedParkAndRideOverlay)
