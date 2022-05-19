import { connect } from 'react-redux'
import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { Component } from 'react'

import { parkAndRideQuery } from '../../actions/api'
import { setLocation } from '../../actions/map'

type ParkAndRideParams = {
  maxTransitDistance?: number
  // FIXME: properly type
}

class ConnectedParkAndRideOverlay extends Component<
  { parkAndRideQuery: (params: ParkAndRideParams) => void } & ParkAndRideParams
> {
  componentDidMount() {
    const params: ParkAndRideParams = {}
    if (this.props.maxTransitDistance) {
      params.maxTransitDistance = this.props.maxTransitDistance
    }
    // TODO: support config-defined bounding envelope

    this.props.parkAndRideQuery(params)
  }

  render() {
    return <ParkAndRideOverlay {...this.props} />
  }
}

// connect to the redux store

const mapStateToProps = (state: {
  // FIXME: Properly type OTP state
  otp: { overlay: { parkAndRide: { locations: unknown } } }
}) => {
  const { locations } = state.otp.overlay?.parkAndRide

  // If locations is not an array, it is an error, in which case don't render anything.
  return Array.isArray(locations)
    ? {
        parkAndRideLocations: locations
      }
    : {}
}

const mapDispatchToProps = {
  parkAndRideQuery,
  setLocation
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedParkAndRideOverlay)
