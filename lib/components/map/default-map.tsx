/* eslint-disable react/prop-types */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { connect } from 'react-redux'
import { GeolocateControl, NavigationControl } from 'react-map-gl'
import { injectIntl } from 'react-intl'
import BaseMap from '@opentripplanner/base-map'
import generateOTP2TileLayers from '@opentripplanner/otp2-tile-overlay'
import React, { Component } from 'react'
import styled from 'styled-components'

import {
  assembleBasePath,
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
} from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { MainPanelContent } from '../../actions/ui-constants'
import { setLocation, setMapPopupLocationAndGeocode } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'
import { updateOverlayVisibility } from '../../actions/config'

import ElevationPointMarker from './elevation-point-marker'
import EndpointsOverlay from './connected-endpoints-overlay'
import GeoJsonLayer from './connected-geojson-layer'
import ItinSummaryOverlay from './itinerary-summary-overlay'
import NearbyViewDotOverlay from './nearby-view-dot-overlay'
import ParkAndRideOverlay from './connected-park-and-ride-overlay'
import PointPopup from './point-popup'
import RoutePreviewOverlay from './route-preview-overlay'
import RouteViewerOverlay from './connected-route-viewer-overlay'
import StopsOverlay from './connected-stops-overlay'
import TransitiveOverlay from './connected-transitive-overlay'
import TransitVehicleOverlay from './connected-transit-vehicle-overlay'
import TripViewerOverlay from './connected-trip-viewer-overlay'
import VehicleRentalOverlay from './connected-vehicle-rental-overlay'
import withMap from './with-map'

const MapContainer = styled.div`
  height: 100%;
  width: 100%;

  .map {
    height: 100%;
    width: 100%;
  }

  * {
    box-sizing: unset;
  }

  .maplibregl-popup-content,
  .mapboxgl-popup-content {
    border-radius: 10px;
    box-shadow: 0 3px 14px 4px rgb(0 0 0 / 20%);
  }
`
/**
 * Get the configured display names for the specified company ids.
 */
function getCompanyNames(companyIds, config, intl) {
  return intl.formatList(
    (companyIds || []).map(
      (id) =>
        config.companies?.find((company) => company.id === id)?.label || id
    ),
    { type: 'conjunction' }
  )
}

/**
 * Determines the localized name of a map layer by its type.
 */
function getLayerName(overlay, config, intl) {
  const { companies, name, type } = overlay

  // HACK: Support for street/satellite configs that use the name.
  switch (name) {
    case 'Streets':
      return intl.formatMessage({ id: 'components.MapLayers.streets' })
    case 'Satellite':
      return intl.formatMessage({ id: 'components.MapLayers.satellite' })
    default:
      if (name) return name
  }

  // If overlay.name is not specified, use the type to determine the name.
  switch (type) {
    case 'streets':
      return intl.formatMessage({ id: 'components.MapLayers.streets' })
    case 'satellite':
      return intl.formatMessage({ id: 'components.MapLayers.satellite' })
    case 'bike-rental':
    case 'otp2-bike-rental':
    case 'rentalStations':
      return intl.formatMessage(
        { id: 'components.MapLayers.bike-rental' },
        {
          companies: getCompanyNames(companies, config, intl)
        }
      )
    case 'car-rental':
      return intl.formatMessage({ id: 'components.MapLayers.car-rental' })
    case 'micromobility-rental':
    case 'otp2-micromobility-rental':
      return intl.formatMessage(
        {
          id: 'components.MapLayers.micromobility-rental'
        },
        {
          companies: getCompanyNames(companies, config, intl)
        }
      )
    case 'park-and-ride':
      return intl.formatMessage({ id: 'components.MapLayers.park-and-ride' })
    case 'stops':
      return intl.formatMessage({ id: 'components.MapLayers.stops' })
    case 'rentalVehicles':
      if (overlay.network)
        return getCompanyNames([overlay.network], config, intl)

      return intl.formatMessage({ id: 'components.MapLayers.shared-vehicles' })
    case 'otp2':
      // The otp2 type will result in multiple layers, so don't show a warning.
      return type
    default:
      console.warn(`No name found for overlay type ${type}.`)
      return type
  }
}

class DefaultMap extends Component {
  static contextType = ComponentContext

  constructor(props) {
    super(props)
    // We have to maintain the map state because the underlying map also (incorrectly?) uses a state.
    // Not maintaining a state causes re-renders to the map's configured coordinates.
    const {
      initLat: lat = null,
      initLon: lon = null,
      initZoom: zoom = 13
    } = props.mapConfig || {}
    this.state = {
      lat,
      lon,
      zoom
    }
  }

  /**
   * Checks whether the modes have changed between old and new queries and
   * whether to update the map overlays accordingly (e.g., to show rental vehicle
   * options on the map).
   *
   * Note: This functionality only works for the tabbed interface,
   * as that UI mode sets the access mode and company in the query params.
   * TODO: Implement for the batch interface.
   */
  _handleQueryChange = (oldQuery, newQuery) => {
    const { overlays = [] } = this.props.mapConfig || {}
    if (oldQuery.mode) {
      // Determine any added/removed modes
      const oldModes = oldQuery.mode.split(',')
      const newModes = newQuery.mode.split(',')
      const removed = oldModes.filter((m) => !newModes.includes(m))
      const added = newModes.filter((m) => !oldModes.includes(m))
      const overlayVisibility = []
      for (const oConfig of overlays) {
        if (!oConfig.modes || oConfig.modes.length !== 1) continue
        // TODO: support multi-mode overlays
        const overlayMode = oConfig.modes[0]

        if (
          (overlayMode === 'CAR_RENT' ||
            overlayMode === 'CAR_HAIL' ||
            overlayMode === 'MICROMOBILITY_RENT' ||
            overlayMode === 'SCOOTER') &&
          oConfig.companies
        ) {
          // Special handling for company-based mode overlays (e.g. carshare, car-hail)
          const overlayCompany = oConfig.companies[0] // TODO: handle multi-company overlays
          if (added.includes(overlayMode)) {
            // Company-based mode was just selected; enable overlay iff overlay's company is active
            if (newQuery.companies?.includes(overlayCompany)) {
              overlayVisibility.push({
                overlay: oConfig,
                visible: true
              })
            }
          } else if (removed.includes(overlayMode)) {
            // Company-based mode was just deselected; disable overlay (regardless of company)
            overlayVisibility.push({
              overlay: oConfig,
              visible: false
            })
          } else if (
            newModes.includes(overlayMode) &&
            oldQuery.companies !== newQuery.companies
          ) {
            // Company-based mode remains selected but companies change
            overlayVisibility.push({
              overlay: oConfig,
              visible: newQuery.companies.includes(overlayCompany)
            })
          }
        } else {
          // Default handling for other modes
          if (added.includes(overlayMode)) {
            overlayVisibility.push({
              overlay: oConfig,
              visible: true
            })
          }
          if (removed.includes(overlayMode)) {
            overlayVisibility.push({
              overlay: oConfig,
              visible: false
            })
          }
        }
      }

      // Only trigger update action if there are overlays to update.
      if (overlayVisibility.length > 0) {
        this.props.updateOverlayVisibility(overlayVisibility)
      }
    }
  }

  onMapClick = (e) => {
    this.props.setMapPopupLocationAndGeocode(e)
  }

  componentDidMount() {
    // HACK: Set state lat and lon to null to prevent re-rendering of the
    // underlying OTP-UI map.
    this.setState({
      lat: null,
      lon: null
    })
  }

  componentDidUpdate(prevProps) {
    // Check if any overlays should be toggled due to mode change
    this._handleQueryChange(prevProps.query, this.props.query)
  }

  render() {
    const {
      bikeRentalQuery,
      bikeRentalStations,
      carRentalQuery,
      carRentalStations,
      config,
      intl,
      itinerary,
      mapConfig,
      nearbyViewActive,
      pending,
      setLocation,
      setViewedStop,
      vehicleRentalQuery,
      vehicleRentalStations
    } = this.props
    const { getCustomMapOverlays, getTransitiveRouteLabel, ModeIcon } =
      this.context
    const { baseLayers, maxZoom, overlays } = mapConfig || {}
    const { lat, lon, zoom } = this.state
    const vectorTilesEndpoint = `${assembleBasePath(config)}${
      config.api?.path
    }/vectorTiles`

    const bikeStations = [
      ...bikeRentalStations.filter(
        (station) =>
          !station.isFloatingVehicle || station.isFloatingVehicle === false
      ),
      ...vehicleRentalStations.filter(
        (station) => station.isFloatingBike === true
      )
    ]
    const scooterStations = vehicleRentalStations.filter(
      (station) => station.isFloatingBike === false && station.isFloatingVehicle
    )

    const baseLayersWithNames = baseLayers?.map((baseLayer) => ({
      ...baseLayer,
      name: getLayerName(baseLayer, config, intl)
    }))
    const baseLayerUrls = baseLayersWithNames?.map((bl) => bl.url)
    const baseLayerNames = baseLayersWithNames?.map((bl) => bl.name)

    return (
      <MapContainer className="percy-hide">
        <BaseMap
          baseLayer={
            baseLayerUrls?.length > 1 ? baseLayerUrls : baseLayerUrls?.[0]
          }
          baseLayerNames={baseLayerNames}
          center={[lat, lon]}
          mapLibreProps={{ reuseMaps: true }}
          maxZoom={maxZoom}
          // In Leaflet, this was an onclick handler. Creating a click handler in
          // MapLibreGL would require writing a custom event handler for all mouse events
          onContextMenu={this.onMapClick}
          showEverything={nearbyViewActive}
          zoom={zoom}
        >
          <PointPopup />
          <NearbyViewDotOverlay />
          <ItinSummaryOverlay />
          <RoutePreviewOverlay />
          {/* The default overlays */}
          <EndpointsOverlay />
          <RouteViewerOverlay />
          <TransitVehicleOverlay ModeIcon={ModeIcon} />
          <GeolocateControl position="top-left" />
          <TransitiveOverlay
            getTransitiveRouteLabel={getTransitiveRouteLabel}
          />
          <TripViewerOverlay />
          <ElevationPointMarker />

          {/* The configurable overlays */}
          {overlays?.map((overlayConfig, k) => {
            const namedLayerProps = {
              ...overlayConfig,
              id: k,
              key: k,
              name: getLayerName(overlayConfig, config, intl)
            }
            switch (overlayConfig.type) {
              case 'geojson':
                return (
                  <GeoJsonLayer {...namedLayerProps} url={overlayConfig.url} />
                )
              case 'bike-rental':
                return (
                  <VehicleRentalOverlay
                    {...namedLayerProps}
                    refreshVehicles={bikeRentalQuery}
                    stations={bikeRentalStations}
                  />
                )
              case 'car-rental':
                return (
                  <VehicleRentalOverlay
                    {...namedLayerProps}
                    refreshVehicles={carRentalQuery}
                    stations={carRentalStations}
                  />
                )
              case 'park-and-ride':
                return <ParkAndRideOverlay {...namedLayerProps} />
              case 'stops':
                return <StopsOverlay {...namedLayerProps} />
              case 'micromobility-rental':
                return (
                  <VehicleRentalOverlay
                    {...namedLayerProps}
                    refreshVehicles={vehicleRentalQuery}
                    stations={vehicleRentalStations}
                  />
                )
              case 'otp2-micromobility-rental':
                return (
                  <VehicleRentalOverlay
                    key={k}
                    {...namedLayerProps}
                    refreshVehicles={vehicleRentalQuery}
                    stations={scooterStations}
                  />
                )
              case 'otp2-bike-rental':
                return (
                  <VehicleRentalOverlay
                    key={k}
                    {...namedLayerProps}
                    refreshVehicles={bikeRentalQuery}
                    stations={bikeStations}
                  />
                )
              case 'otp2':
                // This must be a method that returns an array of JSX
                // as the base-map requires that every toggleable layer
                // is its own component, and not a subcomponent of another component
                return generateOTP2TileLayers(
                  overlayConfig.layers.map((l) => ({
                    ...l,
                    name: getLayerName(l, config, intl) || l.network || l.type
                  })),
                  vectorTilesEndpoint,
                  setLocation,
                  setViewedStop,
                  config.companies
                )
              default:
                return null
            }
          })}
          {/* If set, custom overlays are shown if no active itinerary is shown or pending. */}
          {typeof getCustomMapOverlays === 'function' &&
            getCustomMapOverlays(!itinerary && !pending)}
          <NavigationControl position="bottom-right" />
        </BaseMap>
      </MapContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)

  return {
    bikeRentalStations: state.otp.overlay.bikeRental.stations,
    carRentalStations: state.otp.overlay.carRental.stations,
    config: state.otp.config,
    itinerary: getActiveItinerary(state),
    mapConfig: state.otp.config.map,
    nearbyViewActive:
      state.otp.ui.mainPanelContent === MainPanelContent.NEARBY_VIEW,
    pending: activeSearch ? Boolean(activeSearch.pending) : false,
    query: state.otp.currentQuery,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  }
}

const mapDispatchToProps = {
  bikeRentalQuery,
  carRentalQuery,
  setLocation,
  setMapPopupLocationAndGeocode,
  setViewedStop,
  updateOverlayVisibility,
  vehicleRentalQuery
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(withMap(DefaultMap)))
