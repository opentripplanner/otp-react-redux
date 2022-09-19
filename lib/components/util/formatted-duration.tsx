import { FormattedMessage, IntlShape } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

const { toHoursMinutesSeconds } = coreUtils.time

/**
 * Formats the given duration according to the selected locale.
 */
export default function FormattedDuration({
  duration
}: {
  duration: number
}): JSX.Element {
  const { hours, minutes } = toHoursMinutesSeconds(duration)
  return (
    <FormattedMessage
      id="common.time.tripDurationFormat"
      values={{ hours, minutes }}
    />
  )
}

/**
 * Non-component version of FormatDuration component above
 * Formats the given duration according to the selected locale.
 */
const formatDuration = (duration: number, intl: IntlShape): string => {
  const { hours, minutes } = toHoursMinutesSeconds(duration)
  return intl.formatMessage(
    { id: 'common.time.tripDurationFormat' },
    {
      hours,
      minutes
    }
  )
}
export { formatDuration }
