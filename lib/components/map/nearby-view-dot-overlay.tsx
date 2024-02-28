import { connect } from 'react-redux'
import { Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'

type Props = {
  location: Location | null
}

const NearbyDot = styled.div`
  background: var(--main-base-color, #333);
  border-radius: 30px;
  box-shadow: 0px 0px 10px 10px var(--main-base-color, #333);
  cursor: pointer;
  display: block;
  height: 50px;
  opacity: 0.3;
  width: 50px;
`

const NearbyViewDotOverlay = ({ location }: Props) => {
  if (!location) return null
  return (
    <Marker latitude={location.lat} longitude={location.lon}>
      <NearbyDot />
    </Marker>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { highlightedLocation } = state.otp.ui
  // TODO: Check for nearby view status and hide if it's not
  return {
    location: highlightedLocation
  }
}

export default connect(mapStateToProps)(NearbyViewDotOverlay)
