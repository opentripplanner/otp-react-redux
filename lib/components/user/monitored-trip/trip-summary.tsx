import { FormattedMessage, FormattedTime } from 'react-intl'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import FormattedDuration from '../../util/formatted-duration'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

const SummaryContainer = styled.div`
  margin-bottom: 10px;
`

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
  // @ts-expect-error TODO: add ModesAndRoutes to ItineraryBody attribute of ComponentContext
  const { ItineraryBody, LegIcon } = useContext(ComponentContext)
  const ModesAndRoutes = ItineraryBody.ModesAndRoutes
  return (
    <SummaryContainer>
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
      <ModesAndRoutes itinerary={itinerary} LegIcon={LegIcon} />
    </SummaryContainer>
  )
}

export default TripSummary
