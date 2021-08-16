import moment from 'moment-timezone'
import { FormattedMessage } from 'react-intl'

export function FormattedTime ({endTime, startTime, timeFormat}) {
  return (
    <FormattedMessage
      id='common.time.departureArrivalTimes'
      values={{
        endTime: moment(endTime).format(timeFormat),
        startTime: moment(startTime).format(timeFormat)
      }}
    />
  )
}
