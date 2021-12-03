import { FormattedDate, FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'
import PropTypes from 'prop-types'
import React from 'react'

import FormattedDayOfWeek from './formatted-day-of-week'

const { OTP_API_DATE_FORMAT } = coreUtils.time

/**
 * Returns a FormattedMessage component for date time preview calendar strings such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const FormattedCalendarString = ({ date }) => {
  const previewDate = moment(date, OTP_API_DATE_FORMAT)
  const today = moment().startOf('day')
  const compareDate = previewDate.clone().startOf('day')
  const days = compareDate.diff(today, 'days')

  // Mimic moment.calendar logic (translation strings must come from language files)
  if (days > -7 && days < -1) {
    const dayId = previewDate.format('dddd').toLowerCase()
    const formattedDayOfWeek = <FormattedDayOfWeek day={dayId} />
    return (
      <FormattedMessage
        id="components.DateTimePreview.lastWeek"
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
    const dayId = previewDate.format('dddd').toLowerCase()
    return <FormattedDayOfWeek day={dayId} />
  } else {
    return <FormattedDate value={previewDate.valueOf()} />
  }
}

FormattedCalendarString.propTypes = {
  date: PropTypes.string
}

export default FormattedCalendarString
