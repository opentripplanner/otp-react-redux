import { formatDuration } from '@opentripplanner/core-utils/lib/time'
import React from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { getTripStatus, REALTIME_STATUS } from '../../util/viewer'

// If shown, keep the '5 min' portion of the status string on the same line.
export const DelayText = styled.span`
  white-space: nowrap;
`

export const MainContent = styled.div``

const Container = styled.div`
${props => props.withBackground
    ? `background-color: ${props.color};`
    : `color: ${props.color};`
}
`

const TimeStruck = styled.div`
  text-decoration: line-through;
`

const TimeBlock = styled.div`
  line-height: 1em;
  margin-bottom: 4px;
`

const STATUS = {
  EARLY: {
    color: '#337ab7',
    label: 'early'
  },
  LATE: {
    color: '#d9534f',
    label: 'late'
  },
  ON_TIME: {
    color: '#5cb85c',
    label: 'on time'
  },
  SCHEDULED: {
    label: 'scheduled'
  }
}

/**
 * This component renders a string such as '5 min late' or 'on time'
 * while keeping the '5 min' portion on the same line.
 *
 * If the formatted time/original time values (e.g. 5:11 pm) are provided, they
 * will be rendered above the status. Also, this can optionally be rendered with
 * a background color for a label-like presentation.
 */
const RealtimeStatusLabel = ({
  className,
  delay,
  isRealtime,
  onTimeThresholdDeltaSeconds,
  originalTime,
  time,
  withBackground
}) => {
  const status = getTripStatus(isRealtime, delay, onTimeThresholdDeltaSeconds)
  const isEarlyOrLate = status === REALTIME_STATUS.EARLY || status === REALTIME_STATUS.LATE
  // Use a default background color if the status object doesn't set a color
  // (e.g. for 'Scheduled' status), but only in withBackground mode.
  const color = STATUS[status].color || (withBackground && '#bbb')
  // Render time if provided.
  let renderedTime
  if (time) {
    // If transit vehicle is not on time, strike the original scheduled time
    // and display the updated time underneath.
    renderedTime = isEarlyOrLate
      ? (
        <TimeBlock>
          <TimeStruck>{originalTime}</TimeStruck>
          <div>{time}</div>
        </TimeBlock>
      )
      : <div>{time}</div>
  }
  return (
    <Container
      withBackground={withBackground}
      className={className}
      color={color}
    >
      {renderedTime}
      <MainContent>
        {isEarlyOrLate &&
          <DelayText>
            {formatDuration(Math.abs(delay))}
            {/* A spacer is needed between '5 min' and 'early/late'. */}
            {' '}
          </DelayText>
        }
        {STATUS[status].label}
      </MainContent>
    </Container>
  )
}

const mapStateToProps = state => ({
  onTimeThresholdDeltaSeconds: state.otp.config.onTimeThresholdDeltaSeconds
})

export default connect(mapStateToProps)(RealtimeStatusLabel)
