import { connect } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { Location } from '@opentripplanner/types'
import { MapRef, useMap } from 'react-map-gl'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as locationActions from '../../../actions/location'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import Loading from '../../narrative/loading'
import MobileContainer from '../../mobile/container'
import MobileNavigationBar from '../../mobile/navigation-bar'

import {
  FloatingLoadingIndicator,
  NearbySidebarContainer,
  Scrollable
} from './styled'
import RentalStation from './rental-station'
import Stop from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

const AUTO_REFRESH_INTERVAL = 15000

type LatLonObj = { lat: number; lon: number }

type Props = {
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  getCurrentPosition?: (
    intl: IntlShape,
    setAsType?: string | null,
    onSuccess?: (position: GeolocationPosition) => void
  ) => void
  hideBackButton?: boolean
  mobile?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
  setHighlightedLocation: (location: Location | null) => void
  setMainPanelContent: (content: number) => void
  viewNearby?: (pos: LatLonObj) => void
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
      console.warn(
        `Received unsupported nearby place type: ${place.__typename} `
      )
      return null
  }
}

function NearbyView({
  fetchNearby,
  getCurrentPosition: getPosition,
  mobile,
  nearby,
  nearbyViewCoords,
  setHighlightedLocation,
  setMainPanelContent,
  viewNearby
}: Props): JSX.Element {
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
      }, AUTO_REFRESH_INTERVAL)
      return function cleanup() {
        clearInterval(interval)
      }
    } else {
      if (getPosition && viewNearby) {
        getPosition(intl, null, (pos) => {
          viewNearby({ lat: pos.coords.latitude, lon: pos.coords.longitude })
        })
      }
    }
  }, [nearbyViewCoords])

  const onMouseEnter = useCallback(
    (location: Location) => {
      setHighlightedLocation(location)
    },
    [setHighlightedLocation]
  )
  const onMouseLeave = useCallback(() => {
    setHighlightedLocation(null)
  }, [setHighlightedLocation])

  const nearbyItemList = nearby?.map((n: any) => (
    <li key={n.place.id}>
      <div
        onBlur={onMouseLeave}
        onFocus={() => onMouseEnter(n.place)}
        onMouseEnter={() => onMouseEnter(n.place)}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
      >
        {getNearbyItem(n.place)}
      </div>
    </li>
  ))
  useEffect(() => {
    setLoading(false)
  }, [nearby])

  const goBack = useCallback(
    () => setMainPanelContent(0),
    [setMainPanelContent]
  )

  const MainContainer = mobile ? MobileContainer : Scrollable

  return (
    <MainContainer className="nearby-view base-color-bg">
      {mobile && (
        <MobileNavigationBar
          headerText={intl.formatMessage({
            id: 'components.NearbyView.header'
          })}
          onBackClicked={goBack}
        />
      )}
      <NearbySidebarContainer
        className="base-color-bg"
        style={{ marginTop: mobile ? '50px' : 0 }}
      >
        <div ref={firstItemRef} />
        {loading && (
          <FloatingLoadingIndicator>
            <Loading extraSmall />
          </FloatingLoadingIndicator>
        )}
        {nearby &&
          (nearby.error ? (
            intl.formatMessage({ id: 'components.NearbyView.error' })
          ) : nearby.length > 0 ? (
            nearbyItemList
          ) : (
            <FormattedMessage id="components.NearbyView.nothingNearby" />
          ))}
      </NearbySidebarContainer>
    </MainContainer>
  )
}

const mapStateToProps = (state: AppReduxState) => {
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
  fetchNearby: apiActions.fetchNearby,
  getCurrentPosition: locationActions.getCurrentPosition,
  setHighlightedLocation: uiActions.setHighlightedLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  viewNearby: uiActions.viewNearby
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
