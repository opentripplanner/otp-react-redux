import { ClassicLegIcon } from '@opentripplanner/icons'
import React from 'react'
import { FormattedMessage } from 'react-intl'

import FormattedDuration from '../../util/formatted-duration'
import SpanWithSpace from '../../util/span-with-space'
import ItinerarySummary from '../../narrative/default/itinerary-summary'

const TripSummary = ({ monitoredTrip }) => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div
      className={`otp option default-itin`}
      style={{borderTop: '0px', padding: '0px'}}>
      <div className='header'>
        <SpanWithSpace className='title' margin={0.125}>
          <FormattedMessage id='components.TripSummary.itinerary' />
        </SpanWithSpace>
        <SpanWithSpace className='duration pull-right' margin={0.125}>
          <FormattedDuration duration={duration} />
        </SpanWithSpace>
        <span className='arrivalTime'>
          <FormattedMessage
            id='common.time.departureArrivalTimes'
            values={{
              endTime: endTime,
              startTime: startTime
            }}
          />
        </span>
        <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
      </div>
    </div>
  )
}

export default TripSummary
