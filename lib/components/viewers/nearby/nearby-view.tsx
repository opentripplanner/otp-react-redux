import { connect } from 'react-redux'
import { FormattedMessage, IntlShape, useIntl } from 'react-intl'
import { Location, Stop as StopType } from '@opentripplanner/types'
import { MapRef, useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback, useEffect, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as locationActions from '../../../actions/location'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { SetLocationHandler } from '../../util/types'
import Loading from '../../narrative/loading'
import MobileContainer from '../../mobile/container'
import MobileNavigationBar from '../../mobile/navigation-bar'
import PageTitle from '../../util/page-title'

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
  entityId?: string
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  getCurrentPosition: (
    intl: IntlShape,
    setAsType?: string | null,
    onSuccess?: (position: GeolocationPosition) => void
  ) => void
  hideBackButton?: boolean
  mobile?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
  setHighlightedLocation: (location: Location | null) => void
  setLocation: SetLocationHandler
  setMainPanelContent: (content: number) => void
  setViewedNearbyCoords: (location: Location | null) => void
  zoomToPlace: (map: MapRef, stopData: Location) => void
}

const FromToPicker = ({
  setLocation,
  stopData
}: {
  setLocation: SetLocationHandler
  stopData: StopType
}) => {
  const location = {
    lat: stopData.lat ?? 0,
    lon: stopData.lon ?? 0,
    name: stopData.name
  }
  return (
    <span role="group">
      <FromToLocationPicker
        label
        onFromClick={() => {
          setLocation({ location, locationType: 'from', reverseGeocode: false })
        }}
        onToClick={() => {
          setLocation({ location, locationType: 'to', reverseGeocode: false })
        }}
      />
    </span>
  )
}

const getNearbyItem = (place: any, setLocation: SetLocationHandler) => {
  const fromTo = <FromToPicker setLocation={setLocation} stopData={place} />

  switch (place.__typename) {
    case 'RentalVehicle':
      return <Vehicle fromToSlot={fromTo} vehicle={place} />
    case 'Stop':
      return <Stop fromToSlot={fromTo} showOperatorLogo stopData={place} />
    case 'VehicleParking':
      return <VehicleParking fromToSlot={fromTo} place={place} />
    case 'BikeRentalStation':
      return <RentalStation fromToSlot={fromTo} place={place} />
    default:
      console.warn(
        `Received unsupported nearby place type: ${place.__typename} `
      )
      return null
  }
}

function NearbyView({
  entityId,
  fetchNearby,
  getCurrentPosition: getPosition,
  mobile,
  nearby,
  nearbyViewCoords,
  setHighlightedLocation,
  setLocation,
  setMainPanelContent,
  setViewedNearbyCoords,
  zoomToPlace
}: Props): JSX.Element {
  const map = useMap().default
  const intl = useIntl()
  const [loading, setLoading] = useState(true)
  const firstItemRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    firstItemRef.current?.scrollIntoView({ behavior: 'smooth' })
    if (nearbyViewCoords) {
      fetchNearby(nearbyViewCoords)
      setLoading(true)
      const interval = setInterval(() => {
        fetchNearby(nearbyViewCoords)
        setLoading(true)
      }, AUTO_REFRESH_INTERVAL)
      return function cleanup() {
        clearInterval(interval)
      }
    } else {
      const rawMapCoords = map?.getCenter()
      const mapCoords = rawMapCoords !== undefined && {
        lat: rawMapCoords.lat,
        lon: rawMapCoords.lng
      }
      if (mapCoords) {
        fetchNearby(mapCoords)
        setLoading(true)
        const interval = setInterval(() => {
          fetchNearby(mapCoords)
          setLoading(true)
        }, AUTO_REFRESH_INTERVAL)
        return function cleanup() {
          clearInterval(interval)
        }
      }
      getPosition(intl, null, (pos) => {
        // Navigate to nearby at current location (puts coords in URL)
        setViewedNearbyCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude
        })
      })
    }
  }, [nearbyViewCoords, map])

  const onMouseEnter = useCallback(
    (location: Location) => {
      setHighlightedLocation(location)
      map && zoomToPlace(map, location)
    },
    [setHighlightedLocation, map, zoomToPlace]
  )
  const onMouseLeave = useCallback(() => {
    setHighlightedLocation(null)
  }, [setHighlightedLocation])

  const nearbyItemList = nearby?.map((n: any) => (
    <li
      className={
        (n.place.gtfsId ?? n.place.id) === entityId ? 'highlighted' : ''
      }
      key={n.place.id}
    >
      <div
        onBlur={onMouseLeave}
        onFocus={() => onMouseEnter(n.place)}
        onMouseEnter={() => onMouseEnter(n.place)}
        onMouseLeave={onMouseLeave}
        role="button"
        tabIndex={0}
      >
        {getNearbyItem(n.place, setLocation)}
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
      {nearby && (
        <h3 style={{ opacity: 0, position: 'absolute' }}>
          <FormattedMessage
            id="components.NearbyView.nearbyListIntro"
            values={{ count: nearby.length }}
          />
        </h3>
      )}
      <NearbySidebarContainer
        className="base-color-bg"
        style={{ marginTop: mobile ? '50px' : 0 }}
      >
        {/* This is used to scroll to top */}
        <div aria-hidden ref={firstItemRef} />
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
      <PageTitle
        title={intl.formatMessage({ id: 'components.NearbyView.header' })}
      />
    </MainContainer>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { config, transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  const { entityId } = state.router.location.query
  return {
    entityId,
    homeTimezone: config.homeTimezone,
    nearby,
    nearbyViewCoords
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby,
  getCurrentPosition: locationActions.getCurrentPosition,
  setHighlightedLocation: uiActions.setHighlightedLocation,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  setViewedNearbyCoords: uiActions.setViewedNearbyCoords,
  viewNearby: uiActions.viewNearby,
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
