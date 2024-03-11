import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Location, Stop as StopType } from '@opentripplanner/types'
import { MapRef, useMap } from 'react-map-gl'
import FromToLocationPicker from '@opentripplanner/from-to-location-picker'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { SetLocationHandler } from '../../util/types'
import Loading from '../../narrative/loading'
import MobileContainer from '../../mobile/container'
import MobileNavigationBar from '../../mobile/navigation-bar'
import PageTitle from '../../util/page-title'
import VehiclePositionRetriever from '../vehicle-position-retriever'

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
  currentPosition?: { coords?: { latitude: number; longitude: number } }
  entityId?: string
  fetchNearby: (latLon: LatLonObj, map?: MapRef) => void
  hideBackButton?: boolean
  location: string
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
  const location = useMemo(
    () => ({
      lat: stopData.lat ?? 0,
      lon: stopData.lon ?? 0,
      name: stopData.name
    }),
    [stopData]
  )
  return (
    <span role="group">
      <FromToLocationPicker
        label
        onFromClick={useCallback(() => {
          setLocation({ location, locationType: 'from', reverseGeocode: false })
        }, [location, setLocation])}
        onToClick={useCallback(() => {
          setLocation({ location, locationType: 'to', reverseGeocode: false })
        }, [location, setLocation])}
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
  currentPosition,
  entityId,
  fetchNearby,
  location,
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

  const onClickSetLocation: SetLocationHandler = (payload) => {
    setMainPanelContent(0)
    setLocation(payload)
  }

  // Make sure the highlighted location is cleaned up when leaving nearby
  useEffect(() => {
    return function cleanup() {
      setHighlightedLocation(null)
    }
  }, [location, setHighlightedLocation])

  useEffect(() => {
    if (currentPosition?.coords) {
      const { latitude, longitude } = currentPosition.coords
      setViewedNearbyCoords({ lat: latitude, lon: longitude })
    }
  }, [currentPosition, setViewedNearbyCoords])

  useEffect(() => {
    if (typeof firstItemRef.current?.scrollIntoView === 'function') {
      firstItemRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    // If nearby view coords are provided, use those. Otherwise use the map center.
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
    }
  }, [nearbyViewCoords, map, fetchNearby])

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

  const nearbyItemList =
    nearby?.map &&
    nearby?.map((n: any) => (
      <li
        className={
          (n.place.gtfsId ?? n.place.id) === entityId ? 'highlighted' : ''
        }
        key={n.place.id}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          onBlur={onMouseLeave}
          onFocus={() => onMouseEnter(n.place)}
          onMouseEnter={() => onMouseEnter(n.place)}
          onMouseLeave={onMouseLeave}
          /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
          tabIndex={0}
        >
          {getNearbyItem(n.place, onClickSetLocation)}
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
      <PageTitle
        title={intl.formatMessage({ id: 'components.NearbyView.header' })}
      />
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
      <VehiclePositionRetriever />
    </MainContainer>
  )
}

const mapStateToProps = (state: AppReduxState) => {
  const { config, location, transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  const { entityId } = state.router.location.query
  const { currentPosition } = location
  return {
    currentPosition,
    entityId,
    homeTimezone: config.homeTimezone,
    location: state.router.location.hash,
    nearby,
    nearbyViewCoords
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby,
  setHighlightedLocation: uiActions.setHighlightedLocation,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  setViewedNearbyCoords: uiActions.setViewedNearbyCoords,
  viewNearby: uiActions.viewNearby,
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
