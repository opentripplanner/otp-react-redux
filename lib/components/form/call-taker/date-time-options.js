import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, { Component } from 'react'
import { OverlayTrigger, Tooltip } from 'react-bootstrap'

const departureOptions = [
  {
    // Default option.
    value: 'NOW',
    children: 'Now'
  },
  {
    value: 'DEPART',
    children: 'Depart at'
  },
  {
    value: 'ARRIVE',
    children: 'Arrive by'
  }
]

const TIME_FORMATS = [
  'HH:mm:ss',
  'h:mm:ss a',
  'h:mm:ssa',
  'h:mm a',
  'h:mma',
  'h:mm',
  'HHmm',
  'hmm',
  'ha',
  'h',
  'HH:mm'
].map(format => `YYYY-MM-DDT${format}`)

function nowAsTimeString () {
  return moment().format(OTP_API_TIME_FORMAT)
}

export default class DateTimeOptions extends Component {
  state = {}

  componentDidMount () {
    this._startAutoRefresh()
  }

  componentWillUnmount () {
    this._stopAutoRefresh()
  }

  componentWillReceiveProps (nextProps) {
    const {departArrive} = nextProps
    // If departArrive has been changed to leave now, update time input to now.
    if (departArrive === 'NOW' && !this.props.departArrive !== 'NOW') {
      this.setState({timeInput: nowAsTimeString()})
    }
  }

  _startAutoRefresh = () => {
    console.log('starting auto refresh')
    const timer = window.setInterval(this._refreshDateTime, 1000)
    this.setState({ timer })
  }

  _stopAutoRefresh = () => {
    console.log('stopping auto refresh')
    window.clearInterval(this.state.timer)
    this.setState({timer: null})
  }

  _refreshDateTime = () => {
    const now = nowAsTimeString()
    this.setState({ timeInput: now })
    // Update query param if the current time has changed (i.e., on minute ticks).
    if (now !== this.props.time) {
      this.props.setQueryParam({
        date: moment().format(OTP_API_DATE_FORMAT),
        time: nowAsTimeString()
      })
    }
  }

  _setDepartArrive = evt => {
    const {value: departArrive} = evt.target
    if (departArrive === 'NOW') {
      // If setting to leave now, update date/time and start auto refresh to keep
      // form input in sync.
      this.props.setQueryParam({
        departArrive,
        date: moment().format(OTP_API_DATE_FORMAT),
        time: nowAsTimeString()
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

  handleDateChange = evt => {
    const {departArrive: prevDepartArrive} = this.props
    const params = { date: evt.target.value }
    // If previously set to leave now, change to depart at when date changes.
    if (prevDepartArrive === 'NOW') params.departArrive = 'DEPART'
    this.props.setQueryParam(params)
  }

  handleTimeFocus = evt => evt.target.select()

  handleTimeChange = evt => {
    if (this.state.timer) this._stopAutoRefresh()
    const {departArrive: prevDepartArrive} = this.props
    const timeInput = evt.target.value
    const date = moment().startOf('day').format('YYYY-MM-DD')
    const time = moment(date + 'T' + timeInput, TIME_FORMATS)
    const params = { time: time.format(OTP_API_TIME_FORMAT) }
    // If previously set to leave now, change to depart at when time changes.
    if (prevDepartArrive === 'NOW') params.departArrive = 'DEPART'
    this.props.setQueryParam(params)
    this.setState({timeInput})
  }

  render () {
    const {date, departArrive, time} = this.props
    const dateTime = moment(`${date} ${time}`)
    const cleanDate = dateTime.format('YYYY-MM-DD')
    const cleanTime = dateTime.format('HH:mm')
    return (
      <>
        <select
          onBlur={this._setDepartArrive}
          onKeyDown={this.props.onKeyDown}
          value={departArrive}
          onChange={this._setDepartArrive}>
          {departureOptions.map(o => (
            <option key={o.value} {...o} />
          ))}
        </select>
        <span style={{
          display: 'inline-flex'
        }}>
          <OverlayTrigger
            overlay={<Tooltip id='time-tooltip'>{cleanTime}</Tooltip>}
            placement='bottom'
          >
            <input
              style={{
                fontSize: 'small',
                lineHeight: '1em',
                marginLeft: '3px',
                padding: '1px 0px 0px 0px',
                width: '50px'
              }}
              onFocus={this.handleTimeFocus}
              onKeyDown={this.props.onKeyDown}
              onChange={this.handleTimeChange}
              value={this.state.timeInput}
            />
          </OverlayTrigger>
        </span>
        <input
          onKeyDown={this.props.onKeyDown}
          type='date'
          onChange={this.handleDateChange}
          style={{
            position: 'absolute',
            left: '146px',
            width: '101px',
            border: 'none',
            outline: 'none'
          }}
          value={cleanDate}
        />
      </>
    )
  }
}
