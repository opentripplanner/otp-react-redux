import moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'

export function FormattedTime ({startTime, endTime, timeFormat, id}) {
  return (
    <FormattedMessage
      id={id}
      values={{
        startTime: moment(startTime).format(timeFormat),
        endTime: moment(endTime).format(timeFormat)
      }}
    />
  )
}
