import { format, utcToZonedTime } from 'date-fns-tz'
import { isSameDay } from 'date-fns'
import React, { ComponentType } from 'react'

import { IconWithText } from '../util/styledIcon'
import FormattedDayOfWeek from '../util/formatted-day-of-week'

interface Props {
  Icon?: ComponentType
  day: number
  homeTimezone: string
}

/**
 * Render a label with the day some transit data is valid, if the day is not today.
 */
const StopTimeDifferentDay = ({
  day,
  homeTimezone,
  Icon
}: Props): JSX.Element => {
  const now = new Date()
  const formattedDay = utcToZonedTime(day * 1000, homeTimezone)
  return (
    <>
      {/* If the service day is not today, add a label */}
      {!isSameDay(now, formattedDay) && (
        <IconWithText Icon={Icon}>
          <FormattedDayOfWeek
            // 'iiii' returns the long ISO day of the week (independent of browser locale).
            // See https://date-fns.org/v2.28.0/docs/format
            day={format(formattedDay, 'iiii', {
              timeZone: homeTimezone
            }).toLowerCase()}
          />
        </IconWithText>
      )}
    </>
  )
}

export default StopTimeDifferentDay
