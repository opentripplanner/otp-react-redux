import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Location } from '@opentripplanner/types'
import { MapRef, useMap } from 'react-map-gl'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { SetLocationHandler, ZoomToPlaceHandler } from '../../util/types'
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
import FromToPicker from './from-to-picker'
import RentalStation from './rental-station'
import Stop from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

const AUTO_REFRESH_INTERVAL = 15000

// TODO: use lonlat package
type LatLonObj = { lat: number; lon: number }

type Props = {
  displayedCoords?: LatLonObj
  entityId?: string
  fetchNearby: (latLon: LatLonObj, radius?: number) => void
  hideBackButton?: boolean
  location: string
  mobile?: boolean
  nearby: any
  nearbyViewCoords?: LatLonObj
  radius?: number
  setHighlightedLocation: (location: Location | null) => void
  setLocation: SetLocationHandler
  setMainPanelContent: (content: number) => void
  setViewedNearbyCoords: (location: Location | null) => void
  zoomToPlace: ZoomToPlaceHandler
}

const getNearbyItem = (place: any) => {
  const fromTo = <FromToPicker place={place} />

  switch (place.__typename) {
    case 'RentalVehicle':
      return <Vehicle fromToSlot={fromTo} vehicle={place} />
    case 'Stop':
      return <Stop fromToSlot={fromTo} stopData={place} />
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

function getNearbyCoordsFromUrlOrMapCenter(
  coordsFromUrl?: LatLonObj,
  map?: MapRef
): LatLonObj | null {
  if (coordsFromUrl) {
    return coordsFromUrl
  }
  const rawMapCoords = map?.getCenter()
  const mapCoords = rawMapCoords !== undefined && {
    lat: rawMapCoords.lat,
    lon: rawMapCoords.lng
  }
  if (mapCoords) {
    return mapCoords
  }
  return null
}

function NearbyView({
  displayedCoords,
  entityId,
  fetchNearby,
  location,
  mobile,
  nearby,
  nearbyViewCoords,
  radius,
  setHighlightedLocation,
  setMainPanelContent,
  setViewedNearbyCoords,
  zoomToPlace
}: Props): JSX.Element {
  const map = useMap().default
  const intl = useIntl()
  const [loading, setLoading] = useState(true)
  const firstItemRef = useRef<HTMLDivElement>(null)
  const finalNearbyCoords = useMemo(
    () => getNearbyCoordsFromUrlOrMapCenter(nearbyViewCoords, map),
    [nearbyViewCoords, map]
  )

  // Make sure the highlighted location is cleaned up when leaving nearby
  useEffect(() => {
    return function cleanup() {
      setHighlightedLocation(null)
    }
  }, [location, setHighlightedLocation])

  useEffect(() => {
    const moveListener = (e: mapboxgl.EventData) => {
      if (e.geolocateSource) {
        setViewedNearbyCoords({
          lat: e.viewState.latitude,
          lon: e.viewState.longitude
        })
      }
    }

    const dragListener = (e: mapboxgl.EventData) => {
      const coords = {
        lat: e.viewState.latitude,
        lon: e.viewState.longitude
      }
      setViewedNearbyCoords(coords)

      // Briefly flash the highlight to alert the user that we've moved
      setHighlightedLocation(coords)
      setTimeout(() => {
        setHighlightedLocation(null)
      }, 500)
    }

    map?.on('dragend', dragListener)
    map?.on('moveend', moveListener)
    return function cleanup() {
      map?.off('dragend', dragListener)
      map?.off('moveend', moveListener)
    }
  }, [map, setViewedNearbyCoords, setHighlightedLocation])

  useEffect(() => {
    if (typeof firstItemRef.current?.scrollIntoView === 'function') {
      firstItemRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    if (finalNearbyCoords) {
      fetchNearby(finalNearbyCoords, radius)
      setLoading(true)
      const interval = setInterval(() => {
        fetchNearby(finalNearbyCoords, radius)
        setLoading(true)
      }, AUTO_REFRESH_INTERVAL)
      return function cleanup() {
        clearInterval(interval)
      }
    }
  }, [finalNearbyCoords, fetchNearby, radius])

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

  // Determine whether the data we have is stale based on whether the coords match the URL
  // Sometimes Redux could have data from a previous load of the nearby view
  const staleData =
    finalNearbyCoords?.lat !== displayedCoords?.lat ||
    finalNearbyCoords?.lon !== displayedCoords?.lon

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
          {getNearbyItem({ ...n.place, distance: n.distance })}
        </div>
      </li>
    ))

  useEffect(() => {
    if (!staleData) {
      setLoading(false)
    }
  }, [nearby, staleData])

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
          !staleData &&
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
  const { config, transitIndex, ui } = state.otp
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  const { entityId } = state.router.location.query
  return {
    displayedCoords: nearby?.coords,
    entityId: entityId && decodeURIComponent(entityId),
    homeTimezone: config.homeTimezone,
    location: state.router.location.hash,
    nearby: nearby?.data,
    nearbyViewCoords,
    radius: config.nearbyView?.radius
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
