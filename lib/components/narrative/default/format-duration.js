import moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'

/**
 * Formats the given duration according to the selected locale.
 */
export function FormattedDuration ({duration, zeroHoursId, id}) {
  const dur = moment.duration(duration, 'seconds')
  const hours = dur.hours()
  const minutes = dur.minutes()
  if (hours === 0) {
    return (
      <FormattedMessage
        id={zeroHoursId}
        values={{ minutes }}
      />
    )
  } else {
    return (
      <FormattedMessage
        id={id}
        values={{ hours, minutes }}
      />
    )
  }
}
