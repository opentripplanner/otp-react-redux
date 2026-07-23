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

import { connect } from 'react-redux'
import { FormattedMessage, FormattedNumber, useIntl } from 'react-intl'
import { TransitVehicle } from '@opentripplanner/types'
import React from 'react'
import TransitVehicleOverlay, {
  withRouteColorBackground
} from '@opentripplanner/transit-vehicle-overlay'

import { AppReduxState } from '../../util/state-types'
import { capitalizeFirst } from '../../util/ui'
import { DEFAULT_ROUTE_COLOR } from '../util/colors'
import { formatDuration } from '../util/formatted-duration'
import FormattedTransitVehicleStatus from '../util/formatted-transit-vehicle-status'

import ConnectedCaret from './connected-caret'

interface TransitVehicleExt extends TransitVehicle {
  label?: string
  nextStopName?: string
  patternId?: string
  speed: number
  stopStatus?: string
  textColor?: string
}

function VehicleTooltip({
  vehicle
}: {
  vehicle: TransitVehicleExt
}): React.ReactNode {
  const intl = useIntl()
  const { label, nextStopName, seconds, speed, stopStatus, vehicleId } =
    vehicle || {}
  const scopedVehicleId = vehicleId?.split(':')?.[1]

  // Use label first, fall back on (scoped) vehicle id if no label.
  const vehicleLabel = label || scopedVehicleId || vehicleId

  return (
    <>
      {/* FIXME: move back to core-utils for time handling */}
      <div>
        <strong>
          <FormattedMessage
            id="components.TransitVehicleOverlay.vehicleName"
            values={{ vehicleNumber: vehicleLabel }}
          />
        </strong>
      </div>
      {seconds !== null && seconds !== undefined && (
        <div>
          {capitalizeFirst(
            intl.formatMessage(
              { id: 'common.time.durationAgo' },
              {
                duration: formatDuration(
                  Math.floor(Date.now() / 1000 - seconds),
                  intl,
                  true
                )
              }
            )
          )}
        </div>
      )}
      {stopStatus !== 'STOPPED_AT' && speed > 0 && (
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
                  value={Math.round(speed)}
                />
              )
            }}
          />
        </div>
      )}
      {nextStopName && (
        <div>
          <FormattedTransitVehicleStatus
            stop={nextStopName}
            stopStatus={(stopStatus || 'in_transit_to').toLowerCase()}
          />
        </div>
      )}
    </>
  )
}

// Settings where caret is touching the border of the circle.
const CaretTouchingBorder = ConnectedCaret

// Round vehicle symbol with arrow/caret on the border,
// and showing the route color with a transparent effect on hover.
// @ts-expect-error This visual component does not deal with vehicle data directly.
const IconContainer = withRouteColorBackground(CaretTouchingBorder, {
  alphaHex: 'aa',
  display: 'onhover'
})

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const viewedRoute = state.otp.ui.viewedRoute
  const { patternId, routeId } = viewedRoute || {}
  const route = state.otp.transitIndex?.routes?.[routeId]
  const { maxRealtimeVehicleAge, vehicleIconHighlight, vehicleIconPadding } =
    state.otp.config.routeViewer || {}

  const ConfiguredIconContainer =
    vehicleIconHighlight === false ? CaretTouchingBorder : IconContainer

  let vehicleList = []

  // Add missing fields to vehicle list
  if (routeId) {
    vehicleList = route?.vehicles?.map((vehicle: TransitVehicleExt) => {
      vehicle.routeType = route?.mode
      vehicle.routeColor =
        route.color && !route.color.includes('#')
          ? '#' + route.color
          : route?.color || DEFAULT_ROUTE_COLOR
      // Try to populate this attribute, which is required for the vehicle popup to appear.
      vehicle.routeShortName = vehicle.routeShortName || route?.shortName
      vehicle.routeLongName = vehicle.routeLongName || route?.longName
      vehicle.textColor = route?.routeTextColor
      vehicle.lastUpdated = vehicle?.seconds
      return vehicle
    })

    // Remove all vehicles not on pattern being currently viewed.
    // Also include vehicles in hidden subpatterns of the pattern being viewed.
    if (patternId && vehicleList) {
      vehicleList = vehicleList.filter(
        (vehicle: TransitVehicleExt) =>
          vehicle.patternId === patternId ||
          route.containingPatterns?.[vehicle.patternId || ''] === patternId
      )
    }
  }
  return {
    color: route?.color ? '#' + route.color : null,
    IconContainer: ConfiguredIconContainer,
    iconPadding: vehicleIconPadding,
    maxVehicleAge: maxRealtimeVehicleAge,
    // Note: with OTP2, we are showing route stops along with the route alignment,
    // and vehicle direction arrows become difficult to distinguish from the stop circles.
    TooltipSlot: VehicleTooltip,
    vehicles: vehicleList
  }
}

// @ts-expect-error Type error is unclear on what type ReactNode conflicts with.
export default connect(mapStateToProps)(TransitVehicleOverlay)
