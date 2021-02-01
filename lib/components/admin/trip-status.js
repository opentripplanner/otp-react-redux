import { planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, {Component} from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import * as formActions from '../../actions/form'
import {
  B,
  Button,
  Full,
  Header,
  P
} from './styled'

class TripStatus extends Component {
  _formatTime = (time) => moment(time).format(this.props.timeFormat)

  _formatTripStatus = (tripStatus) => {
    if (!tripStatus) {
      return (
        <span>
          No itineraries planned! Click Plan to plan trip.
        </span>
      )
    }
    return (
      <span>
        {JSON.stringify(tripStatus)}
      </span>
    )
  }

  _onPlanTrip = async () => {
    const {outbound, planInbound, planOutbound, request} = this.props
    const trip = this._getTrip()
    if (!trip) {
      // Construct params from request details
      if (outbound) planOutbound(request)
      else planInbound(request)
    } else {
      // Populate params from saved query params
      const params = await planParamsToQueryAsync(JSON.parse(trip.queryParams))
      this.props.setQueryParam(params, trip.id)
    }
  }

  _getTrip = () => {
    const {outbound, request} = this.props
    if (!request || !request.trips) return null
    return outbound
      ? request.trips[0]
      : request.trips[1]
  }

  render () {
    const {outbound, request} = this.props
    const {
      arriveDestinationTime,
      arriveSchoolTime,
      endLocation,
      inboundTripStatus,
      leaveDestinationTime,
      outboundTripStatus,
      startLocation
    } = request
    if (!request) {
      console.warn('Could not find field trip request')
      return null
    }
    const status = outbound ? outboundTripStatus : inboundTripStatus
    const start = outbound ? startLocation : endLocation
    const end = outbound ? endLocation : startLocation
    const trip = this._getTrip()
    return (
      <Full>
        <Header>
          {outbound ? 'Outbound' : 'Inbound'} trip
          <Button bsSize='xs' onClick={this._onPlanTrip}>Plan</Button>
          <Button bsSize='xs' onClick={this._onSaveTrip}>Save</Button>
          {status &&
            <Button bsSize='xs' onClick={this._onClearTrip}>Clear</Button>
          }
        </Header>
        <P>From <B>{start}</B> to <B>{end}</B></P>
        {outbound
          ? <P>
            Arriving at {this._formatTime(arriveDestinationTime)},{' '}
            leave at {this._formatTime(leaveDestinationTime)}
          </P>
          : <>
            <P>From <B>{start}</B> to <B>{end}</B></P>
            <P>Due back at {this._formatTime(arriveSchoolTime)}</P>
          </>
        }
        <P>{this._formatTripStatus(status)}</P>
      </Full>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    callTaker: state.callTaker,
    currentQuery: state.otp.currentQuery,
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  planInbound: callTakerActions.planInbound,
  planOutbound: callTakerActions.planOutbound,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
