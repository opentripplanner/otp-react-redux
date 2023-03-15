import { FormattedMessage, IntlShape } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

const { toHoursMinutesSeconds } = coreUtils.time

/**
 * Formats the given duration according to the selected locale.
 */
export default function FormattedDuration({
  duration,
  includeSeconds
}: {
  duration: number
  includeSeconds?: boolean
}): JSX.Element {
  const { hours, minutes, seconds } = toHoursMinutesSeconds(duration)
  return (
    <FormattedMessage
      id="common.time.tripDurationFormat"
      values={{ hours, minutes, seconds: includeSeconds ? seconds : 0 }}
    />
  )
}

/**
 * Non-component version of FormatDuration component above
 * Formats the given duration according to the selected locale.
 */
export const formatDuration = (
  duration: number,
  intl: IntlShape,
  includeSeconds: boolean
): string => {
  const { hours, minutes, seconds } = toHoursMinutesSeconds(duration)
  return intl.formatMessage(
    { id: 'common.time.tripDurationFormat' },
    {
      hours,
      minutes,
      seconds: includeSeconds ? seconds : 0
    }
  )
}
