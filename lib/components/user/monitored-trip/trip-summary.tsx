import { FormattedMessage, FormattedTime } from 'react-intl'
import React, { useContext } from 'react'

import { ComponentContext } from '../../../util/contexts'
import FormattedDuration from '../../util/formatted-duration'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

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
        {/* Set up invisible "labels" for each itinerary field, and comma, so that the output of screen readers is more intelligible. */}
        <InvisibleA11yLabel>
          <FormattedMessage id="components.TripSummary.leaveAt" />
        </InvisibleA11yLabel>
        <FormattedTime value={startTime} />—
        <InvisibleA11yLabel>
          <FormattedMessage id="components.TripSummary.arriveAt" />
        </InvisibleA11yLabel>
        <FormattedTime value={endTime} />
        <InvisibleA11yLabel>, </InvisibleA11yLabel>
        <span aria-hidden className="pull-right">
          <FormattedDuration duration={duration} />
        </span>
        <ModesAndRoutes itinerary={itinerary} LegIcon={context.LegIcon} />
      </div>
    </div>
  )
}

export default TripSummary
