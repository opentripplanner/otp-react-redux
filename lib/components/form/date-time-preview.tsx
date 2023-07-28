import { CalendarAlt } from '@styled-icons/fa-solid/CalendarAlt'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { connect } from 'react-redux'
import { toDate } from 'date-fns-tz'
import React from 'react'

import { IconWithText } from '../util/styledIcon'
import FormattedCalendarString from '../util/formatted-calendar-string'
import FormattedDateTimePreview from '../util/formatted-date-time-preview'

interface Props {
  date: string
  departArrive: string
  time: string
  timeZone: string
}

const DateTimePreview = ({
  date,
  departArrive,
  time,
  timeZone
}: Props): JSX.Element => {
  const timestamp = toDate(`${date} ${time}`, { timeZone }).valueOf()
  return (
    <>
      <IconWithText Icon={CalendarAlt}>
        <FormattedCalendarString date={date} timeZone={timeZone} />
      </IconWithText>
      <br />
      <IconWithText Icon={Clock}>
        <FormattedDateTimePreview
          departArrive={departArrive}
          time={timestamp}
        />
      </IconWithText>
    </>
  )
}

const mapStateToProps = (state: any) => {
  const { date, departArrive, time } = state.otp.currentQuery
  const { homeTimezone: timeZone } = state.otp.config
  return {
    date,
    departArrive,
    time,
    timeZone
  }
}

export default connect(mapStateToProps)(DateTimePreview)
