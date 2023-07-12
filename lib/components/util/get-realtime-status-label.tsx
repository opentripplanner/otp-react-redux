import { IntlShape } from 'react-intl'
type status = 'early' | 'late' | 'on_time' | 'scheduled'
/**
 * Returns a FormattedMessage component for realtime status labels such that i18n IDs
 * are hardcoded and can be kept track of by format.js CLI tools
 */
const getRealtimeStatusLabel = ({
  intl,
  minutes,
  status
}: {
  intl: IntlShape
  minutes: number
  status: status
}): string => {
  const mins = intl.formatMessage(
    { id: 'common.time.tripDurationFormat' },
    { hours: 0, minutes: minutes, seconds: 0 }
  )
  switch (status.toLowerCase()) {
    case 'early':
      return intl.formatMessage(
        { id: 'components.RealtimeStatusLabel.early' },
        { minutes: mins }
      )
    case 'late':
      return intl.formatMessage(
        { id: 'components.RealtimeStatusLabel.late' },
        { minutes: mins }
      )
    case 'on_time':
      return intl.formatMessage({ id: 'components.RealtimeStatusLabel.onTime' })
    case 'scheduled':
      return intl.formatMessage({
        id: 'components.RealtimeStatusLabel.scheduled'
      })
    default:
      return ''
  }
}

export default getRealtimeStatusLabel

export type { status }
