import { Company } from '@opentripplanner/types'
import { connect } from 'react-redux'
import { MapRef, useMap } from 'react-map-gl'
import React, { useEffect } from 'react'
import styled from 'styled-components'

import * as apiActions from '../../../actions/api'

import { NearbySidebarContainer, Scrollable } from './styled'
import Stop from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

type LatLonObj = { lat: number; lon: number }

type Props = {
  companies: Company[]
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  hideBackButton?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
}

const getNearbyItem = (place: any, companies: Company[]) => {
  switch (place.__typename) {
    case 'RentalVehicle':
      return <Vehicle companies={companies} vehicle={place} />
    case 'Stop':
      return (
        <Stop
          setHoveredStop={() => alert(1)}
          showOperatorLogo
          stopData={place}
          transitOperators={{}}
        />
      )
    case 'VehicleParking':
      return <VehicleParking place={place} />
    default:
      return `${place.__typename}you are from the future and have a cool new version of OTP2 let me know how it is mlsgrnt@icloud.com`
  }
}

function NearbyView(props: Props): JSX.Element {
  const { companies, fetchNearby, nearby, nearbyViewCoords } = props
  const map = useMap().current
  useEffect(() => {
    if (nearbyViewCoords) {
      fetchNearby(nearbyViewCoords, map)
    }
  }, [nearbyViewCoords])

  // TODO: when coordiantes are set, put a marker on the map and zoom there

  return (
    <Scrollable>
      <NearbySidebarContainer className="base-color-bg">
        {nearby?.map((n: any) => getNearbyItem(n.node.place, companies))}
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
