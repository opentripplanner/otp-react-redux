import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import {
  legType,
  timeOptionsType
} from '@opentripplanner/core-utils/lib/types'
import { formatTime } from '@opentripplanner/core-utils/lib/time'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

const TimeText = styled.div``

const TimeStruck = styled.div`
  text-decoration: line-through;
`

const TimeBlock = styled.div`
  line-height: 1em;
  margin-bottom: 4px;
`

const TimeColumnBase = styled.div``

const StatusText = styled.div`
  color: #bbb;
  font-size: 80%;
  line-height: 1em;
`

const DelayText = styled.span`
  display: block;
  white-space: nowrap;
`

// Reusing stop viewer colors.
const TimeColumnOnTime = styled(TimeColumnBase)`
  ${TimeText}, ${StatusText} {
    color: #5cb85c;
  }
`
const TimeColumnEarly = styled(TimeColumnBase)`
  ${TimeText}, ${StatusText} {
    color: #337ab7;
  }
`
const TimeColumnLate = styled(TimeColumnBase)`
  ${TimeText}, ${StatusText} {
    color: #d9534f;
  }
`

/**
 * This component displays the scheduled departure/arrival time for a leg,
 * and, for transit legs, displays any delays or earliness where applicable.
 */
export default function RealtimeTimeColumn ({
  isDestination,
  leg,
  timeOptions
}) {
  const time = isDestination ? leg.endTime : leg.startTime
  const formattedTime = time && formatTime(time, timeOptions)
  const isTransitLeg = isTransit(leg.mode)

  // For non-real-time legs, show only the scheduled time,
  // except for transit legs where we add the "scheduled" text underneath.
  if (!leg.realTime) {
    return (
      <>
        <TimeText>{formattedTime}</TimeText>
        {isTransitLeg && <StatusText>scheduled</StatusText>}
      </>
    )
  }

  // Delay in seconds.
  const delay = isDestination ? leg.arrivalDelay : leg.departureDelay
  // Time is in milliseconds.
  const originalTime = time - delay * 1000
  const originalFormattedTime =
    originalTime && formatTime(originalTime, timeOptions)

  // TODO: refine on-time thresholds.
  // const isOnTime = delay >= -60 && delay <= 120;
  const isOnTime = delay === 0

  let statusText
  let TimeColumn = TimeColumnBase
  if (isOnTime) {
    statusText = 'on time'
    TimeColumn = TimeColumnOnTime
  } else if (delay < 0) {
    statusText = 'early'
    TimeColumn = TimeColumnEarly
  } else if (delay > 0) {
    statusText = 'late'
    TimeColumn = TimeColumnLate
  }

  // Absolute delay in rounded minutes, for display purposes.
  const delayInMinutes = Math.abs(
    Math.round((isDestination ? leg.arrivalDelay : leg.departureDelay) / 60)
  )

  let renderedTime
  if (!isOnTime) {
    // If the transit vehicle is not on time, strike the original scheduled time
    // and display the updated time underneath.
    renderedTime = (
      <TimeBlock>
        {!isOnTime && <TimeStruck>{originalFormattedTime}</TimeStruck>}
        <TimeText>{formattedTime}</TimeText>
      </TimeBlock>
    )
  } else {
    renderedTime = <TimeText>{formattedTime}</TimeText>
  }

  return (
    <TimeColumn>
      {renderedTime}
      <StatusText>
        {/* Keep the '5 min' string on the same line. */}
        {!isOnTime && <DelayText>{`${delayInMinutes} min`}</DelayText>}
        {statusText}
      </StatusText>
    </TimeColumn>
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
