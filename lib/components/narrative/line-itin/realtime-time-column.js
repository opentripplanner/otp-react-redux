import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import {
  legType,
  timeOptionsType
} from '@opentripplanner/core-utils/lib/types'
import { formatTime } from '@opentripplanner/core-utils/lib/time'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

import { getTripStatus, TRIP_STATUS } from '../../../util/viewer'
import BaseStatusLabel, { DelayText } from '../../viewers/base-status-label'

const TimeStruck = styled.div`
  text-decoration: line-through;
`

const TimeBlock = styled.div`
  line-height: 1em;
  margin-bottom: 4px;
`

const StyledStatusLabel = styled(BaseStatusLabel)`
  font-size: 80%;
  line-height: 1em;
  ${DelayText} {
    display: block;
  }
`
/**
 * This component displays the scheduled departure/arrival time for a leg,
 * and, for transit legs, displays any delays or earliness where applicable.
 */
function RealtimeTimeColumn ({
  isDestination,
  leg,
  timeOptions
}) {
  const time = isDestination ? leg.endTime : leg.startTime
  const formattedTime = time && formatTime(time, timeOptions)
  const isTransitLeg = isTransit(leg.mode)
  const isRealtimeTransitLeg = isTransitLeg && leg.realTime

  // For non-transit legs show only the scheduled time.
  if (!isTransitLeg) {
    return <div>{formattedTime}</div>
  }

  const delaySeconds = isDestination ? leg.arrivalDelay : leg.departureDelay
  const originalTimeMillis = time - delaySeconds * 1000
  const originalFormattedTime =
    originalTimeMillis && formatTime(originalTimeMillis, timeOptions)

  const status = getTripStatus(isRealtimeTransitLeg, delaySeconds)
  const isEarlyOrLate = status === TRIP_STATUS.EARLY || status === TRIP_STATUS.LATE

  // If the transit vehicle is not on time, strike the original scheduled time
  // and display the updated time underneath.
  const renderedTime = isEarlyOrLate
    ? (
      <TimeBlock>
        <TimeStruck>{originalFormattedTime}</TimeStruck>
        <div>{formattedTime}</div>
      </TimeBlock>
    )
    : <div>{formattedTime}</div>

  return (
    <div style={{ color: status.color }}>
      {renderedTime}
      <StyledStatusLabel delay={delaySeconds} tripStatus={status} />
    </div>
  )
}

RealtimeTimeColumn.propTypes = {
  isDestination: PropTypes.bool.isRequired,
  leg: legType.isRequired,
  timeOptions: timeOptionsType
}

RealtimeTimeColumn.defaultProps = {
  timeOptions: null
}

export default RealtimeTimeColumn
