import { connect } from 'react-redux'
import { Location } from '@opentripplanner/types'
import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { useEffect } from 'react'

import { parkAndRideQuery } from '../../actions/api'
import { setLocation } from '../../actions/map'
import { SetLocationHandler } from '../util/types'

type ParkAndRideParams = {
  maxTransitDistance?: number
}
type Props = ParkAndRideParams & {
  id?: string
  keyboard?: boolean
  parkAndRideLocations?: { name: string; x: number; y: number }[]
  parkAndRideQuery: (params: ParkAndRideParams) => void
  setLocation: SetLocationHandler
}

function ConnectedParkAndRideOverlay(props: Props): JSX.Element {
  useEffect(() => {
    const params: ParkAndRideParams = {}
    if (props.maxTransitDistance) {
      params.maxTransitDistance = props.maxTransitDistance
    }

    props.parkAndRideQuery(params)
  }, [props])

  // @ts-expect-error the package isn't typed to handle an empty array even though it can
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
