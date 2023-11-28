import { differenceInDays } from 'date-fns'
import { format, toDate } from 'date-fns-tz'
import { FormattedDate, FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import { isBlank } from '../../util/ui'

import FormattedDayOfWeek from './formatted-day-of-week'

const { getCurrentDate } = coreUtils.time

interface Props {
  date: string
  timeZone: string
}

/**
 * Returns a FormattedMessage component for date time preview calendar strings such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const FormattedCalendarString = ({ date, timeZone }: Props): JSX.Element => {
  if (isBlank(date)) return <>---</>

  // Dates are expressed in the agency's timezone.
  const today = toDate(getCurrentDate(timeZone), { timeZone })
  const compareDate = toDate(date, { timeZone })
  const days = differenceInDays(compareDate, today)
  const dayId = format(compareDate, 'eeee').toLowerCase()

  if (days > -7 && days < -1) {
    const formattedDayOfWeek = <FormattedDayOfWeek day={dayId} />
    return (
      <FormattedMessage
        id="components.DateTimePreview.dayLastWeek"
        values={{ formattedDayOfWeek }}
      />
    )
  } else if (days === -1) {
    return <FormattedMessage id="common.dateExpressions.yesterday" />
  } else if (days === 0) {
    return <FormattedMessage id="common.dateExpressions.today" />
  } else if (days === 1) {
    return <FormattedMessage id="common.dateExpressions.tomorrow" />
  } else if (days > 1 && days < 7) {
    return <FormattedDayOfWeek day={dayId} />
  } else {
    return <FormattedDate value={compareDate} />
  }
}

export default FormattedCalendarString
