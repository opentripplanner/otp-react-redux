import { FormattedMessage } from 'react-intl'
import React, { useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'
import FormattedDuration from '../../util/formatted-duration'
import SpanWithSpace from '../../util/span-with-space'

interface Props {
  // TODO: use a more complete definition of monitored trip.
  monitoredTrip: {
    itinerary: {
      duration: number
      endTime: number
      startTime: number
    }
  }
}

const TripSummary = ({ monitoredTrip }: Props): JSX.Element => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
  // @ts-expect-error No type on ComponentContext
  const context = useContext(ComponentContext)
  const ModesAndRoutes = context.ItineraryBody.ModesAndRoutes
  return (
    <div
      className="otp option default-itin"
      style={{ borderTop: '0px', padding: '0px' }}
    >
      <div className="header">
        <SpanWithSpace className="title" margin={0.125}>
          <FormattedMessage id="components.TripSummary.itinerary" />
        </SpanWithSpace>
        <SpanWithSpace className="duration pull-right" margin={0.125}>
          <FormattedDuration duration={duration} includeSeconds={false} />
        </SpanWithSpace>
        <span className="arrivalTime">
          <FormattedMessage
            id="common.time.departureArrivalTimes"
            values={{
              endTime: endTime,
              startTime: startTime
            }}
          />
        </span>
        <ModesAndRoutes itinerary={itinerary} LegIcon={context.LegIcon} />
      </div>
    </div>
  )
}

export default TripSummary
