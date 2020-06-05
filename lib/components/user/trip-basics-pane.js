import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { ButtonToolbar, ControlLabel, FormControl, FormGroup, ToggleButton, ToggleButtonGroup } from 'react-bootstrap'

import { getActiveItineraries, getActiveSearch } from '../../util/state'
import ItinerarySummary from '../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

class TripBasicsPane extends Component {
  _handleTripNameChange = e => {
    const { onMonitoredTripChange } = this.props
    onMonitoredTripChange({ tripName: e.target.value })
  }

  render () {
    const { activeItinerary, activeSearch, itinerary, /* monitoredTrip, */ pending } = this.props
    const { from, to } = activeSearch.query

    if (pending) {
      return <div>Loading...</div>
    } else if (itinerary) {
      // TODO: use the modern itinerary summary built for trip comparison.
      return (
        <div>
          <ControlLabel>Selected itinerary:</ControlLabel>
          <div>From <b>{from.name}</b> to <b>{to.name}</b></div>
          <div className={`otp option default-itin active`}>
            <button className='header'>
              <span className='title'>Itinerary {activeItinerary + 1}</span>{' '}
              <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
              <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
              <ItinerarySummary itinerary={itinerary} />
            </button>
          </div>

          <FormGroup>
            <ControlLabel>Please provide a name for this trip:</ControlLabel>
            <FormControl
              // onChange={this._handleTripNameChange}
              type='text'
              // value={monitoredTrip.tripName}
            />
          </FormGroup>

          <FormGroup>
            <ControlLabel>What days to you take this trip?</ControlLabel>
            <ButtonToolbar>
              <ToggleButtonGroup
                type='checkbox'
                defaultValue={[1, 2, 3, 4, 5]}
                // value={monitoredTrip.days}
              >
                <ToggleButton value={0}>Weekdays</ToggleButton>
                <ToggleButton value={1}>Monday</ToggleButton>
                <ToggleButton value={2}>Tuesday</ToggleButton>
                <ToggleButton value={3}>Wednesday</ToggleButton>
                <ToggleButton value={4}>Thursday</ToggleButton>
                <ToggleButton value={5}>Friday</ToggleButton>
                <ToggleButton value={6}>Saturday</ToggleButton>
                <ToggleButton value={7}>Sunday</ToggleButton>
                <ToggleButton value={8}>Weekends</ToggleButton>
              </ToggleButtonGroup>
            </ButtonToolbar>
          </FormGroup>

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

export default connect(mapStateToProps, mapDispatchToProps)(TripBasicsPane)
