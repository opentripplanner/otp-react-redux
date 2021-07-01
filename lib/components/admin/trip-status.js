import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, {Component} from 'react'
import { connect } from 'react-redux'

import * as fieldTripActions from '../../actions/field-trip'
import * as formActions from '../../actions/form'
import Icon from '../narrative/icon'
import { getTripFromRequest } from '../../util/call-taker'

import {
  Bold,
  Button,
  Full,
  Header,
  Para
} from './styled'

class TripStatus extends Component {
  _getTrip = () => getTripFromRequest(this.props.request, this.props.outbound)

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

  _onPlanTrip = () => {
    const { outbound, planTrip, request } = this.props
    planTrip(request, outbound)
  }

  _onSaveTrip = () => {
    const { outbound, request, saveRequestTripItineraries } = this.props
    saveRequestTripItineraries(request, outbound)
  }

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
        <Para>From <Bold>{start}</Bold> to <Bold>{end}</Bold></Para>
        {outbound
          ? <Para>
            Arriving at {this._formatTime(arriveDestinationTime)}
          </Para>
          : <>
            <Para>
              Leave at {this._formatTime(leaveDestinationTime)},{' '}
              due back at {this._formatTime(arriveSchoolTime)}
            </Para>
          </>
        }
        <Para>{this._formatTripStatus()}</Para>
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
  planTrip: fieldTripActions.planTrip,
  saveRequestTripItineraries: fieldTripActions.saveRequestTripItineraries,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
