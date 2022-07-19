// TYPESCRIPT TODO: all props here are missing types
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { useMap } from 'react-map-gl'
import ParkAndRideOverlay from '@opentripplanner/park-and-ride-overlay'
import React, { useEffect } from 'react'
import VehicleRentalOverlay from '@opentripplanner/vehicle-rental-overlay'

import * as mapActions from '../../actions/map'

import EnhancedStopMarker from './enhanced-stop-marker'

/**
 * An overlay to view a collection of stops.
 */
const StopViewerOverlay = ({
  configCompanies,
  mapConfig,
  setLocation,
  stopData,
  stops
}) => {
  const { current: mainMap } = useMap()

  useEffect(() => {
    if (stopData?.lat && stopData?.lon) {
      mainMap?.flyTo({
        center: { lat: stopData.lat, lon: stopData.lon },
        duration: 500,
        zoom: 16
      })
    }
  }, [stopData, mainMap])

  if (!stopData) return null
  const { bikeRental, parkAndRideLocations, vehicleRental } = stopData

  return (
    <>
      {stops &&
        stops.length > 0 &&
        stops.map((stop) => (
          <EnhancedStopMarker
            key={stop.id}
            setLocation={setLocation}
            stop={stop}
          />
        ))}
      <ParkAndRideOverlay
        parkAndRideLocations={parkAndRideLocations}
        setLocation={setLocation}
        visible
      />
      {mapConfig.overlays &&
        mapConfig.overlays.map((overlayConfig, k) => {
          switch (overlayConfig.type) {
            case 'bike-rental':
            case 'otp2-bike-rental':
              return (
                <VehicleRentalOverlay
                  key={k}
                  {...overlayConfig}
                  configCompanies={configCompanies}
                  stations={bikeRental && bikeRental.stations}
                />
              )
            case 'micromobility-rental':
            case 'otp2-micromobility-rental':
              return (
                <VehicleRentalOverlay
                  key={k}
                  {...overlayConfig}
                  configCompanies={configCompanies}
                  stations={vehicleRental?.stations}
                />
              )
            default:
              return null
          }
        })}
    </>
  )
}

// connect to the redux store

const mapStateToProps = (state) => {
  const stopLookup = state.otp.transitIndex.stops
  const stopData = stopLookup[state.otp.ui.viewedStop?.stopId]
  const nearbyStops = stopData?.nearbyStops?.map((stopId) => stopLookup[stopId])
  const stops = []
  if (nearbyStops && nearbyStops.length > 0 && stopData) {
    stops.push(...nearbyStops)
    stops.push(stopData)
  }
  return {
    configCompanies: state.otp.config.companies,
    mapConfig: state.otp.config.map,
    stopData,
    stops
  }
}

const mapDispatchToProps = {
  setLocation: mapActions.setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(StopViewerOverlay)
