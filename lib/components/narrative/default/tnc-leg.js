/* eslint-disable react/style-prop-object */
import { connect } from 'react-redux'
import { FormattedNumber } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
} from '../../../actions/api'
import FormattedDuration from '../../util/formatted-duration'

const { toSentenceCase } = coreUtils.itinerary
const { isMobile } = coreUtils.ui

const defaultTncRideTypes = {
  LYFT: 'lyft',
  UBER: 'a6eef2e1-c99a-436f-bde9-fefb9181c0b0'
}

class TransportationNetworkCompanyLeg extends Component {
  static propTypes = {
    // eslint-disable-next-line sort-keys
    leg: PropTypes.object,

    legMode: PropTypes.object,

    LYFT_CLIENT_ID: PropTypes.string,
    UBER_CLIENT_ID: PropTypes.string
  }

  state = {}

  render() {
    const { leg, legMode, LYFT_CLIENT_ID, UBER_CLIENT_ID } = this.props
    const universalLinks = {
      LYFT: `https://lyft.com/ride?id=${defaultTncRideTypes.LYFT}&partner=${LYFT_CLIENT_ID}&pickup[latitude]=${leg.from.lat}&pickup[longitude]=${leg.from.lon}&destination[latitude]=${leg.to.lat}&destination[longitude]=${leg.to.lon}`,
      UBER: `https://m.uber.com/${
        isMobile() ? 'ul/' : ''
      }?client_id=${UBER_CLIENT_ID}&action=setPickup&pickup[latitude]=${
        leg.from.lat
      }&pickup[longitude]=${leg.from.lon}&pickup[nickname]=${encodeURI(
        leg.from.name
      )}&dropoff[latitude]=${leg.to.lat}&dropoff[longitude]=${
        leg.to.lon
      }&dropoff[nickname]=${encodeURI(leg.to.name)}`
    }
    const { tncData } = leg
    return (
      <div>
        <p>* estimated travel time does not account for traffic.</p>
        <a
          className="btn btn-default"
          href={universalLinks[legMode.label.toUpperCase()]}
          rel="noreferrer"
          style={{ marginBottom: 15 }}
          target={isMobile() ? '_self' : '_blank'}
        >
          Book Ride
        </a>
        {tncData && tncData.estimatedArrival ? (
          <p>
            ETA for a driver:{' '}
            <FormattedDuration
              duration={tncData.estimatedArrival}
              includeSeconds={false}
            />
          </p>
        ) : (
          <p>
            Could not obtain eta estimate from {toSentenceCase(legMode.label)}!
          </p>
        )}
        {/* tncData && tncData.travelDuration &&
          <p>
            Estimated drive time:{' '}
            <FormattedDuration duration={tncData.travelDuration} />
          </p>
        */}
        {tncData && tncData.minCost ? (
          <p>
            Estimated cost:{' '}
            <FormattedNumber
              currency={tncData.currency}
              style="currency"
              value={tncData.minCost}
            />{' '}
            -{' '}
            <FormattedNumber
              currency={tncData.currency}
              style="currency"
              value={tncData.maxCost}
            />
          </p>
        ) : (
          <p>
            Could not obtain ride estimate from {toSentenceCase(legMode.label)}!
          </p>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { LYFT_CLIENT_ID, UBER_CLIENT_ID } = state.otp.config
  return {
    // eslint-disable-next-line sort-keys
    companies: state.otp.currentQuery.companies,

    LYFT_CLIENT_ID,

    tncData: state.otp.tnc,
    UBER_CLIENT_ID
  }
}

const mapDispatchToProps = {
  getTransportationNetworkCompanyEtaEstimate,
  getTransportationNetworkCompanyRideEstimate
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TransportationNetworkCompanyLeg)
