import { FormattedMessage } from 'react-intl'

/**
 * Returns a FormattedMessage component for the compact day of week such that i18n IDs
 * are hardcoded and can be kept track of by format.js tools
 */
export default function FormattedDayOfWeekCompact ({day}) {
  switch (day) {
    case 'monday':
      return <FormattedMessage id='common.daysOfWeekCompact.monday' />
    case 'tuesday':
      return <FormattedMessage id='common.daysOfWeekCompact.tuesday' />
    case 'wednesday':
      return <FormattedMessage id='common.daysOfWeekCompact.wednesday' />
    case 'thursday':
      return <FormattedMessage id='common.daysOfWeekCompact.thursday' />
    case 'friday':
      return <FormattedMessage id='common.daysOfWeekCompact.friday' />
    case 'saturday':
      return <FormattedMessage id='common.daysOfWeekCompact.saturday' />
    case 'sunday':
      return <FormattedMessage id='common.daysOfWeekCompact.sunday' />
    default:
      return null
  }
}
