import React from 'react'
import { FormattedTime } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

import FormattedDuration from '../util/formatted-duration'
import FormattedRealtimeStatusLabel from '../util/formatted-realtime-status-label'
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
    color: '#D92923',
    label: 'late'
  },
  ON_TIME: {
    color: '#028602',
    label: 'onTime'
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
  onTimeThresholdSeconds,
  originalTime,
  time,
  withBackground
}) => {
  const status = getTripStatus(isRealtime, delay, onTimeThresholdSeconds)
  const isEarlyOrLate = status === REALTIME_STATUS.EARLY || status === REALTIME_STATUS.LATE
  // Use a default background color if the status object doesn't set a color
  // (e.g. for 'Scheduled' status), but only in withBackground mode.
  const color = STATUS[status].color || (withBackground && '#6D6C6C')
  // Render time if provided.
  let renderedTime
  if (time) {
    // If transit vehicle is not on time, strike the original scheduled time
    // and display the updated time underneath.
    renderedTime = isEarlyOrLate
      ? (
        <TimeBlock>
          <TimeStruck>
            <FormattedTime
              timeFormat='short'
              value={originalTime}
            />
          </TimeStruck>
          <div>
            <FormattedTime
              timeFormat='short'
              value={time}
            />
          </div>
        </TimeBlock>
      )
      : <div>
        <FormattedTime
          timeFormat='short'
          value={time}
        />
      </div>
  }
  return (
    <Container
      className={className}
      color={color}
      withBackground={withBackground}
    >
      {renderedTime}
      <MainContent>
        <FormattedRealtimeStatusLabel
          minutes={isEarlyOrLate && (
            <DelayText>
              <FormattedDuration duration={Math.abs(delay)} />
            </DelayText>
          )}
          status={STATUS[status].label}
        />
      </MainContent>
    </Container>
  )
}

const mapStateToProps = state => ({
  onTimeThresholdSeconds: state.otp.config.onTimeThresholdSeconds
})

export default connect(mapStateToProps)(RealtimeStatusLabel)
