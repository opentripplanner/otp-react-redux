import coreUtils from '@opentripplanner/core-utils'
import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'

import ItinerarySummary from '../../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

const TripSummary = ({ monitoredTrip }) => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div
      className={`otp option default-itin active`}
      style={{borderTop: '0px', padding: '0px'}}>
      <div className='header'>
        <span className='title'>Itinerary</span>{' '}
        <span className='duration pull-right'>{formatDuration(duration)}</span>{' '}
        <span className='arrivalTime'>{formatTime(startTime)}—{formatTime(endTime)}</span>
        <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
      </div>
    </div>
  )
}

export default TripSummary
