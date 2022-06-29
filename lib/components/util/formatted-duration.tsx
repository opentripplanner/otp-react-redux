import { FormattedMessage, IntlShape } from 'react-intl'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Helper function to split out hours and minutes
 */
const splitDuration = (
  duration: number
): { hours: number; minutes: number } => {
  const dur = moment.duration(duration, 'seconds')
  return { hours: dur.hours(), minutes: dur.minutes() }
}

/**
 * Formats the given duration according to the selected locale.
 */
export default function FormattedDuration({
  duration
}: {
  duration: number
}): JSX.Element {
  const { hours, minutes } = splitDuration(duration)
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
  const { hours, minutes } = splitDuration(duration)
  return intl.formatMessage(
    { id: 'common.time.tripDurationFormat' },
    {
      hours,
      minutes
    }
  )
}
export { formatDuration }

FormattedDuration.propTypes = {
  duration: PropTypes.number.isRequired
}
