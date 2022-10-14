import { connect } from 'react-redux'
import React, { Component } from 'react'
import VehicleRentalOverlay from '@opentripplanner/vehicle-rental-overlay'

import { setLocation } from '../../actions/map'

class ConnectedVehicleRentalOverlay extends Component {
  render() {
    return <VehicleRentalOverlay {...this.props} />
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    configCompanies: state.otp.config.companies,
    zoom: state.otp.config.map.initZoom
  }
}

const mapDispatchToProps = {
  setLocation
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedVehicleRentalOverlay)
