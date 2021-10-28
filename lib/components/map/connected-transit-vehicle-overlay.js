// TODO: Typescript
/* eslint-disable react/prop-types */
/**
 * This overlay is similar to gtfs-rt-vehicle-overlay in that it shows
 * realtime positions of vehicles on a route using the otp-ui/transit-vehicle-overlay.
 *
 * However, this overlay differs in a few ways:
 * 1) This overlay retrieves vehicle locations from OTP
 * 2) This overlay renders vehicles as blobs rather than a custom shape
 * 3) This overlay does not handle updating positions
 * 4) This overlay does not render route paths
 * 5) This overlay has a custom popup on vehicle hover
 */
import {
  Circle,
  CircledVehicle
} from '@opentripplanner/transit-vehicle-overlay/lib/components/markers/ModeCircles'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber, injectIntl } from 'react-intl'
import { Tooltip } from 'react-leaflet'
import React from 'react'
import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'

const vehicleSymbols = [
  {
    minZoom: 0,
    symbol: Circle
  },
  {
    minZoom: 10,
    symbol: CircledVehicle
  }
]

function VehicleTooltip(props) {
  const { direction, intl, permanent, vehicle } = props

  let vehicleLabel = vehicle?.label
  // If a vehicle's label is less than 5 characters long, we can assume it is a vehicle
  // number. If this is the case, prepend "vehicle" to it.
  // Otherwise, the label itself is enough
  if (vehicleLabel !== null && vehicleLabel?.length <= 5) {
    vehicleLabel = intl.formatMessage(
      { id: 'components.TransitVehicleOverlay.vehicleName' },
      { vehicleNumber: vehicleLabel }
    )
  } else {
    vehicleLabel = ''
  }

  const stopStatus = vehicle?.stopStatus || 'in_transit_to'

  // FIXME: This may not be timezone adjusted as reported seconds may be in the wrong timezone.
  // All needed info to fix this is available via route.agency.timezone
  // However, the needed coreUtils methods are not updated to support this
  return (
    <Tooltip direction={direction} permanent={permanent}>
      <span>
        {/*
        FIXME: move back to core-utils for time handling
        */}
        <FormattedMessage
          id="components.TransitVehicleOverlay.realtimeVehicleInfo"
          values={{
            relativeTime: intl.formatRelativeTime(
              Math.floor(vehicle?.seconds - Date.now() / 1000)
            ),
            strong: (m) => <strong style={{ fontSize: '110%' }}>{m}</strong>,
            vehicleNameOrBlank: vehicleLabel
          }}
        />
      </span>
      {stopStatus !== 'STOPPED_AT' && vehicle?.speed > 0 && (
        <div>
          <FormattedMessage
            id="components.TransitVehicleOverlay.travelingAt"
            values={{
              milesPerHour: (
                <FormattedNumber
                  // Not a "real" style prop
                  // eslint-disable-next-line react/style-prop-object
                  style="unit"
                  unit="mile-per-hour"
                  value={Math.round(vehicle.speed)}
                />
              )
            }}
          />
        </div>
      )}
      {vehicle?.nextStopName && (
        <div>
          <FormattedMessage
            id={`components.TransitVehicleOverlay.${stopStatus.toLowerCase()}`}
            values={{
              stop: vehicle.nextStopName
            }}
          />
        </div>
      )}
    </Tooltip>
  )
}
// connect to the redux store

const mapStateToProps = (state) => {
  const viewedRoute = state.otp.ui.viewedRoute
  const route = state.otp.transitIndex?.routes?.[viewedRoute?.routeId]

  let vehicleList = []

  // Add missing fields to vehicle list
  if (viewedRoute?.routeId) {
    vehicleList = route?.vehicles?.map((vehicle) => {
      vehicle.routeType = route?.mode
      vehicle.routeColor = route?.color
      vehicle.textColor = route?.routeTextColor
      return vehicle
    })

    // Remove all vehicles not on pattern being currently viewed
    if (viewedRoute.patternId && vehicleList) {
      vehicleList = vehicleList.filter(
        (vehicle) => vehicle.patternId === viewedRoute.patternId
      )
    }
  }
  return {
    symbols: vehicleSymbols,
    TooltipSlot: injectIntl(VehicleTooltip),
    vehicleList
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransitVehicleOverlay)
