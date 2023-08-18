import { connect } from 'react-redux'
import React from 'react'

type Props = {
  hideBackButton?: boolean
  nearbyViewCoords?: { lat: number; lon: number }
}

function NearbyView(props: Props): JSX.Element {
  return (
    <>
      hello {props.nearbyViewCoords?.lat} {props.nearbyViewCoords?.lon}
    </>
  )
}

const mapStateToProps = (state: any) => {
  const { ui } = state.otp
  const { nearbyViewCoords } = ui
  return {
    nearbyViewCoords
  }
}

export default connect(mapStateToProps)(NearbyView)
