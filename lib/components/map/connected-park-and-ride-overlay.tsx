import { connect } from 'react-redux'
import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { Component, useEffect } from 'react'

import { parkAndRideQuery } from '../../actions/api'
import { setLocation } from '../../actions/map'

type ParkAndRideParams = {
  maxTransitDistance?: number
  // FIXME: properly type
}

// rewrote this as a functional component, still need to add more Typescript
function ConnectedParkAndRideOverlay(props: any): JSX.Element {
  useEffect(() => {
    const params: ParkAndRideParams = {}
    if (props.maxTransitDistance) {
      params.maxTransitDistance = props.maxTransitDistance
    }

    props.parkAndRideQuery(params)
  }, [])

  return <ParkAndRideOverlay {...props} />
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
