import currencyFormatter from 'currency-formatter'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
} from '../../../actions/api'
import { toSentenceCase } from '../../../util/itinerary'
import { formatDuration } from '../../../util/time'

class TransportationNetworkCompanyLeg extends Component {
  static propTypes = {
    leg: PropTypes.Object,
    legMode: PropTypes.Object
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
    } = this.props
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
      tncData.etaEstimates[from][companies][rideType] &&
      tncData.etaEstimates[from][companies][rideType].estimateTimestamp.getTime() + 30000 > now

    if (hasTncEtaData) {
      stateUpdate.eta = tncData.etaEstimates[from][companies][rideType]
    } else if (isMounting) {
      getTransportationNetworkCompanyEtaEstimate({
        companies, from
      })
    } else {
      stateUpdate.noEtaEstimateAvailable = true
    }

    const hasTncRideData = tncData.rideEstimates[from] &&
      tncData.rideEstimates[from][to] &&
      tncData.rideEstimates[from][to][companies] &&
      tncData.rideEstimates[from][to][companies][rideType] &&
      tncData.rideEstimates[from][to][companies][rideType].estimateTimestamp.getTime() + 30000 > now

    if (hasTncRideData) {
      stateUpdate.rideEstimate = tncData.rideEstimates[from][to][companies][rideType]
    } else if (isMounting) {
      getTransportationNetworkCompanyRideEstimate({
        company: companies, from, rideType, to
      })
    } else {
      stateUpdate.noRideEstimateAvailable = true
    }

    this.setState(stateUpdate)
  }

  render () {
    const {legMode} = this.props
    const {eta, noEtaEstimateAvailable, noRideEstimateAvailable, rideEstimate} = this.state
    return (
      <div>
        <p>* estimated travel time does not account for traffic.</p>
        {!eta && !noEtaEstimateAvailable &&
          <p>Getting eta estimate from {toSentenceCase(legMode.label)}...</p>}
        {!eta && noEtaEstimateAvailable &&
          <p>Could not obtain eta estimate from {toSentenceCase(legMode.label)}!</p>}
        {eta &&
          <p>Eta for a driver: {formatDuration(eta.estimatedSeconds)}</p>}
        {!rideEstimate && !noRideEstimateAvailable &&
          <p>Getting ride estimate from {toSentenceCase(legMode.label)}...</p>}
        {!rideEstimate && noRideEstimateAvailable &&
          <p>Could not obtain ride estimate from {toSentenceCase(legMode.label)}!</p>}
        {rideEstimate &&
          <p>Estimated drive time: {formatDuration(rideEstimate.duration)}</p>}
        {rideEstimate &&
          <p>Estimated cost: {
            `${currencyFormatter.format(rideEstimate.minCost, { code: rideEstimate.currency })} - ${currencyFormatter.format(rideEstimate.maxCost, { code: rideEstimate.currency })}`
          }</p>}
      </div>
    )
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
  return {
    companies: state.otp.currentQuery.companies,
    tncData: state.otp.tnc
  }
}

const mapDispatchToProps = {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
}

export default connect(mapStateToProps, mapDispatchToProps)(TransportationNetworkCompanyLeg)
