import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
import { Circle, CircledVehicle } from '@opentripplanner/transit-vehicle-overlay/lib/components/markers/ModeCircles'
import { connect } from 'react-redux'

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
    if (viewedRoute.patternId) {
      vehicleList = vehicleList
        .filter(
          (vehicle) => vehicle.patternId === viewedRoute.patternId
        )
    }
  }
  return { symbols: vehicleSymbols, vehicleList }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TransitVehicleOverlay)
