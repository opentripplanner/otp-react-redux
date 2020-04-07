import currencyFormatter from 'currency-formatter'
import { formatDuration } from '@opentripplanner/core-utils/lib/time'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
} from '../../../actions/api'
import { toSentenceCase } from '../../../util/itinerary'
import { isMobile } from '../../../util/ui'

class TransportationNetworkCompanyLeg extends Component {
  static propTypes = {
    leg: PropTypes.object,
    legMode: PropTypes.object
  }

  state = {}

  render () {
    const { leg, legMode, LYFT_CLIENT_ID, UBER_CLIENT_ID } = this.props
    const universalLinks = {
      'UBER': `https://m.uber.com/${isMobile() ? 'ul/' : ''}?client_id=${UBER_CLIENT_ID}&action=setPickup&pickup[latitude]=${leg.from.lat}&pickup[longitude]=${leg.from.lon}&pickup[nickname]=${encodeURI(leg.from.name)}&dropoff[latitude]=${leg.to.lat}&dropoff[longitude]=${leg.to.lon}&dropoff[nickname]=${encodeURI(leg.to.name)}`,
      'LYFT': `https://lyft.com/ride?id=${defaultTncRideTypes['LYFT']}&partner=${LYFT_CLIENT_ID}&pickup[latitude]=${leg.from.lat}&pickup[longitude]=${leg.from.lon}&destination[latitude]=${leg.to.lat}&destination[longitude]=${leg.to.lon}`
    }
    const { tncData } = leg
    return (
      <div>
        <p>* estimated travel time does not account for traffic.</p>
        <a
          className='btn btn-default'
          href={universalLinks[legMode.label.toUpperCase()]}
          style={{ marginBottom: 15 }}
          target={isMobile() ? '_self' : '_blank'}>
          Book Ride
        </a>
        {tncData && tncData.estimatedArrival
          ? <p>ETA for a driver: {formatDuration(tncData.estimatedArrival)}</p>
          : <p>Could not obtain eta estimate from {toSentenceCase(legMode.label)}!</p>
        }
        {/* tncData && tncData.travelDuration &&
          <p>Estimated drive time: {formatDuration(tncData.travelDuration)}</p> */}
        {tncData && tncData.minCost
          ? <p>Estimated cost: {
            `${currencyFormatter.format(tncData.minCost, { code: tncData.currency })} - ${currencyFormatter.format(tncData.maxCost, { code: tncData.currency })}`
          }</p>
          : <p>Could not obtain ride estimate from {toSentenceCase(legMode.label)}!</p>}
        }
      </div>
    )
  }
}

const defaultTncRideTypes = {
  'LYFT': 'lyft',
  'UBER': 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
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

export default connect(mapStateToProps, mapDispatchToProps)(TransportationNetworkCompanyLeg)
