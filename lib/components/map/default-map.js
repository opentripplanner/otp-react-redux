/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import BaseMap from '@opentripplanner/base-map'
import React, { Component } from 'react'
import styled from 'styled-components'

import {
  bikeRentalQuery,
  carRentalQuery,
  vehicleRentalQuery
} from '../../actions/api'
import { ComponentContext } from '../../util/contexts'
import {
  setLocation,
  setMapPopupLocation,
  setMapPopupLocationAndGeocode
} from '../../actions/map'
import { updateOverlayVisibility } from '../../actions/config'

import BoundsUpdatingOverlay from './bounds-updating-overlay'
import ElevationPointMarker from './elevation-point-marker'
import EndpointsOverlay from './connected-endpoints-overlay'
import ParkAndRideOverlay from './connected-park-and-ride-overlay'
import PointPopup from './point-popup'
import RoutePreviewOverlay from './route-preview-overlay'
import RouteViewerOverlay from './connected-route-viewer-overlay'
import StopsOverlay from './connected-stops-overlay'
import StopViewerOverlay from './connected-stop-viewer-overlay'
import TileOverlay from './tile-overlay'
import TransitiveOverlay from './connected-transitive-overlay'
import TransitVehicleOverlay from './connected-transit-vehicle-overlay'
import TripViewerOverlay from './connected-trip-viewer-overlay'
import VehicleRentalOverlay from './connected-vehicle-rental-overlay'
import ZipcarOverlay from './zipcar-overlay'

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
      return intl.formatMessage(
        { id: 'components.MapLayers.bike-rental' },
        {
          companies: getCompanyNames(companies, config, intl)
        }
      )
    case 'car-rental':
      return intl.formatMessage({ id: 'components.MapLayers.car-rental' })
    case 'micromobility-rental':
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
    default:
      console.warn(`No name found for overlay type ${type}.`)
      return type
  }
}

class DefaultMap extends Component {
  static contextType = ComponentContext

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
    const { overlays } = this.props
    if (overlays && oldQuery.mode) {
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
            if (newQuery.companies.includes(overlayCompany)) {
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

  onPopupClosed = () => {
    this.props.setMapPopupLocation({ location: null })
  }

  onSetLocationFromPopup = (payload) => {
    const { setLocation, setMapPopupLocation } = this.props
    setMapPopupLocation({ location: null })
    setLocation(payload)
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
      mapConfig,
      mapPopupLocation,
      vehicleRentalQuery,
      vehicleRentalStations
    } = this.props
    const { getCustomMapOverlays, getTransitiveRouteLabel } = this.context

    const center =
      mapConfig && mapConfig.initLat && mapConfig.initLon
        ? [mapConfig.initLat, mapConfig.initLon]
        : null

    const popup = mapPopupLocation && {
      contents: (
        <PointPopup
          mapPopupLocation={mapPopupLocation}
          onSetLocationFromPopup={this.onSetLocationFromPopup}
        />
      ),
      location: [mapPopupLocation.lat, mapPopupLocation.lon]
    }

    const bikeStations = [
      ...bikeRentalStations.filter((station) => !station.isFloatingVehicle),
      ...vehicleRentalStations.filter(
        (station) => station.isFloatingBike === true
      )
    ]
    const scooterStations = vehicleRentalStations.filter(
      (station) => station.isFloatingBike === false && station.isFloatingVehicle
    )

    const baseLayersWithNames = mapConfig.baseLayers?.map((baseLayer) => ({
      ...baseLayer,
      name: getLayerName(baseLayer, config, intl)
    }))

    return (
      <MapContainer>
        <BaseMap
          baseLayers={baseLayersWithNames}
          center={center}
          maxZoom={mapConfig.maxZoom}
          onClick={this.onMapClick}
          onPopupClosed={this.onPopupClosed}
          popup={popup}
          zoom={mapConfig.initZoom || 13}
        >
          {/* The default overlays */}
          <BoundsUpdatingOverlay />
          <EndpointsOverlay />
          <RouteViewerOverlay />
          <TransitVehicleOverlay />
          <StopViewerOverlay />
          <TransitiveOverlay
            getTransitiveRouteLabel={getTransitiveRouteLabel}
          />
          <RoutePreviewOverlay />
          <TripViewerOverlay />
          <ElevationPointMarker />

          {/* The configurable overlays */}
          {mapConfig.overlays?.map((overlayConfig, k) => {
            const namedLayerProps = {
              ...overlayConfig,
              key: k,
              name: getLayerName(overlayConfig, config, intl)
            }
            switch (overlayConfig.type) {
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
              case 'tile':
                return <TileOverlay key={k} {...overlayConfig} />
              case 'micromobility-rental':
                return (
                  <VehicleRentalOverlay
                    {...namedLayerProps}
                    refreshVehicles={vehicleRentalQuery}
                    stations={vehicleRentalStations}
                  />
                )
              case 'zipcar':
                return <ZipcarOverlay key={k} {...overlayConfig} />
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
              default:
                return null
            }
          })}
          {/* Render custom overlays, if set. */}
          {typeof getCustomMapOverlays === 'function' && getCustomMapOverlays()}
        </BaseMap>
      </MapContainer>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state) => {
  const overlays =
    state.otp.config.map && state.otp.config.map.overlays
      ? state.otp.config.map.overlays
      : []

  return {
    bikeRentalStations: state.otp.overlay.bikeRental.stations,
    carRentalStations: state.otp.overlay.carRental.stations,
    config: state.otp.config,
    mapConfig: state.otp.config.map,
    mapPopupLocation: state.otp.ui.mapPopupLocation,
    overlays,
    query: state.otp.currentQuery,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  }
}

const mapDispatchToProps = {
  bikeRentalQuery,
  carRentalQuery,
  setLocation,
  setMapPopupLocation,
  setMapPopupLocationAndGeocode,
  updateOverlayVisibility,
  vehicleRentalQuery
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DefaultMap))
