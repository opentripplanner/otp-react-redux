import { FormattedMessage, FormattedTime } from 'react-intl'
import React from 'react'
import styled from 'styled-components'

import { MonitoredTripProps } from '../types'
import FormattedDuration from '../../util/formatted-duration'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'

const Divider = styled.span`
  margin: 0 7px;
`

const TripSummary = ({ monitoredTrip }: MonitoredTripProps): JSX.Element => {
  const { itinerary } = monitoredTrip
  const { duration, endTime, startTime } = itinerary
  return (
    <span>
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
      <Divider>•</Divider>
      <span aria-hidden>
        <FormattedDuration duration={duration} />
      </span>
    </span>
  )
}

export default TripSummary
