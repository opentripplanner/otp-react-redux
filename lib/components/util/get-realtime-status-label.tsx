import { IntlShape } from 'react-intl'

/**
 * Status values from the realtimeStatus field of OTP StopTime objects.
 * ON_TIME status is mapped to i18n strings under RealtimeStatusLabel > on_time
 * (snake case in that entry comes from calling toLowerCase()).
 */
type Status = 'EARLY' | 'LATE' | 'ON_TIME' | 'SCHEDULED' | 'CANCELED' | 'ADDED'
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
