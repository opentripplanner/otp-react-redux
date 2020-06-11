import coreUtils from '@opentripplanner/core-utils'
import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'

import { getQueryParamsFromQueryString } from '../../util/query'
import ItinerarySummary from '../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

const TripSummary = ({ monitoredTrip }) => {
  const { itinerary, queryParams } = monitoredTrip
  const queryObj = getQueryParamsFromQueryString(queryParams)
  const { from, to } = queryObj

  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div>
      <div>From <b>{from.name}</b> to <b>{to.name}</b></div>
      <div className={`otp option default-itin active`}>
        <div className='header'>
          <span className='title'>Itinerary</span>{' '}
          <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
          <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
          <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
        </div>
      </div>
    </div>
  )
}

export default TripSummary
