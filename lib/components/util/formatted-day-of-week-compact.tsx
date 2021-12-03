import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React from 'react'

/**
 * Returns a FormattedMessage component for the compact day of week such that i18n IDs
 * are hardcoded and can be kept track of by format.js tools
 */
export default function FormattedDayOfWeekCompact({
  day
}: {
  day: string
}): JSX.Element | null {
  switch (day) {
    case 'monday':
      return <FormattedMessage id="common.daysOfWeekCompact.monday" />
    case 'tuesday':
      return <FormattedMessage id="common.daysOfWeekCompact.tuesday" />
    case 'wednesday':
      return <FormattedMessage id="common.daysOfWeekCompact.wednesday" />
    case 'thursday':
      return <FormattedMessage id="common.daysOfWeekCompact.thursday" />
    case 'friday':
      return <FormattedMessage id="common.daysOfWeekCompact.friday" />
    case 'saturday':
      return <FormattedMessage id="common.daysOfWeekCompact.saturday" />
    case 'sunday':
      return <FormattedMessage id="common.daysOfWeekCompact.sunday" />
    default:
      return null
  }
}

FormattedDayOfWeekCompact.propTypes = {
  day: PropTypes.string.isRequired
}

FormattedDayOfWeekCompact.defaultProps = {
  day: ''
}
