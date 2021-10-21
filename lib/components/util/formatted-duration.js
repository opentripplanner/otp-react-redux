import moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'

/**
 * Formats the given duration according to the selected locale.
 */
export default function FormattedDuration ({duration}) {
  const dur = moment.duration(duration, 'seconds')
  const hours = dur.hours()
  const minutes = dur.minutes()
  return (
    <FormattedMessage
      id='common.time.tripDurationFormat'
      values={{hours, minutes}}
    />
  )
}

FormattedDuration.propTypes = {
  duration: PropTypes.number.isRequired
}
