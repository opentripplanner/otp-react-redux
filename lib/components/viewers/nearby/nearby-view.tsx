import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Location } from '@opentripplanner/types'
import { LonLatInput } from '@conveyal/lonlat'
import { MapRef, useMap } from 'react-map-gl'
import { Search } from '@styled-icons/fa-solid/Search'
import coreUtils from '@opentripplanner/core-utils'
import getGeocoder from '@opentripplanner/geocoder'
import LocationField from '@opentripplanner/location-field'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as locationActions from '../../../actions/location'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { GeocoderConfig } from '../../../util/config-types'
import { getCurrentServiceWeek } from '../../../util/current-service-week'
import {
  PatternStopTime,
  SetLocationHandler,
  ZoomToPlaceHandler
} from '../../util/types'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import Loading from '../../narrative/loading'
import MobileContainer from '../../mobile/container'
import MobileNavigationBar from '../../mobile/navigation-bar'
import PageTitle from '../../util/page-title'
import VehiclePositionRetriever from '../vehicle-position-retriever'

import { NearbySidebarContainer, Scrollable } from './styled'
import FromToPicker from './from-to-picker'
import RentalStation from './rental-station'
import Stop, { fullTimestamp, patternArrayforStops } from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

const AUTO_REFRESH_INTERVAL = 15000000

// TODO: use lonlat package
type LatLonObj = { lat: number; lon: number }
type CurrentPosition = { coords?: { latitude: number; longitude: number } }
type ServiceWeek = { end: string; start: string }

type Props = {
  currentPosition?: CurrentPosition
  currentServiceWeek?: ServiceWeek
  defaultLatLon: LatLonObj | null
  displayedCoords?: LatLonObj
  entityId?: string
  fetchNearby: (
    latLon: LatLonObj,
    radius?: number,
    currentServiceWeek?: ServiceWeek
  ) => void
  geocoderConfig: GeocoderConfig
  getCurrentPosition: any // TODO
  hideBackButton?: boolean
  hideEmptyStops?: boolean
  location: string
  mobile?: boolean
  // Todo: type nearby results
  nearby: any
  nearbyViewCoords?: LatLonObj
  radius?: number
  routeSortComparator: (a: PatternStopTime, b: PatternStopTime) => number
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

function getNearbyCoordsFromUrlOrLocationOrMapCenter(
  coordsFromUrl?: LatLonObj,
  currentPosition?: CurrentPosition,
  map?: MapRef,
  defaultLatLon?: LatLonObj | null
): LatLonObj | null {
  if (coordsFromUrl) {
    return coordsFromUrl
  }

  if (currentPosition?.coords) {
    const { latitude: lat, longitude: lon } = currentPosition.coords
    return { lat, lon }
  }

  const rawMapCoords = map?.getCenter()
  const mapCoords = rawMapCoords !== undefined && {
    lat: rawMapCoords.lat,
    lon: rawMapCoords.lng
  }
  if (mapCoords) {
    return mapCoords
  }
  if (defaultLatLon) {
    return defaultLatLon
  }
  return null
}

function NearbyView({
  currentPosition,
  currentServiceWeek,
  defaultLatLon,
  displayedCoords,
  entityId,
  fetchNearby,
  geocoderConfig,
  getCurrentPosition,
  hideEmptyStops,
  location,
  mobile,
  nearby,
  nearbyViewCoords,
  radius,
  routeSortComparator,
  setHighlightedLocation,
  setMainPanelContent,
  setViewedNearbyCoords,
  zoomToPlace
}: Props): JSX.Element {
  const map = useMap().default
  const intl = useIntl()
  const [loading, setLoading] = useState(true)
  const [reversedPoint, setReversedPoint] = useState('')
  const firstItemRef = useRef<HTMLDivElement>(null)
  const finalNearbyCoords = useMemo(
    () =>
      getNearbyCoordsFromUrlOrLocationOrMapCenter(
        nearbyViewCoords,
        currentPosition,
        map,
        defaultLatLon
      ),
    [nearbyViewCoords, currentPosition, map]
  )

  const reverseCoords = (coords: LonLatInput) => {
    getGeocoder(geocoderConfig)
      .reverse({ point: coords })
      .then((result: Location) => setReversedPoint(result?.name || ''))
  }

  // Make sure the highlighted location is cleaned up when leaving nearby
  useEffect(() => {
    return function cleanup() {
      setHighlightedLocation(null)
    }
  }, [location, setHighlightedLocation])

  useEffect(() => {
    const moveListener = (e: mapboxgl.EventData) => {
      if (e.geolocateSource) {
        const coords = {
          lat: e.viewState.latitude,
          lon: e.viewState.longitude
        }
        setViewedNearbyCoords(coords)
        reverseCoords(coords)
      }
    }

    const dragListener = (e: mapboxgl.EventData) => {
      const coords = {
        lat: e.viewState.latitude,
        lon: e.viewState.longitude
      }
      setViewedNearbyCoords(coords)
      reverseCoords(coords)

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
    window.scrollTo({
      behavior: 'smooth',
      left: 0,
      top: 0
    })
    if (finalNearbyCoords) {
      fetchNearby(finalNearbyCoords, radius, currentServiceWeek)
      setLoading(true)
      const interval = setInterval(() => {
        fetchNearby(finalNearbyCoords, radius, currentServiceWeek)
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

  // Build list of nearby routes for filtering within the stop card
  const nearbyRoutes = Array.from(
    new Set(
      nearby
        ?.map((n: any) =>
          n.place?.stopRoutes?.map((sr: { gtfsId?: string }) => sr?.gtfsId)
        )
        .flat(Infinity)
    )
  )

  // If configured, filter out stops that don't have any patterns
  const filteredNearby = nearby?.filter((n: any) => {
    if (n.place.__typename === 'Stop' && hideEmptyStops) {
      const patternArray = patternArrayforStops(n.place, routeSortComparator)
      return !(patternArray?.length === 0)
    }
    return true
  })

  const nearbyItemList =
    filteredNearby?.map &&
    filteredNearby?.map((n: any) => (
      <li
        className={
          (n.place.gtfsId ?? n.place.id) === entityId ? 'highlighted' : ''
        }
        key={n.place.id}
      >
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          className="nearby-view-card"
          onBlur={onMouseLeave}
          onFocus={() => onMouseEnter(n.place)}
          onMouseEnter={() => onMouseEnter(n.place)}
          onMouseLeave={onMouseLeave}
          /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
          tabIndex={0}
        >
          {getNearbyItem({ ...n.place, distance: n.distance, nearbyRoutes })}
        </div>
      </li>
    ))

  useEffect(() => {
    if (!staleData) {
      setLoading(false)
    } else if (staleData) {
      // If there's stale data, fetch again
      setLoading(true)
      finalNearbyCoords &&
        fetchNearby(finalNearbyCoords, radius, currentServiceWeek)
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
        <InvisibleA11yLabel as="h3" style={{ position: 'absolute' }}>
          <FormattedMessage
            id="components.NearbyView.nearbyListIntro"
            values={{ count: nearby.length }}
          />
        </InvisibleA11yLabel>
      )}
      <NearbySidebarContainer
        className="base-color-bg"
        style={{ marginBottom: 0 }}
      >
        {/* This is used to scroll to top */}
        <div aria-hidden ref={firstItemRef} />
        <LocationField
          className="nearby-view-location-field"
          // TODO: why does this cause the jump to the trip planner when selecting location
          currentPosition={currentPosition}
          geocoderConfig={geocoderConfig}
          getCurrentPosition={getCurrentPosition}
          inputPlaceholder={intl.formatMessage({
            id: 'components.NearbyView.searchNearby'
          })}
          location={{
            // Provide a 0 default in case the nearby view coords are null
            lat: 0,
            lon: 0,
            ...nearbyViewCoords,
            name: reversedPoint
          }}
          LocationIconComponent={() => (
            <Search style={{ marginRight: 5, padding: 5 }} />
          )}
          locationType="to"
          onLocationSelected={(selection) => {
            const { location } = selection
            setViewedNearbyCoords(location)
            map && zoomToPlace(map, location)

            setReversedPoint(location.name || '')
            if (!location.name) {
              reverseCoords([location.lon, location.lat])
            }
          }}
          sortByDistance
        />
        {loading && <Loading extraSmall />}
        {nearby &&
          !staleData &&
          (nearby.error ? (
            intl.formatMessage({ id: 'components.NearbyView.error' })
          ) : filteredNearby?.length > 0 ? (
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
  const { map, nearbyView: nearbyViewConfig, routeViewer } = config
  const transitOperators = config?.transitOperators || []
  const { nearbyViewCoords } = ui
  const { nearby } = transitIndex
  const { entityId } = state.router.location.query
  const { currentPosition } = location
  const defaultLatLon =
    map?.initLat && map?.initLon ? { lat: map.initLat, lon: map.initLon } : null

  const currentServiceWeek =
    routeViewer?.onlyShowCurrentServiceWeek === true
      ? getCurrentServiceWeek()
      : undefined

  // TODO: Refine so we don't have this same thing in stops.tsx
  // Default sort: departure time
  let routeSortComparator = (a: PatternStopTime, b: PatternStopTime) =>
    fullTimestamp(a.stoptimes?.[0]) - fullTimestamp(b.stoptimes?.[0])

  if (nearbyViewConfig?.useRouteViewSort) {
    routeSortComparator = (a: PatternStopTime, b: PatternStopTime) =>
      coreUtils.route.makeRouteComparator(transitOperators)(
        // @ts-expect-error core-utils types are wrong!
        a.pattern.route,
        b.pattern.route
      )
  }

  return {
    currentPosition,
    currentServiceWeek,
    defaultLatLon,
    displayedCoords: nearby?.coords,
    entityId: entityId && decodeURIComponent(entityId),
    geocoderConfig: config.geocoder,
    hideEmptyStops: config.nearbyView?.hideEmptyStops,
    homeTimezone: config.homeTimezone,
    location: state.router.location.hash,
    nearby: nearby?.data,
    nearbyViewCoords,
    radius: config.nearbyView?.radius,
    routeSortComparator
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
