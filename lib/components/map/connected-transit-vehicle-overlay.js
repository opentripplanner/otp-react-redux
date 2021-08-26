import TransitVehicleOverlay from '@opentripplanner/transit-vehicle-overlay'
import { connect } from 'react-redux'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute

  let vehicleList = []

  if (viewedRoute?.routeId) {
    vehicleList = state.otp.transitIndex?.routes?.[viewedRoute.routeId].vehicles
    if (viewedRoute.patternId) {
      vehicleList = vehicleList.filter(
        (vehicle) => vehicle.patternId === viewedRoute.patternId
      )
    }
  }
  return { vehicleList }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TransitVehicleOverlay)
