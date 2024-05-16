import { connect } from 'react-redux'
import { Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import React from 'react'
import styled from 'styled-components'

import { AppReduxState } from '../../util/state-types'
import { DARK_TEXT_GREY } from '../util/colors'

type Props = {
  location: Location | null
}

const NearbyDot = styled.div<{ invisible: boolean }>`
  background: var(--main-base-color, ${DARK_TEXT_GREY});
  border-radius: 30px;
  box-shadow: 0px 0px 10px 10px var(--main-base-color, ${DARK_TEXT_GREY});
  cursor: pointer;
  display: block;
  height: 50px;
  opacity: ${(props) => (props.invisible ? 0 : 0.3)};
  transition: 0.1s opacity ease-out;
  width: 50px;
`

const NearbyViewDotOverlay = ({ location }: Props) => {
  return (
    <Marker latitude={location?.lat || 0} longitude={location?.lon || 0}>
      <NearbyDot invisible={!location} />
    </Marker>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { highlightedLocation } = state.otp.ui
  return {
    location: highlightedLocation
  }
}

export default connect(mapStateToProps)(NearbyViewDotOverlay)
