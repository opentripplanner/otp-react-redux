/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { format, toDate } from 'date-fns-tz'
import { injectIntl } from 'react-intl'
import { isMatch, isSameMinute, parse } from 'date-fns'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'
import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'

const { getCurrentDate, OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } =
  coreUtils.time

function getDepartureOptions(intl) {
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
  'hmmaaaaa',
  'haaaaa',
  'Hmm',
  'Hm',
  'H:mm',
  'H:m',
  'H',
  'HH:mm'
]

/**
 * Convert input date object to date/time query params in OTP API format,
 * expressed in the specified time zone.
 */
function dateToQueryParams(date, timeZone) {
  return {
    date: format(date, OTP_API_DATE_FORMAT, { timeZone }),
    time: format(date, OTP_API_TIME_FORMAT, { timeZone })
  }
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
class DateTimeOptions extends Component {
  state = {
    timeInput: ''
  }

  componentDidMount() {
    if (this.props.departArrive === 'NOW') {
      this._startAutoRefresh()
    }
  }

  componentWillUnmount() {
    this._stopAutoRefresh()
  }

  componentDidUpdate(prevProps) {
    const { date, departArrive, time } = this.props
    const dateTime = this.dateTimeWithTz()
    const parsedTime = this.parseInputAsTime(this.state.timeInput, date)
    if (parsedTime) {
      // Update time input if time changes and the parsed time does not match what
      // the user originally input (this helps avoid changing the time input while
      // the user is simultaneously updating it).
      if (prevProps.time !== time && !isSameMinute(parsedTime, dateTime)) {
        this._updateTimeInput(dateTime)
      }
    }
    // If departArrive has been changed to leave now, begin auto refresh.
    if (departArrive !== prevProps.departArrive) {
      if (departArrive === 'NOW') {
        this._startAutoRefresh()
        this.setState({ inputTime: null })
      } else this._stopAutoRefresh()
    }
  }

  _updateTimeInput = (time) => {
    // If auto-updating time input (for leave now), use short 24-hr format to
    // avoid writing a value that is too long for the time input's width.
    // The time is expressed in the agency's home time zone.
    // console.log(time, format(time, 'H:mm', { timeZone: this.props.homeTimezone }))
    this.setState({
      timeInput: format(time, 'H:mm', { timeZone: this.props.homeTimezone })
    })
  }

  _startAutoRefresh = () => {
    // Stop any timer that was there before creating a new timer.
    const { timer } = this.state
    if (timer) window.clearInterval(timer)
    const newTimer = window.setInterval(this._refreshDateTime, 1000)
    this.setState({ timer: newTimer })
    // Immediately start
    this._refreshDateTime(true)
  }

  _stopAutoRefresh = () => {
    window.clearInterval(this.state.timer)
    this.setState({ timer: null })
  }

  _refreshDateTime = (initial = false) => {
    const now = new Date()
    const dateTimeParams = dateToQueryParams(now, this.props.homeTimezone)
    // Update query param if the current time has changed (i.e., on minute ticks).
    if (initial || dateTimeParams.time !== this.props.time) {
      this.props.setQueryParam(dateTimeParams)
    }
  }

  _setDepartArrive = (evt) => {
    const { value: departArrive } = evt.target
    if (departArrive === 'NOW') {
      const now = new Date()
      // If setting to leave now, update date/time to "now" in the agency's times zone
      // and start auto refresh to keep form input in sync.
      this.setState({ inputTime: null })
      this.props.setQueryParam({
        departArrive,
        ...dateToQueryParams(now, this.props.homeTimezone)
      })
      if (!this.state.timer) {
        this._startAutoRefresh()
      }
    } else {
      // If set to depart at/arrive by, stop auto refresh.
      this._stopAutoRefresh()
      this.props.setQueryParam({ departArrive })
    }
  }

  handleDateChange = (evt) =>
    this.handleDateTimeChange({ date: evt.target.value })

  /**
   * Handler that should be used when date or time is manually updated. This
   * will also update the departArrive value if need be.
   */
  handleDateTimeChange = (params) => {
    const { departArrive: prevDepartArrive } = this.props
    // If previously set to leave now, change to depart at when time changes.
    if (prevDepartArrive === 'NOW') params.departArrive = 'DEPART'
    this.props.setQueryParam(params)
  }

  /**
   * Select input string when time input is focused by user (for quick changes).
   */
  handleTimeFocus = (evt) => evt.target.select()

  /**
   * Parse a time input expressed in the agency time zone.
   * @returns A date if the parsing succeeded, or null.
   */
  parseInputAsTime = (
    timeInput,
    date = getCurrentDate(this.props.homeTimezone)
  ) => {
    // Match one of the supported time formats
    const matchedTimeFormat = SUPPORTED_TIME_FORMATS.find((timeFormat) =>
      isMatch(timeInput, timeFormat)
    )
    if (matchedTimeFormat) {
      const resolvedDateTime = format(
        parse(timeInput, matchedTimeFormat, new Date()),
        'HH:mm:ss'
      )
      return toDate(`${date}T${resolvedDateTime}`, {
        timeZone: this.props.homeTimeZone
      })
    }
    return null
  }

  dateTimeWithTz = () => this.parseInputAsTime(this.props.time, this.props.date)

  handleTimeChange = (evt) => {
    if (this.state.timer) this._stopAutoRefresh()
    const timeInput = evt.target.value
    const parsedTime = this.parseInputAsTime(timeInput)
    if (parsedTime) {
      this.handleDateTimeChange({
        time: format(parsedTime, OTP_API_TIME_FORMAT, {
          timeZone: this.props.homeTimeZone
        })
      })
    }
    this.setState({ timeInput })
  }

  render() {
    const { departArrive, homeTimezone, intl, onKeyDown, timeFormat } =
      this.props
    const { timeInput } = this.state
    const dateTime = this.dateTimeWithTz()
    const nowFormatted = format(dateTime, 'H:mm', {
      timeZone: homeTimezone
    })

    return (
      <>
        <select
          onBlur={this._setDepartArrive}
          onChange={this._setDepartArrive}
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
            <Tooltip id="time-tooltip">{format(dateTime, timeFormat)}</Tooltip>
          }
          placement="bottom"
          trigger={['focus', 'hover']}
        >
          <input
            className="datetime-slim"
            onChange={this.handleTimeChange}
            onFocus={this.handleTimeFocus}
            onKeyDown={onKeyDown}
            style={{
              fontSize: 'inherit',
              lineHeight: '.8em',
              marginLeft: '3px',
              padding: '0px',
              width: '50px'
            }}
            // Don't use intl.formatTime, so that users can enter time in 12hr or 24hr format at their leisure.
            value={departArrive === 'NOW' ? nowFormatted : timeInput}
          />
        </OverlayTrigger>
        <input
          className="datetime-slim"
          onChange={this.handleDateChange}
          onKeyDown={onKeyDown}
          style={{
            fontSize: '14px',
            lineHeight: '1em',
            outline: 'none',
            width: '109px'
          }}
          type="date"
          value={format(dateTime, OTP_API_DATE_FORMAT, {
            timeZone: homeTimezone
          })}
        />
      </>
    )
  }
}

// connect to the redux store
const mapStateToProps = (state) => {
  const { dateTime, homeTimezone } = state.otp.config
  return {
    homeTimezone,
    timeFormat: dateTime.timeFormat
  }
}

export default connect(mapStateToProps)(injectIntl(DateTimeOptions))
