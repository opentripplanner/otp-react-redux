import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Returns a FormattedMessage component for the compact day of week such that i18n IDs are
 * hardcoded and can be kept track of by format.js tools
 * TODO: More general FormattedDayOfWeek component that accepts a type of DayOfWeek
 * 'compact', or 'plural', etc. ?
 */
export default function FormattedDayOfWeek({ day }) {
  switch (day) {
    case 'monday':
      return <FormattedMessage id="common.daysOfWeek.monday" />
    case 'tuesday':
      return <FormattedMessage id="common.daysOfWeek.tuesday" />
    case 'wednesday':
      return <FormattedMessage id="common.daysOfWeek.wednesday" />
    case 'thursday':
      return <FormattedMessage id="common.daysOfWeek.thursday" />
    case 'friday':
      return <FormattedMessage id="common.daysOfWeek.friday" />
    case 'saturday':
      return <FormattedMessage id="common.daysOfWeek.saturday" />
    case 'sunday':
      return <FormattedMessage id="common.daysOfWeek.sunday" />
    default:
      return null
  }
}

FormattedDayOfWeek.propTypes = {
  day: PropTypes.string.isRequired
}

FormattedDayOfWeek.defaultProps = {
  day: ''
}
