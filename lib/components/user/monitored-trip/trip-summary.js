import coreUtils from '@opentripplanner/core-utils'
import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'

import ItinerarySummary from '../../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

const TripSummary = ({ monitoredTrip }) => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, legs, startTime } = itinerary

  // Assuming the monitored itinerary has at least one leg:
  // - get the 'from' location of the first leg,
  // - get the 'to' location of the last leg.
  const from = legs[0].from
  const to = legs[legs.length - 1].to

  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div>
      <div>From <b>{from.name}</b> to <b>{to.name}</b></div>
      <div className={`otp option default-itin active`}>
        <div className='header'>
          <span className='title'>Itinerary</span>{' '}
          <span className='duration pull-right'>{formatDuration(duration)}</span>{' '}
          <span className='arrivalTime'>{formatTime(startTime)}—{formatTime(endTime)}</span>
          <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
        </div>
      </div>
    </div>
  )
}

export default TripSummary
