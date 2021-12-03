import { FormattedMessage } from 'react-intl'
import moment from 'moment-timezone'
import React from 'react'

/**
 * Renders a time range e.g. 3:45pm-4:15pm according to the
 * react-intl default time format for the ambient locale.
 */
export default function FormattedTimeRange({
  endTime,
  startTime
}: {
  endTime: number
  startTime: number
}): JSX.Element {
  return (
    <FormattedMessage
      id="common.time.departureArrivalTimes"
      values={{
        endTime: moment(endTime),
        startTime: moment(startTime)
      }}
    />
  )
}
