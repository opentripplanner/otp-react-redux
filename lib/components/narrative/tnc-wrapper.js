import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
} from '../../actions/api'

class TNCWrapper extends Component {
  static propTypes = {
    leg: PropTypes.object,
    legMode: PropTypes.object
  }

  state = {}

  render () {
    // TODO remove this component (I'm not sure it's actually doing anything).
    return React.createElement(this.props.componentClass, { ...this.props })
  }
}

const mapStateToProps = (state, ownProps) => {
  const { LYFT_CLIENT_ID, UBER_CLIENT_ID } = state.otp.config
  return {
    companies: state.otp.currentQuery.companies,
    tncData: state.otp.tnc,
    LYFT_CLIENT_ID,
    UBER_CLIENT_ID
  }
}

const mapDispatchToProps = {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
}

export default connect(mapStateToProps, mapDispatchToProps)(TNCWrapper)
