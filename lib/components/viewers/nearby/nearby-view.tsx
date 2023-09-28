import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { MapRef, useMap } from 'react-map-gl'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../../actions/api'

import { NearbySidebarContainer, Scrollable } from './styled'
import RentalStation from './rental-station'
import Stop from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

type LatLonObj = { lat: number; lon: number }

type Props = {
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  hideBackButton?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
}

const getNearbyItem = (place: any) => {
  switch (place.__typename) {
    case 'RentalVehicle':
      return <Vehicle vehicle={place} />
    case 'Stop':
      return <Stop showOperatorLogo stopData={place} transitOperators={{}} />
    case 'VehicleParking':
      return <VehicleParking place={place} />
    case 'BikeRentalStation':
      return <RentalStation place={place} />
    default:
      return `${place.__typename}you are from the future and have a cool new version of OTP2 let me know how it is mlsgrnt@icloud.com`
  }
}

function NearbyView(props: Props): JSX.Element {
  const { fetchNearby, nearby, nearbyViewCoords } = props
  const map = useMap().current
  useEffect(() => {
    if (nearbyViewCoords) {
      fetchNearby(nearbyViewCoords, map)
      const interval = setInterval(() => {
        fetchNearby(nearbyViewCoords, map)
      }, 2000)
      return function cleanup() {
        clearInterval(interval)
      }
    }
  }, [nearbyViewCoords])

  // TODO: when coordiantes are set, put a marker on the map and zoom there

  return (
    <Scrollable>
      <NearbySidebarContainer className="base-color-bg">
        {nearby?.map((n: any) => getNearbyItem(n.node.place))}
      </NearbySidebarContainer>
    </Scrollable>
  )
}

const mapStateToProps = (state: any) => {
  const { config, transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  return {
    companies: config.companies,
    nearby,
    nearbyViewCoords
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
