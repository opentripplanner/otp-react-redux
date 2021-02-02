import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, {Component} from 'react'
import { connect } from 'react-redux'

import * as callTakerActions from '../../actions/call-taker'
import * as formActions from '../../actions/form'
import Icon from '../narrative/icon'
import {
  B,
  Button,
  Full,
  Header,
  P
} from './styled'
import { getTrip } from '../../util/call-taker'

class TripStatus extends Component {
  _getTrip = () => getTrip(this.props.request, this.props.outbound)

  _formatTime = (time) => moment(time).format(this.props.timeFormat)

  _formatTripStatus = () => {
    if (!this._getStatus()) {
      return (
        <span>
          No itineraries planned! Click Plan to plan trip.
        </span>
      )
    }
    const trip = this._getTrip()
    if (!trip) return <span>Error finding trip!</span>
    return (
      <span>
        {trip.groupItineraries.length} group itineraries, planned by{' '}
        {trip.createdBy} at {trip.timeStamp}
      </span>
    )
  }

  _getStatus = () => {
    const {outbound, request} = this.props
    return outbound ? request.outboundTripStatus : request.inboundTripStatus
  }

  _getStatusIcon = () => this._getStatus()
    ? <Icon type='check' className='text-success' />
    : <Icon type='exclamation-circle' className='text-warning' />

  _onPlanTrip = () => this.props.planTrip(this.props.request, this.props.outbound)

  _onSaveTrip = () => this.props.saveRequestTrip(this.props.request, this.props.outbound)

  render () {
    const {outbound, request} = this.props
    const {
      arriveDestinationTime,
      arriveSchoolTime,
      endLocation,
      leaveDestinationTime,
      startLocation
    } = request
    if (!request) {
      console.warn('Could not find field trip request')
      return null
    }
    const start = outbound ? startLocation : endLocation
    const end = outbound ? endLocation : startLocation
    return (
      <Full>
        <Header>
          {this._getStatusIcon()}
          {outbound ? 'Outbound' : 'Inbound'} trip
          <Button bsSize='xs' onClick={this._onPlanTrip}>Plan</Button>
          <Button bsSize='xs' onClick={this._onSaveTrip}>Save</Button>
        </Header>
        <P>From <B>{start}</B> to <B>{end}</B></P>
        {outbound
          ? <P>
            Arriving at {this._formatTime(arriveDestinationTime)}
          </P>
          : <>
            <P>
              Leave at {this._formatTime(leaveDestinationTime)},{' '}
              due back at {this._formatTime(arriveSchoolTime)}
            </P>
          </>
        }
        <P>{this._formatTripStatus()}</P>
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
  planTrip: callTakerActions.planTrip,
  saveRequestTrip: callTakerActions.saveRequestTrip,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
