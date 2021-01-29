import moment from 'moment'
import React, {Component} from 'react'

import {
  B,
  Button,
  Full,
  Header,
  P
} from './styled'

export default class TripStatus extends Component {
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
    const status = outbound ? outboundTripStatus : inboundTripStatus
    const start = outbound ? startLocation : endLocation
    const end = outbound ? endLocation : startLocation
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
            <P>From <B>{endLocation}</B> to <B>{startLocation}</B></P>
            <P>Due back at {this._formatTime(arriveSchoolTime)}</P>
          </>
        }
        <P>{this._formatTripStatus(status)}</P>
      </Full>
    )
  }
}
