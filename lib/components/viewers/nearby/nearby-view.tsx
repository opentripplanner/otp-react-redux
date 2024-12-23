import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Location } from '@opentripplanner/types'
import { MapRef, useMap } from 'react-map-gl'
import coreUtils from '@opentripplanner/core-utils'
import React, { useCallback, useEffect, useMemo, useState } from 'react'

import * as apiActions from '../../../actions/api'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { getCurrentServiceWeek } from '../../../util/current-service-week'
import { NearbyViewConfig } from '../../../util/config-types'
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

import {
  FloatingLoadingIndicator,
  NearbySidebarContainer,
  Scrollable
} from './styled'
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
  hideBackButton?: boolean
  location: string
  mobile?: boolean
  // Todo: type nearby results
  nearby: any
  nearbyViewConfig?: NearbyViewConfig
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

const groupScootersByNetwork = (nearby: any[]) => {
  return nearby.reduce<Record<string, { count: number; nearest: any }>>(
    (acc, item) => {
      if (item.place.__typename === 'RentalVehicle') {
        const network = item.place.network
        if (!acc[network]) {
          acc[network] = {
            count: 1,
            nearest: item
          }
        } else {
          acc[network].count++
        }
      }
      return acc
    },
    {}
  )
}

function NearbyView({
  currentPosition,
  currentServiceWeek,
  defaultLatLon,
  displayedCoords,
  entityId,
  fetchNearby,
  location,
  mobile,
  nearby,
  nearbyViewConfig,
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
    if (n.place.__typename === 'Stop' && nearbyViewConfig?.hideEmptyStops) {
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
  nearby?.map &&
    (() => {
      const scooterGroups = groupScootersByNetwork(nearby)

      return nearby.map((n: any) => {
        // Skip additional scooters from the same network
        if (n.place.__typename === 'RentalVehicle') {
          const group = scooterGroups[n.place.network]
          console.log(n, scooterGroups, n.id, group.nearest.id)
          n.place.additionalCount = group.count - 1
          // Only show the nearest scooter for each network
          if (n.id !== group.nearest.id) return null
        }

        return (
          <li
            className={
              (n.place.gtfsId ?? n.place.id) === entityId ? 'highlighted' : ''
            }
            key={n.place.id}
          >
            <div
              className="nearby-view-card"
              onBlur={onMouseLeave}
              onFocus={() => onMouseEnter(n.place)}
              onMouseEnter={() => onMouseEnter(n.place)}
              onMouseLeave={onMouseLeave}
              role="button"
              tabIndex={0}
            >
              {getNearbyItem({
                ...n.place,
                distance: n.distance,
                nearbyRoutes
              })}
            </div>
          </li>
        )
      })
    })()

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
        {loading && (
          <FloatingLoadingIndicator>
            <Loading extraSmall />
          </FloatingLoadingIndicator>
        )}
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
    homeTimezone: config.homeTimezone,
    location: state.router.location.hash,
    nearby: nearby?.data,
    nearbyViewConfig,
    nearbyViewCoords,
    radius: config.nearbyView?.radius,
    routeSortComparator
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
