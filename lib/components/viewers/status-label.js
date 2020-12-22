import React from 'react'
import styled from 'styled-components'

import { getTripStatus } from '../../util/viewer'

/**
 * Renders a colored label denoting a trip realtime status.
 */
const StatusLabel = ({ stopTime }) => {
  const { departureDelay: delay, realtimeState } = stopTime
  const preset = getTripStatus(realtimeState === 'UPDATED', delay)

  return (
    <span className='status-label' style={{ backgroundColor: preset.color }}>
      <BaseStatusLabel delay={delay} preset={preset} />
    </span>
  )
}

// Keep the '5 min' string on the same line.
export const DelayText = styled.span`
  white-space: nowrap;
`

/**
 * A simple label that renders a string such as '5 min late' or 'on time'
 * while keeping the '5 min' portion on the same line.
 */
export const BaseStatusLabel = ({ delay, preset }) => {
  const { getFormattedDuration, status } = preset

  if (getFormattedDuration) {
    return (
      <>
        <DelayText>{getFormattedDuration(delay)}</DelayText> {status}
      </>
    )
  }

  return <>{status}</>
}

export default StatusLabel
