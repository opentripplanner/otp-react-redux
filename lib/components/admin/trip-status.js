/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { format } from 'date-fns'
import { getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

import * as fieldTripActions from '../../actions/field-trip'
import * as formActions from '../../actions/form'
import { getTripFromRequest, parseDate } from '../../util/call-taker'

import { Bold, Button, Full, Header, Para } from './styled'
import FieldTripStatusIcon from './field-trip-status-icon'

class TripStatus extends Component {
  _formatTime = (time) => format(parseDate(time), this.props.timeFormat)

  _onDeleteTrip = () => {
    const { deleteRequestTripItineraries, intl, request, trip } = this.props
    if (!window.confirm('Are you sure you want to delete the planned trip?')) {
      return
    }
    deleteRequestTripItineraries(request, trip.id, intl)
  }

  _onPlanTrip = () => {
    const { intl, outbound, planTrip, request, status, trip } = this.props
    if (status && trip) {
      if (
        !window.confirm(
          'Re-planning this trip will cause the trip planner to avoid the currently saved trip. Are you sure you want to continue?'
        )
      ) {
        return
      }
    }
    planTrip(request, outbound, intl)
  }

  _onSaveTrip = () => {
    const { intl, outbound, request, saveRequestTripItineraries } = this.props
    saveRequestTripItineraries(request, outbound, intl)
  }

  _onViewTrip = () => {
    const { outbound, request, viewRequestTripItineraries } = this.props
    viewRequestTripItineraries(request, outbound)
  }

  _tripIsPlanned = () => Boolean(this.props.status && this.props.trip)

  _renderTripStatus = () => {
    const { trip } = this.props
    if (!this._tripIsPlanned()) {
      return <Para>No itineraries planned! Click Plan to plan trip.</Para>
    }
    return (
      <>
        <Para>
          {trip.groupItineraries.length} group itineraries, planned by{' '}
          {trip.createdBy} at {trip.timeStamp}
        </Para>
        <Para>
          <Button bsSize="xs" onClick={this._onViewTrip}>
            View
          </Button>
          <Button bsSize="xs" onClick={this._onDeleteTrip}>
            Delete
          </Button>
        </Para>
      </>
    )
  }

  render() {
    const { outbound, request, saveable } = this.props
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
          <FieldTripStatusIcon ok={this._tripIsPlanned()} />
          {outbound ? 'Outbound' : 'Inbound'} trip
          <Button bsSize="xs" onClick={this._onPlanTrip}>
            Plan
          </Button>
          <Button bsSize="xs" disabled={!saveable} onClick={this._onSaveTrip}>
            Save
          </Button>
        </Header>
        <Para>
          From <Bold>{start}</Bold> to <Bold>{end}</Bold>
        </Para>
        {outbound ? (
          <Para>Arriving at {this._formatTime(arriveDestinationTime)}</Para>
        ) : (
          <>
            <Para>
              Leave at {this._formatTime(leaveDestinationTime)}, due back at{' '}
              {this._formatTime(arriveSchoolTime)}
            </Para>
          </>
        )}
        {this._renderTripStatus()}
      </Full>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { outbound, request } = ownProps
  const { saveable } = state.callTaker.fieldTrip
  return {
    currentQuery: state.otp.currentQuery,
    saveable: outbound ? saveable?.outbound : saveable?.inbound,
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

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(TripStatus))
