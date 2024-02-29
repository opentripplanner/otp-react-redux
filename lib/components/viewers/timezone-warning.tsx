import { format } from 'date-fns-tz'
import { FormattedMessage } from 'react-intl'
import { InfoCircle } from '@styled-icons/fa-solid/InfoCircle'
import dateFnsUSLocale from 'date-fns/locale/en-US'
import React from 'react'

import { IconWithText } from '../util/styledIcon'

interface Props {
  /**
   * A reference date to determine the correct timezone code that accounts for daylight saving.
   * Defaults to "today".
   */
  date?: number | Date
  homeTimezone: string
}

/**
 * Display a banner about the departure timezone if user's timezone is not the configured 'homeTimezone'
 * (e.g. cases where a user in New York looks at a schedule in Los Angeles).
 */
const TimezoneWarning = ({
  date = Date.now(),
  homeTimezone
}: Props): JSX.Element => {
  const timezoneCode = format(date, 'z', {
    // To avoid ambiguities for now, use the English-US timezone abbreviations ("EST", "PDT", etc.)
    locale: dateFnsUSLocale,
    timeZone: homeTimezone
  })

  return (
    <IconWithText Icon={InfoCircle}>
      <FormattedMessage
        id="components.StopViewer.timezoneWarning"
        values={{ timezoneCode: <strong>{timezoneCode}</strong> }}
      />
    </IconWithText>
  )
}

export default TimezoneWarning
