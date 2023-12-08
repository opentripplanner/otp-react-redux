import { connect } from 'react-redux'
import { Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import React from 'react'

import { AppReduxState } from '../../util/state-types'

type Props = {
  location: Location | null
}

const NearbyViewDotOverlay = ({ location }: Props) => {
  if (!location) return null
  return <Marker latitude={location.lat} longitude={location.lon} />
}

const mapStateToProps = (state: AppReduxState) => {
  const { highlightedLocation } = state.otp.ui
  console.log(highlightedLocation)
  return {
    location: highlightedLocation
  }
}

export default connect(mapStateToProps)(NearbyViewDotOverlay)
