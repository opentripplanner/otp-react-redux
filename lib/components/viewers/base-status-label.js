import React from 'react'
import styled from 'styled-components'

// If shown, keep the '5 min' portion of the status string on the same line.
export const DelayText = styled.span`
  white-space: nowrap;
`

/**
 * A simple label that renders a string such as '5 min late' or 'on time'
 * while keeping the '5 min' portion on the same line.
 */
const BaseStatusLabel = ({ className, delay, style, tripStatus }) => {
  const { getFormattedDuration, status } = tripStatus
  let content

  if (typeof getFormattedDuration === 'function') {
    content = (
      <>
        <DelayText>{getFormattedDuration(delay)}</DelayText> {status}
      </>
    )
  } else {
    content = status
  }

  return (
    <div className={className} style={style}>{content}</div>
  )
}

export default BaseStatusLabel
