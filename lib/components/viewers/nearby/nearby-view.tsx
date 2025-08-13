/* eslint-disable complexity */
import { connect } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { Location } from '@opentripplanner/types'
import { LonLatInput } from '@conveyal/lonlat'
import { MapRef, useMap, ViewStateChangeEvent } from 'react-map-gl/maplibre'
import { Search } from '@styled-icons/fa-solid/Search'
import { throttle } from '@tanstack/pacer'
import coreUtils from '@opentripplanner/core-utils'
import getGeocoder from '@opentripplanner/geocoder'
import LocationField from '@opentripplanner/location-field'
import React, {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState
} from 'react'

import * as apiActions from '../../../actions/api'
import * as locationActions from '../../../actions/location'
import * as mapActions from '../../../actions/map'
import * as uiActions from '../../../actions/ui'
import {
  AppReduxState,
  LatLonObj,
  NearbyFilterKey,
  NearbyFilters
} from '../../../util/state-types'
import { GeocoderConfig, NearbyFilterConfig } from '../../../util/config-types'
import { getCurrentServiceWeek } from '../../../util/current-service-week'
import { IconMessageContainer } from '../../narrative/metro/metro-error-renderer'
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

import { FilterCheckboxes } from './nearby-filter'
import { FullHeightContainer, NearbySidebarContainer } from './styled'
import FromToPicker from './from-to-picker'
import RentalStation from './rental-station'
import Stop, { fullTimestamp, patternArrayforStops } from './stop'
import Vehicle from './vehicle-rent'
import VehicleParking from './vehicle-parking'

const AUTO_REFRESH_INTERVAL = 15000000

// TODO: use lonlat package
type CurrentPosition = { coords?: { latitude: number; longitude: number } }
type ServiceWeek = { end: string; start: string }

type Props = {
  activeNearbyFilters: NearbyFilters
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
  nearbyFilters?: Array<NearbyFilterConfig>
  nearbyViewCoords?: LatLonObj
  nearbyViewError?: any
  radius?: number
  routeSortComparator: (a: PatternStopTime, b: PatternStopTime) => number
  sessionSearches: any
  setHighlightedLocation: (location: Location | null) => void
  setLocation: SetLocationHandler
  setMainPanelContent: (content: number) => void
  setNearbyViewFilter: (arg: NearbyFilters) => void
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

// eslint-disable-next-line complexity
function NearbyView({
  activeNearbyFilters,
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
  nearbyFilters,
  nearbyViewCoords,
  nearbyViewError,
  radius,
  routeSortComparator,
  sessionSearches,
  setHighlightedLocation,
  setMainPanelContent,
  setNearbyViewFilter,
  setViewedNearbyCoords,
  zoomToPlace
}: Props): JSX.Element {
  const map = useMap().default
  const intl = useIntl()
  const [loading, setLoading] = useState(true)
  const [reversedPoint, setReversedPoint] = useState('')

  const nearbyContainerRef = useRef<HTMLOListElement>(null)
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

  const reverseCoords = async (coords: LonLatInput) => {
    try {
      const location = await getGeocoder(geocoderConfig).reverse({
        point: coords
      })
      setReversedPoint(location?.name || '')
    } catch (error) {
      console.error('Error reversing coordinates:', error)
    }
  }

  const scrollToTop = () => {
    nearbyContainerRef?.current?.scroll &&
      nearbyContainerRef?.current?.scroll({
        behavior: 'smooth',
        top: 0
      })
  }

  // Make sure the highlighted location is cleaned up when leaving nearby
  useEffect(() => {
    return function cleanup() {
      setHighlightedLocation(null)
    }
  }, [location, setHighlightedLocation])

  useEffect(() => {
    const moveListener = (e: ViewStateChangeEvent) => {
      // @ts-expect-error TODO: What is this condition supposed to capture?
      if (e.geolocateSource) {
        const coords = {
          lat: e.viewState.latitude,
          lon: e.viewState.longitude
        }
        setViewedNearbyCoords(coords)
        reverseCoords(coords)
      }
    }

    const dragListener = (e: ViewStateChangeEvent) => {
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

  const onFilterChange = (event: FormEvent) => {
    const { target } = event
    const { id } = target as HTMLInputElement
    setNearbyViewFilter({
      ...activeNearbyFilters,
      [id]: !activeNearbyFilters[id as NearbyFilterKey]
    })
    scrollToTop()
  }

  useEffect(() => {
    scrollToTop()
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

  useEffect(() => {
    if (nearbyViewError) {
      setLoading(false)
    }
  }, [nearbyViewError])

  const onMouseEnter = useCallback(
    (location: Location) => {
      setHighlightedLocation(location)
      map && location && zoomToPlace(map, location)
    },
    [setHighlightedLocation, map, zoomToPlace]
  )

  // onMouseLeave is throttled because of a bug on Firefox where
  // two mouseleave events are triggered when moving cursor quickly from one card to the next.
  const onMouseLeave = useCallback(
    throttle(
      (e) => {
        setHighlightedLocation(null)
      },
      { trailing: false, wait: 1000 }
    ),
    [setHighlightedLocation]
  )

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
      return (
        !(patternArray?.length === 0) &&
        activeNearbyFilters[n.place.__typename as NearbyFilterKey]
      )
    }
    return activeNearbyFilters[n.place.__typename as NearbyFilterKey]
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

  const MainContainer = mobile ? MobileContainer : FullHeightContainer

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
      <div style={{ padding: nearbyFilters ? '1em 1em .75em' : '1em' }}>
        <LocationField
          className="nearby-view-location-field"
          // TODO: why does this cause the jump to the trip planner when selecting location
          currentPosition={currentPosition}
          geocoderConfig={geocoderConfig}
          geocoderResultsOrder={geocoderConfig?.geocoderResultsOrder}
          getCurrentPosition={getCurrentPosition}
          inputPlaceholder={intl.formatMessage({
            id: 'components.NearbyView.searchNearby'
          })}
          layerColorMap={geocoderConfig?.resultsColors}
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
          sessionSearches={sessionSearches}
          sortByDistance
          suggestionCount={geocoderConfig?.resultsCount}
        />
        {nearbyFilters && (
          <div
            className="filter-container"
            style={{ display: 'flex', gap: '10px', marginTop: '10px' }}
          >
            {nearbyFilters.map((filter: NearbyFilterConfig) => {
              return (
                <FilterCheckboxes
                  filter={filter}
                  key={filter.cardType}
                  onChange={onFilterChange}
                  value={activeNearbyFilters[filter.cardType]}
                />
              )
            })}
          </div>
        )}
      </div>

      {loading && <Loading extraSmall />}
      {/* This is used to scroll to top */}
      <NearbySidebarContainer
        className="base-color-bg"
        filters={!!nearbyFilters}
        ref={nearbyContainerRef}
        style={{ marginBottom: 0 }}
      >
        {nearbyViewError && !loading && (
          <IconMessageContainer
            body={intl.formatMessage({ id: 'components.NearbyView.error' })}
            header={intl.formatMessage({
              id: 'components.NearbyView.errorHeader'
            })}
          />
        )}
        {nearby &&
          !staleData &&
          (nearby.error ? (
            intl.formatMessage({ id: 'components.NearbyView.error' })
          ) : filteredNearby?.length > 0 ? (
            nearbyItemList
          ) : (
            <IconMessageContainer
              body={intl.formatMessage({
                id: 'components.NearbyView.nothingNearby'
              })}
              header={intl.formatMessage({
                id: 'components.NearbyView.nothingNearbyHeader'
              })}
            />
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
  const { nearbyView, nearbyViewCoords } = ui
  const { nearby } = transitIndex
  const { entityId } = state.router.location.query
  const { currentPosition, sessionSearches } = location
  const filters = nearbyView.filters
  const nearbyFilters = nearbyViewConfig?.filters
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
    activeNearbyFilters: filters,
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
    nearbyFilters,
    nearbyViewCoords,
    nearbyViewError: nearby?.error,
    radius: config.nearbyView?.radius,
    routeSortComparator,
    sessionSearches
  }
}

const mapDispatchToProps = {
  fetchNearby: apiActions.fetchNearby,
  getCurrentPosition: locationActions.getCurrentPosition,
  setHighlightedLocation: uiActions.setHighlightedLocation,
  setLocation: mapActions.setLocation,
  setMainPanelContent: uiActions.setMainPanelContent,
  setNearbyViewFilter: uiActions.setNearbyViewFilter,
  setViewedNearbyCoords: uiActions.setViewedNearbyCoords,
  viewNearby: uiActions.viewNearby,
  zoomToPlace: mapActions.zoomToPlace
}

export default connect(mapStateToProps, mapDispatchToProps)(NearbyView)
