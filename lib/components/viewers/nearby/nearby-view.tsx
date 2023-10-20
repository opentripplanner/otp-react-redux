import { connect } from 'react-redux'
import { MapRef, useMap } from 'react-map-gl'
import { useIntl } from 'react-intl'
import React, { useEffect, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'

import {
  FloatingLoadingIndicator,
  NearbySidebarContainer,
  Scrollable
} from './styled'
import Loading from '../../narrative/loading'
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
      return <Vehicle key={place.id} vehicle={place} />
    case 'Stop':
      return <Stop showOperatorLogo stopData={place} />
    case 'VehicleParking':
      return <VehicleParking place={place} />
    case 'BikeRentalStation':
      return <RentalStation place={place} />
    default:
      return `${place.__typename}you are from the future and have a cool new version of OTP2 let me know how it is mlsgrnt@icloud.com`
  }
}

const getNearbyItemList = (nearby: any) => {
  return nearby?.map((n: any) => (
    <div key={n.place.id}>{getNearbyItem(n.place)}</div>
  ))
}

function NearbyView(props: Props): JSX.Element {
  const { fetchNearby, nearby, nearbyViewCoords } = props
  const map = useMap().current
  const intl = useIntl()
  const [loading, setLoading] = useState(true)
  const firstItemRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    firstItemRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (nearbyViewCoords) {
      fetchNearby(nearbyViewCoords, map)
      setLoading(true)
      const interval = setInterval(() => {
        fetchNearby(nearbyViewCoords, map)
        setLoading(true)
      }, 15000)
      return function cleanup() {
        clearInterval(interval)
      }
    }
  }, [nearbyViewCoords])

  useEffect(() => {
    setLoading(false)
  }, [nearby])

  // TODO: when coordinates are set, put a marker on the map and zoom there

  return (
    <Scrollable className="nearby-view base-color-bg">
      <NearbySidebarContainer className="base-color-bg">
        <div ref={firstItemRef} />
        {loading && (
          <FloatingLoadingIndicator>
            <Loading extraSmall />
          </FloatingLoadingIndicator>
        )}
        {nearby &&
          (nearby.error
            ? intl.formatMessage({ id: 'components.NearbyView.error' })
            : getNearbyItemList(nearby))}
      </NearbySidebarContainer>
    </Scrollable>
  )
}

const mapStateToProps = (state: any) => {
  const { config, transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  return {
    homeTimezone: config.homeTimezone,
    nearby,
    nearbyViewCoords
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
