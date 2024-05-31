import { CalendarAlt } from '@styled-icons/fa-solid/CalendarAlt'
import { Clock } from '@styled-icons/fa-regular/Clock'
import { connect } from 'react-redux'
import { decodeQueryParams, StringParam } from 'serialize-query-params'
import { toDate } from 'date-fns-tz'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import { IconWithText } from '../util/styledIcon'
import FormattedCalendarString from '../util/formatted-calendar-string'
import FormattedDateTimePreview from '../util/formatted-date-time-preview'

import { DepartArriveValue } from './date-time-modal'

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

const queryParamConfig = {
  date: StringParam,
  departArrive: StringParam,
  time: StringParam
}

const mapStateToProps = (state: any) => {
  const { homeTimezone: timeZone } = state.otp.config
  const urlSearchParams = new URLSearchParams(state.router.location.search)
  const { date, departArrive, time } = decodeQueryParams(queryParamConfig, {
    date: urlSearchParams.get('date'),
    departArrive: urlSearchParams.get('departArrive'),
    time: urlSearchParams.get('time')
  })
  return {
    date: date || coreUtils.time.getCurrentDate(),
    departArrive: (departArrive as DepartArriveValue) || 'NOW',
    time: time || coreUtils.time.getCurrentTime(),
    timeZone
  }
}

export default connect(mapStateToProps)(DateTimePreview)
