import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
import coreUtils from '@opentripplanner/core-utils'
import { Circle, CircledVehicle } from '@opentripplanner/transit-vehicle-overlay/lib/components/markers/ModeCircles'
import { Tooltip } from 'react-leaflet'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'

const { formatDurationWithSeconds } = coreUtils.time

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

function VehicleTooltip (props) {
  const { direction, intl, permanent, vehicle } = props

  let name = vehicle?.label
  if (name !== null && name?.length <= 5) {
    const mode = vehicle.routeType ? intl.formatMessage({
      id: `common.otpTransitModes.${vehicle.routeType.toLowerCase()}`
    }) : 'Line'
    // Only render space if name is present
    name = `${mode}${name && ' '}${name}`
  }

  // FIXME: move to coreutils
  const stopStatusString = vehicle.stopStatus
    ? intl.formatMessage({
      id: `components.TransitVehicleOverlay.${vehicle.stopStatus.toLowerCase()}`
    })
    : ''

  // FIXME: This may not be timezone adjusted as reported seconds may be in the wrong timezone.
  // All needed info to fix this is available via route.agency.timezone
  // However, the needed coreUtils methods are not
  return (
    <Tooltip direction={direction} permanent={permanent}>
      <span>
        <strong style={{fontSize: '110%'}}>{name}: </strong>
        <FormattedMessage
          id='components.TransitVehicleOverlay.relativeTime'
          values={{
            seconds: formatDurationWithSeconds(vehicle.seconds)
          }}
        />
      </span>
      {/* TODO: localize MPH? */}
      {vehicle?.speed > 0 && <div><FormattedMessage id='components.TransitVehicleOverlay.travellingAt' /> {Math.round(vehicle.speed)} Mph</div>}
      {vehicle?.nextStop && <div>{stopStatusString} {vehicle.nextStop}</div>}
    </Tooltip>
  )
}
// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute
  const route = state.otp.transitIndex?.routes?.[viewedRoute?.routeId]

  let vehicleList = []

  // Add missing fields to vehicle list
  if (viewedRoute?.routeId) {
    vehicleList = route?.vehicles?.map(vehicle => {
      vehicle.routeType = route?.mode
      vehicle.routeColor = route?.color
      vehicle.textColor = route?.routeTextColor
      return vehicle
    })

    // Remove all vehicles not on pattern being currently viewed
    if (viewedRoute.patternId && vehicleList) {
      vehicleList = vehicleList
        .filter(
          (vehicle) => vehicle.patternId === viewedRoute.patternId
        )
    }
  }
  return { symbols: vehicleSymbols, TooltipSlot: injectIntl(VehicleTooltip), vehicleList }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TransitVehicleOverlay)
