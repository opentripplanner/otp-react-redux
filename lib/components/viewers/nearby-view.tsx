import { connect } from 'react-redux'
import { MapRef, useMap } from 'react-map-gl'
import React from 'react'

import * as apiActions from '../../actions/api'

type LatLonObj = { lat: number; lon: number }

type Props = {
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  hideBackButton?: boolean
  nearbyViewCoords?: LatLonObj
}

function NearbyView(props: Props): JSX.Element {
  const { fetchNearby, nearbyViewCoords } = props
  const map = useMap().current
  if (nearbyViewCoords) {
    fetchNearby(nearbyViewCoords, map)
  }
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

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
