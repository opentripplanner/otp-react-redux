import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { FormattedDuration } from '../../util/format-duration'
import { FormattedTime } from '../../util/format-time'
import ItinerarySummary from '../../narrative/default/itinerary-summary'

const TripSummary = ({ monitoredTrip, use24HourFormat }) => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
  const timeFormat = use24HourFormat ? 'H:mm' : 'h:mm a'
  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div
      className='otp option default-itin active'
      style={{borderTop: '0px', padding: '0px'}}
    >
      <div className='header'>
        <span className='title'>
          <FormattedMessage id='components.TripSummary.itinerary' />
        </span>{' '}
        <span className='duration pull-right'>
          <FormattedDuration duration={duration} />
        </span>{' '}
        <span className='arrivalTime'>
          <FormattedTime
            endTime={endTime}
            startTime={startTime}
            timeFormat={timeFormat}
          />
        </span>
        <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
      </div>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => ({
  use24HourFormat: state.user.loggedInUser?.use24HourFormat ?? false
})

export default connect(mapStateToProps)(TripSummary)
