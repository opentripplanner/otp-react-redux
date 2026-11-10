import { IntlShape } from 'react-intl'
type Status = 'early' | 'late' | 'on_time' | 'scheduled' | 'canceled' | 'added'
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
  status: Status
}): string => {
  const mins = intl.formatMessage(
    { id: 'common.time.tripDurationFormat' },
    { hours: 0, minutes: minutes, seconds: 0 }
  )
  return intl.formatMessage(
    { id: `components.RealtimeStatusLabel.${status.toLowerCase()}` },
    { minutes: mins }
  )
}

export default getRealtimeStatusLabel

export type { Status }
