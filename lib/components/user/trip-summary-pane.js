import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ControlLabel } from 'react-bootstrap'

import { getActiveItineraries, getActiveSearch } from '../../util/state'
import ItinerarySummary from '../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

class TripSummaryPane extends Component {
  render () {
    const { activeItinerary, activeSearch, itinerary, /* monitoredTrip, */ pending } = this.props
    const { from, to } = activeSearch.query

    if (pending) {
      return <div>Loading...</div>
    } else if (itinerary) {
      // TODO: use the modern itinerary summary built for trip comparison.
      return (
        <div>
          <p>Below is a summary of your trip and its notification preferences.</p>

          <ControlLabel>[Trip Name]</ControlLabel>
          <div>From <b>{from.name}</b> to <b>{to.name}</b></div>
          <div className={`otp option default-itin active`}>
            <button className='header'>
              <span className='title'>Itinerary {activeItinerary + 1}</span>{' '}
              <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
              <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
              <ItinerarySummary itinerary={itinerary} />
            </button>
          </div>

          <p>Happens on: <b>[days]</b></p>
          <p>Notifications: <b>[Enabled]</b></p>
          <p>[Small] Exceptions:</p>
        </div>
      )
    } else {
      return <div>No itinerary to display.</div>
    }
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const pending = activeSearch ? activeSearch.pending : false
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const itineraries = getActiveItineraries(state.otp)
  return {
    activeItinerary,
    activeSearch,
    itinerary: activeItinerary != null && itineraries[activeItinerary],
    pending
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TripSummaryPane)
