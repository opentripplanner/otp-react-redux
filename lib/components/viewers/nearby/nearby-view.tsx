import { connect } from 'react-redux'
import { MapRef, useMap } from 'react-map-gl'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../../actions/api'

import Stop from './stop'
import Vehicle from './vehicle-rent'

type LatLonObj = { lat: number; lon: number }

type Props = {
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  hideBackButton?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
}

// TODO: THIS NEEDS TO BE IN ITS OWN FILE WHOS THE GIT BLAME ON THIS!!!!!!!!!!!!!!!!!!!!
const NearbyViewContainer = styled.div`
  display: flex;
  flex-direction: col;
`

function NearbyView(props: Props): JSX.Element {
  const { fetchNearby, nearby, nearbyViewCoords } = props
  const map = useMap().current
  useEffect(() => {
    if (nearbyViewCoords) {
      fetchNearby(nearbyViewCoords, map)
    }
  }, [nearbyViewCoords])

  // TODO: when coordiantes are set, put a marker on the map and zoom there

  if (nearby) {
    return nearby.map((n) => {
      const { place } = n.node
      switch (place.__typename) {
        case 'RentalVehicle':
          return <Vehicle vehicle={place} />
        case 'Stop':
          return (
            <Stop
              setHoveredStop={() => alert(1)}
              showOperatorLogo
              stopData={place}
              transitOperators={{}}
            />
          )
        default:
          return 'you are from the future and have a cool new version of OTP2 let me know how it is mlsgrnt@icloud.com'
      }
    })
  }

  return (
    <>
      hello {props.nearbyViewCoords?.lat} {props.nearbyViewCoords?.lon}
    </>
  )
}

const mapStateToProps = (state: any) => {
  const { transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  console.log(state.otp)
  return {
    nearby,
    nearbyViewCoords
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
