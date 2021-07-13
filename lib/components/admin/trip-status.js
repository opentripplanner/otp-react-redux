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
  _formatTime = (time) => moment(time).format(this.props.timeFormat)

  _onDeleteTrip = () => {
    const { outbound, request, deleteRequestTripItineraries } = this.props
    deleteRequestTripItineraries(request, outbound)
  }

  _onPlanTrip = () => {
    const { outbound, planTrip, request, status, trip } = this.props
    if (status && trip) {
      if (!confirm('Re-planning this trip will cause the trip planner to avoid the currently saved trip. Are you sure you want to continue?')) {
        return
      }
    }
    planTrip(request, outbound)
  }

  _onSaveTrip = () => {
    const { outbound, request, saveRequestTripItineraries } = this.props
    saveRequestTripItineraries(request, outbound)
  }

  _onViewTrip = () => {
    const { outbound, request, viewRequestTripItineraries } = this.props
    viewRequestTripItineraries(request, outbound)
  }

  _renderStatusIcon = () => this.props.status
    ? <Icon type='check' className='text-success' />
    : <Icon type='exclamation-circle' className='text-warning' />

  _renderTripStatus = () => {
    const { status, trip } = this.props
    if (!status) {
      return (
        <Para>
          <span>
            No itineraries planned! Click Plan to plan trip.
          </span>
        </Para>
      )
    }
    if (!trip) return <Para><span>Error finding trip!</span></Para>
    return (
      <>
        <Para>
          <span>
            {trip.groupItineraries.length} group itineraries, planned by{' '}
            {trip.createdBy} at {trip.timeStamp}
          </span>
        </Para>
        <Para>
          <Button bsSize='xs' onClick={this._onViewTrip}>View</Button>
          <Button bsSize='xs' onClick={this._onDeleteTrip}>Delete</Button>
        </Para>
      </>
    )
  }

  render () {
    const {outbound, request, savable} = this.props
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
          {this._renderStatusIcon()}
          {outbound ? 'Outbound' : 'Inbound'} trip
          <Button bsSize='xs' onClick={this._onPlanTrip}>Plan</Button>
          <Button
            bsSize='xs'
            disabled={!savable}
            onClick={this._onSaveTrip}
          >
            Save
          </Button>
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
        {this._renderTripStatus()}
      </Full>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { request, outbound } = ownProps
  const { savable } = state.callTaker.fieldTrip
  return {
    currentQuery: state.otp.currentQuery,
    savable: outbound ? savable?.outbound : savable?.inbound,
    status: outbound ? request.outboundTripStatus : request.inboundTripStatus,
    timeFormat: getTimeFormat(state.otp.config),
    trip: getTripFromRequest(request, outbound)
  }
}

const mapDispatchToProps = {
  deleteRequestTripItineraries: fieldTripActions.deleteRequestTripItineraries,
  planTrip: fieldTripActions.planTrip,
  saveRequestTripItineraries: fieldTripActions.saveRequestTripItineraries,
  setQueryParam: formActions.setQueryParam,
  viewRequestTripItineraries: fieldTripActions.viewRequestTripItineraries
}

export default connect(mapStateToProps, mapDispatchToProps)(TripStatus)
