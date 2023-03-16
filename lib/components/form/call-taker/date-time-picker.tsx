import { connect } from 'react-redux'
import { format, toDate } from 'date-fns-tz'
import { getCurrentTime } from '@opentripplanner/core-utils/lib/time'
import { IntlShape, useIntl } from 'react-intl'
import { isMatch, parse } from 'date-fns'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import coreUtils from '@opentripplanner/core-utils'
import React, { useEffect, useState } from 'react'

const { getCurrentDate, OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } =
  coreUtils.time

function getDepartureOptions(intl: IntlShape) {
  return [
    {
      // Default option.
      text: intl.formatMessage({ id: 'components.DateTimeOptions.now' }),
      value: 'NOW'
    },
    {
      text: intl.formatMessage({ id: 'components.DateTimeOptions.departAt' }),
      value: 'DEPART'
    },
    {
      text: intl.formatMessage({ id: 'components.DateTimeOptions.arriveBy' }),
      value: 'ARRIVE'
    }
  ]
}

/**
 * Time formats passed to date-fns to parse the user's time input.
 */
const SUPPORTED_TIME_FORMATS = [
  'h:mmaaaaa',
  'h:mmaaaa',
  'hmmaaaaa',
  'haaaaa',
  'haaaa',
  'haaa',
  'hmmaaa',
  'hmmaaaa',
  'Hmm',
  'Hm',
  'H:mm',
  'H:m',
  'H',
  'HH:mm'
]

const safeFormat = (date: Date | string, time: string, options: any) => {
  try {
    return format(date, time, options)
  } catch (e) {
    console.warn(e)
  }
  return ''
}

type Props = {
  date?: string
  homeTimezone: string
  onKeyDown: () => void
  setQueryParam: ({
    date,
    departArrive,
    time
  }: {
    date: string
    departArrive: string
    time: string
  }) => void
  time?: string
  timeFormat: string
}
/**
 * Contains depart/arrive selector and time/date inputs for the admin-oriented
 * Call Taker form. A few unique features/behaviors to note:
 * - when "leave now" is selected the time/date will now stay up to date in the
 *   form and query params
 * - the time input will interpret various time formats so that
 *   users can quickly type a shorthand value (5p) and have that be parsed into
 *   the correct OTP format.
 * - when a user changes the date or time, "leave now" (if selected) will
 *   automatically switch to "depart at".

 * @type {Object}
 */

const DateTimeOptions = ({
  date: initialDate,
  homeTimezone,
  onKeyDown,
  setQueryParam,
  time: initialTime,
  timeFormat
}: Props) => {
  const [departArrive, setDepartArrive] = useState(
    initialDate || initialTime ? 'DEPART' : 'NOW'
  )
  const [date, setDate] = useState<string | undefined>(initialDate)
  const [time, setTime] = useState<string | undefined>(initialTime)

  const intl = useIntl()

  /**
   * Parse a time input expressed in the agency time zone.
   * @returns A date if the parsing succeeded, or null.
   */
  const parseInputAsTime = (
    timeInput: string = getCurrentTime(homeTimezone),
    date: string = getCurrentDate(homeTimezone)
  ) => {
    if (!timeInput) timeInput = getCurrentTime(homeTimezone)

    // Match one of the supported time formats
    const matchedTimeFormat = SUPPORTED_TIME_FORMATS.find((timeFormat) =>
      isMatch(timeInput, timeFormat)
    )
    if (matchedTimeFormat) {
      const resolvedDateTime = format(
        parse(timeInput, matchedTimeFormat, new Date()),
        'HH:mm:ss'
      )
      return toDate(`${date}T${resolvedDateTime}`)
    }
    return ''
  }

  const dateTime = parseInputAsTime(time, date)

  // Handler for setting the query parameters
  useEffect(() => {
    if (safeFormat(dateTime, OTP_API_DATE_FORMAT, {}) !== '' && setQueryParam) {
      setQueryParam({
        date: safeFormat(dateTime, OTP_API_DATE_FORMAT, {
          timeZone: homeTimezone
        }),
        departArrive,
        time: safeFormat(dateTime, OTP_API_TIME_FORMAT, {
          timeZone: homeTimezone
        })
      })
    }
  }, [dateTime, departArrive, homeTimezone, setQueryParam])

  // Handler for updating the time and date fields when NOW is selected
  useEffect(() => {
    if (departArrive === 'NOW') {
      setTime(getCurrentTime(homeTimezone))
      setDate(getCurrentDate(homeTimezone))
    }
  }, [departArrive, setTime, setDate, homeTimezone])

  const unsetNow = () => {
    if (departArrive === 'NOW') setDepartArrive('DEPART')
  }

  return (
    <>
      <select
        onBlur={(e) => setDepartArrive(e.target.value)}
        onChange={(e) => setDepartArrive(e.target.value)}
        onKeyDown={onKeyDown}
        value={departArrive}
      >
        {getDepartureOptions(intl).map(({ text, value }) => (
          <option key={value} value={value}>
            {text}
          </option>
        ))}
      </select>
      <OverlayTrigger
        overlay={
          <Tooltip id="time-tooltip">
            {safeFormat(dateTime, timeFormat, {
              timeZone: homeTimezone
            }) ||
              // TODO: there doesn't seem to be an intl object present?
              'Invalid Time'}
          </Tooltip>
        }
        placement="bottom"
        trigger={['focus', 'hover']}
      >
        <input
          className="datetime-slim"
          onChange={(e) => {
            setTime(e.target.value)
            unsetNow()
          }}
          onFocus={(e) => e.target.select()}
          onKeyDown={onKeyDown}
          style={{
            fontSize: 'inherit',
            lineHeight: '.8em',
            marginLeft: '3px',
            padding: '0px',
            width: '50px'
          }}
          // Don't use intl.formatTime, so that users can enter time in 12hr or 24hr format at their leisure.
          value={
            time && time?.length > 1
              ? time || format(dateTime, 'H:mm', { timeZone: homeTimezone })
              : time
          }
        />
      </OverlayTrigger>
      <input
        className="datetime-slim"
        disabled={!dateTime}
        onChange={(e) => {
          setDate(e.target.value)
          unsetNow()
        }}
        onKeyDown={onKeyDown}
        style={{
          fontSize: '14px',
          lineHeight: '1em',
          outline: 'none',
          width: '109px'
        }}
        type="date"
        value={safeFormat(dateTime, OTP_API_DATE_FORMAT, {
          timeZone: homeTimezone
        })}
      />
    </>
  )
}

// connect to the redux store
const mapStateToProps = (state: any) => {
  const { dateTime, homeTimezone } = state.otp.config
  return {
    homeTimezone,
    timeFormat: dateTime.timeFormat
  }
}

export default connect(mapStateToProps)(DateTimeOptions)
