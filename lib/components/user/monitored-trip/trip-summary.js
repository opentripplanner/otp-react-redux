import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'
import { FormattedMessage, FormattedTime } from 'react-intl'

import FormattedDuration from '../../util/formatted-duration'
import ItinerarySummary from '../../narrative/default/itinerary-summary'

const TripSummary = ({ monitoredTrip }) => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
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
          <FormattedMessage
            id='common.time.departureArrivalTimes'
            values={{
              endTime: <FormattedTime value={endTime} />,
              startTime: <FormattedTime value={startTime} />
            }}
          />
        </span>
        <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
      </div>
    </div>
  )
}

export default TripSummary
