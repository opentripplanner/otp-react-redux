import moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'

export function FormattedTime ({startTime, endTime, timeFormat}) {
  return (
    <FormattedMessage
      id='common.time.departureArrivalTimes'
      values={{
        startTime: moment(startTime).format(timeFormat),
        endTime: moment(endTime).format(timeFormat)
      }}
    />
  )
}
