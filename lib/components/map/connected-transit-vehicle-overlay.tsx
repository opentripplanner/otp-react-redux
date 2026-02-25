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

  const scopedVehicleId = vehicle?.vehicleId?.split(':')?.[1]

  let vehicleLabel = scopedVehicleId || vehicle?.vehicleId
  // If a vehicle's label prop is less than 5 characters long, we can assume it is a vehicle
  // number. If this is the case, or if a vehicleId prop is provided,
  // render as "Vehicle <vehicleId>" (or the equivalent in the user's language).
  // Otherwise, the label itself is enough
  //   (this is TriMet-specific, when label contains text such as "MAX Green").
  if (
    !!vehicleLabel &&
    (vehicleLabel.length <= 5 || scopedVehicleId || vehicle?.vehicleId)
  ) {
    vehicleLabel = intl.formatMessage(
      { id: 'components.TransitVehicleOverlay.vehicleName' },
      { vehicleNumber: vehicleLabel }
    )
  } else if (vehicle?.label) {
    vehicleLabel = vehicle?.label
  }

  const stopStatus = vehicle?.stopStatus || 'in_transit_to'

  return (
    <>
      {/* FIXME: move back to core-utils for time handling */}
      <div>
        <strong>{vehicleLabel}</strong>
      </div>
      <div>
        {capitalizeFirst(
          intl.formatMessage(
            { id: 'common.time.durationAgo' },
            {
              duration: formatDuration(
                Math.floor(Date.now() / 1000 - (vehicle?.seconds || 0)),
                intl,
                true
              )
            }
          )
        )}
      </div>
      {stopStatus !== 'STOPPED_AT' && vehicle.speed > 0 && (
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
          <FormattedTransitVehicleStatus
            stop={vehicle.nextStopName}
            stopStatus={stopStatus.toLowerCase()}
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
