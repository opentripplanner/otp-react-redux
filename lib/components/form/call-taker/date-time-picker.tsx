import { connect } from 'react-redux'
import { format, OptionsWithTZ, toDate } from 'date-fns-tz'
import { getCurrentTime } from '@opentripplanner/core-utils/lib/time'
import { IntlShape, useIntl } from 'react-intl'
import { isMatch, parse } from 'date-fns'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import coreUtils from '@opentripplanner/core-utils'
import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useRef,
  useState
} from 'react'

import { AppReduxState, FilterType, SortType } from '../../../util/state-types'
import {
  DepartArriveDefaultSortDirectionMap,
  DepartArriveTypeMap,
  DepartArriveValue
} from '../date-time-modal'
import { updateItineraryFilter } from '../../../actions/narrative'

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
  'h:mm aaaaa',
  'h:mm aaaa',
  'hmm aaaaa',
  'h aaaaa',
  'h aaaa',
  'h aaa',
  'hmm aaa',
  'hmm aaaa',
  'Hmm',
  'Hm',
  'H:mm',
  'H:m',
  'H',
  'HH:mm'
]

const safeFormat = (date: Date | '', time: string, options?: OptionsWithTZ) => {
  if (date === '') return ''
  try {
    return format(date, time, options)
  } catch (e) {
    console.warn(e)
  }
  return ''
}
/**
 * Parse a time input expressed in the agency time zone.
 * @returns A date if the parsing succeeded, or null.
 */
const parseInputAsTime = (
  homeTimezone: string,
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

type Props = {
  date?: string
  departArrive?: DepartArriveValue
  homeTimezone: string
  importedUpdateItineraryFilter: (payload: FilterType) => void
  onKeyDown: () => void
  setQueryParam: ({
    date,
    departArrive,
    time
  }: {
    date?: string
    departArrive?: string
    time?: string
  }) => void
  sort: SortType
  syncSortWithDepartArrive?: boolean
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
  date,
  departArrive: initialDepartArrive,
  homeTimezone,
  importedUpdateItineraryFilter,
  onKeyDown,
  setQueryParam,
  sort,
  syncSortWithDepartArrive,
  time,
  timeFormat
}: Props) => {
  const [departArrive, setDepartArrive] = useState<DepartArriveValue>(
    date || time ? 'DEPART' : 'NOW'
  )
  const [typedTime, setTypedTime] = useState<string | undefined>(
    safeFormat(parseInputAsTime(homeTimezone, time, date), timeFormat, {
      timeZone: homeTimezone
    })
  )

  const timeRef = useRef(null)

  const intl = useIntl()

  const dateTime = parseInputAsTime(homeTimezone, time, date)

  // Update state when external state is updated
  useEffect(() => {
    if (typedTime !== time) {
      handleTimeChange(time || '')
    }
    // This effect is design to flow from state to component only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [time])
  useEffect(() => {
    if (initialDepartArrive && departArrive !== initialDepartArrive) {
      setDepartArrive(initialDepartArrive)
    }
    // This effect is design to flow from state to component only
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialDepartArrive])

  // Handler for setting the query parameters
  useEffect(() => {
    if (safeFormat(dateTime, OTP_API_DATE_FORMAT, {}) !== '' && setQueryParam) {
      setQueryParam({
        departArrive
      })
    }
  }, [dateTime, departArrive, homeTimezone, setQueryParam])

  const handleDepartArriveChange = useCallback(
    (e: ChangeEvent<HTMLSelectElement> | DepartArriveValue) => {
      const newValue =
        typeof e === 'string'
          ? (e as DepartArriveValue)
          : (e.target.value as DepartArriveValue)
      setDepartArrive(newValue)

      // Handler for updating the time and date fields when NOW is selected
      if (newValue === 'NOW') {
        handleTimeChange(getCurrentTime(homeTimezone))
        setQueryParam({
          date: getCurrentDate(homeTimezone)
        })
        setTypedTime(
          safeFormat(
            parseInputAsTime(
              homeTimezone,
              getCurrentTime(homeTimezone),
              getCurrentDate(homeTimezone)
            ),
            timeFormat,
            {
              timeZone: homeTimezone
            }
          )
        )
      }

      // Update sort type if needed
      if (
        syncSortWithDepartArrive &&
        DepartArriveTypeMap[newValue] !== sort.type
      ) {
        importedUpdateItineraryFilter({
          sort: {
            ...sort,
            direction:
              DepartArriveDefaultSortDirectionMap[departArrive] ||
              sort.direction,
            type: DepartArriveTypeMap[newValue]
          }
        })
      }
    },
    [syncSortWithDepartArrive, sort, importedUpdateItineraryFilter]
  )

  const unsetNow = useCallback(() => {
    if (departArrive === 'NOW') setDepartArrive('DEPART')
  }, [departArrive])

  const handleTimeChange = useCallback(
    (newTime: string) => {
      // Only update typed time if not actively typing
      if (timeRef.current !== document.activeElement) {
        setTypedTime(
          safeFormat(dateTime, timeFormat, {
            timeZone: homeTimezone
          }) || 'Invalid Time'
        )
        // otherwise update the time
      } else {
        setQueryParam({
          time:
            safeFormat(
              parseInputAsTime(homeTimezone, newTime, date),
              OTP_API_TIME_FORMAT,
              {
                timeZone: homeTimezone
              }
            ) || 'Invalid Time'
        })
      }
    },
    [dateTime, timeFormat, homeTimezone]
  )

  return (
    <>
      <button
        className="calltaker-now"
        onClick={() => handleDepartArriveChange('NOW')}
        // Button is disabled by default unless a config activates it
        style={{ display: 'none' }}
      >
        Now
      </button>
      <select
        onBlur={handleDepartArriveChange}
        onChange={handleDepartArriveChange}
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
          onBlur={() => {
            setTypedTime(
              safeFormat(dateTime, timeFormat, {
                timeZone: homeTimezone
              })
            )
          }}
          onChange={useCallback(
            (e) => {
              handleTimeChange(e.target.value)
              setTypedTime(e.target.value)
              unsetNow()
            },
            [handleTimeChange, setTypedTime, unsetNow]
          )}
          onFocus={(e) => e.target.select()}
          onKeyDown={onKeyDown}
          ref={timeRef}
          style={{
            fontSize: 'inherit',
            lineHeight: '.8em',
            marginLeft: '3px',
            padding: '0px',
            width: '65px'
          }}
          value={typedTime}
        />
      </OverlayTrigger>
      <input
        className="datetime-slim"
        disabled={!dateTime}
        onChange={useCallback(
          (e) => {
            if (!e.target.value) {
              e.preventDefault()
              // TODO: prevent selection from advancing to next field
              return
            }
            setQueryParam({
              date: e.target.value
            })
            unsetNow()
          },
          [unsetNow]
        )}
        onKeyDown={onKeyDown}
        style={{
          fontSize: '14px',
          lineHeight: '1em',
          outline: 'none',
          width: '120px'
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
const mapStateToProps = (state: AppReduxState) => {
  const { dateTime, homeTimezone, itinerary } = state.otp.config
  const syncSortWithDepartArrive = itinerary?.syncSortWithDepartArrive
  const { sort } = state.otp.filter
  return {
    homeTimezone,
    sort,
    syncSortWithDepartArrive,
    timeFormat: dateTime?.timeFormat || 'h:mm a'
  }
}
const mapDispatchToProps = {
  importedUpdateItineraryFilter: updateItineraryFilter
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeOptions)
