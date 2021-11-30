import { FormattedMessage } from 'react-intl'
import moment from 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Formats the given duration according to the selected locale.
 */
export default function FormattedDuration({
  duration
}: {
  duration: number
}): JSX.Element {
  const dur = moment.duration(duration, 'seconds')
  const hours = dur.hours()
  const minutes = dur.minutes()
  return (
    <FormattedMessage
      id="common.time.tripDurationFormat"
      values={{ hours, minutes }}
    />
  )
}

FormattedDuration.propTypes = {
  duration: PropTypes.number.isRequired
}
