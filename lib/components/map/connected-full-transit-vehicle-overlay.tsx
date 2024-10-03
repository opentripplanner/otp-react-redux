import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import React from 'react'
import TransitVehicleOverlay, {
  Circle,
  DefaultIconContainer,
  RotatingCircle,
  RouteNumberIcon,
  withRouteColorBackground
} from '@opentripplanner/transit-vehicle-overlay'

import { DEFAULT_ROUTE_COLOR } from '../util/colors'

import { VehicleTooltip } from './connected-transit-vehicle-overlay'

const IconContainer = withRouteColorBackground(Circle)
// connect to the redux store
const mapStateToProps = (state: Record<string, any>) => {
  const { viewedRoute } = state.otp.ui
  // TODO: clever behavior for when route viewer is active

  const vehicles = state.otp.transitIndex?.allVehicles
    // TODO: CLEAN THIS UP
    ?.filter(
      (obj, index) =>
        state.otp.transitIndex?.allVehicles.findIndex(
          (item) => item.vehicleId === obj.vehicleId
        ) === index
    )
    .map((v) => {
      const { route } = v?.trip
      v.routeType = route?.mode
      v.routeColor =
        route.color && !route.color.includes('#')
          ? '#' + route.color
          : route?.color || DEFAULT_ROUTE_COLOR
      // Try to populate this attribute, which is required for the vehicle popup to appear.
      v.routeShortName = route?.shortName
      v.routeLongName = v.routeLongName || route?.longName
      v.textColor = route?.textColor
      return v
    })

  // TODO: something funky is happening with the mode icon. Ferries are buses!
  return {
    IconContainer,
    TooltipSlot: injectIntl(VehicleTooltip),
    VehicleIcon: RouteNumberIcon,
    vehicles
  }
}

// @ts-expect-error state.js being typescripted will fix this error
export default injectIntl(connect(mapStateToProps)(TransitVehicleOverlay))
