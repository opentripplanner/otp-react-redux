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

  componentWillMount () {
    this._resolveTncData(this.props, true)
  }

  componentWillReceiveProps (nextProps) {
    this._resolveTncData(nextProps)
  }

  _resolveTncData (props, isMounting) {
    const {
      companies,
      getTransportationNetworkCompanyEtaEstimate,
      getTransportationNetworkCompanyRideEstimate,
      leg,
      tncData
    } = props
    const from = getTNCLocation(leg, 'from')
    const to = getTNCLocation(leg, 'to')
    const rideType = defaultTncRideTypes[companies]
    const now = (new Date()).getTime()

    const stateUpdate = {
      eta: null,
      rideEstimate: null
    }

    const hasTncEtaData = tncData.etaEstimates[from] &&
      tncData.etaEstimates[from][companies] &&
      tncData.etaEstimates[from][companies][rideType]

    const tncEtaDataIsValid = hasTncEtaData &&
      tncData.etaEstimates[from][companies][rideType].estimateTimestamp.getTime() + 30000 > now

    if (hasTncEtaData && tncEtaDataIsValid) {
      stateUpdate.eta = tncData.etaEstimates[from][companies][rideType]
    } else if (isMounting || (hasTncEtaData && !tncEtaDataIsValid)) {
      getTransportationNetworkCompanyEtaEstimate({
        companies, from
      })
    } else {
      stateUpdate.noEtaEstimateAvailable = true
    }

    const hasTncRideData = tncData.rideEstimates[from] &&
      tncData.rideEstimates[from][to] &&
      tncData.rideEstimates[from][to][companies] &&
      tncData.rideEstimates[from][to][companies][rideType]

    const tncRideDataIsValid = hasTncRideData &&
      tncData.rideEstimates[from][to][companies][rideType].estimateTimestamp.getTime() + 30000 > now

    if (hasTncRideData && tncRideDataIsValid) {
      stateUpdate.rideEstimate = tncData.rideEstimates[from][to][companies][rideType]
    } else if (isMounting || (hasTncRideData && !tncRideDataIsValid)) {
      getTransportationNetworkCompanyRideEstimate({
        company: companies, from, rideType, to
      })
    } else {
      stateUpdate.noRideEstimateAvailable = true
    }

    this.setState(stateUpdate)
  }

  render () {
    const {eta, noEtaEstimateAvailable, noRideEstimateAvailable, rideEstimate} = this.state
    return React.createElement(this.props.componentClass, {
      eta,
      noEtaEstimateAvailable,
      rideEstimate,
      noRideEstimateAvailable,
      ...this.props
    })
  }
}

function getTNCLocation (leg, type) {
  const location = leg[type]
  return `${location.lat.toFixed(5)},${location.lon.toFixed(5)}`
}

const defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
}

const mapStateToProps = (state, ownProps) => {
  const {LYFT_CLIENT_ID, UBER_CLIENT_ID} = state.otp.config
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
