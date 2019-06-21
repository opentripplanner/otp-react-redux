// import moment from 'moment'
import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl, Row, Col, Button } from 'react-bootstrap'
// import { SingleDatePicker } from 'react-dates'
import { connect } from 'react-redux'
import moment from 'moment'

import { setQueryParam } from '../../actions/form'
import { getTimeFormat, getDateFormat } from '../../util/time'

class DateTimeSelector extends Component {
  static propTypes = {
    date: PropTypes.string,
    departArrive: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.object,
    label: PropTypes.string,
    profile: PropTypes.bool,
    startTime: PropTypes.string,
    endTime: PropTypes.string,

    setQueryParam: PropTypes.func,
    type: PropTypes.string // replace with locationType?
  }

  constructor (props) {
    super(props)
    this.state = {
      dateFocused: false
    }
  }

  _onDateChange = (evt) => {
    this.props.setQueryParam({ date: evt.target.value })
  }

  _onDayOfWeekChange = evt => {
    this.props.setQueryParam({
      date: moment().weekday(evt.target.value).format('YYYY-MM-DD')
    })
  }

  _onEndTimeChange = (evt) => {
    this.props.setQueryParam({ endTime: evt.target.value })
  }

  _onStartTimeChange = (evt) => {
    this.props.setQueryParam({ startTime: evt.target.value })
  }

  _onTimeChange = (evt) => {
    this.props.setQueryParam({ time: evt.target.value })
  }

  _onBackupTimeChange = (evt) => {
    const time = moment(evt.target.value, this.props.timeFormat).format('HH:mm')
    this.props.setQueryParam({ time })
  }

  _onBackupDateChange = (evt) => {
    const date = moment(evt.target.value, this.props.dateFormat).format('YYYY-MM-DD')
    this.props.setQueryParam({ date })
  }

  _setDepartArrive = (type) => {
    this.props.setQueryParam({ departArrive: type })
    if (type === 'NOW') {
      this.props.setQueryParam({
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HH:mm')
      })
    }
  }

  componentWillMount () {
    const checkInput = (type) => {
      var input = document.createElement('input')
      input.setAttribute('type', type)
      return input.type === type
    }
    this._supportsDateTimeInputs = checkInput('date') && checkInput('time')
  }

  render () {
    const { departArrive, date, time, timeFormat, dateFormat } = this.props

    // TODO: restore for profile mode
    /* if (this.props.profile) {
      const dowOptions = [{
        text: 'WEEKDAY',
        weekday: 3
      }, {
        text: 'SATURDAY',
        weekday: 6
      }, {
        text: 'SUNDAY',
        weekday: 0
      }]

      return (
        <Form>
          <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
            <Row>
              <Col xs={12}>
                <FormControl
                  className='dropdown-selector'
                  componentClass='select'
                  style={{width: '100%'}}
                  onChange={this._onDayOfWeekChange}
                >
                  {dowOptions.map((o, i) => (
                    <option key={i} value={o.weekday}>{o.text}</option>
                  ))}
                </FormControl>
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col xs={5}>
                <FormControl
                  className='time-selector'
                  type='time'
                  required='true'
                  value={startTime}
                  style={{width: '100%'}}
                  onChange={this._onStartTimeChange}
                />
              </Col>
              <Col xs={2}>TO</Col>
              <Col xs={5}>
                <FormControl
                  className='time-selector'
                  type='time'
                  required='true'
                  value={endTime}
                  style={{width: '100%'}}
                  onChange={this._onEndTimeChange}
                />
              </Col>
            </Row>
          </FormGroup>
        </Form>
      )
    } */

    return (
      <Form>
        <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
          <Row>
            {['NOW', 'DEPART', 'ARRIVE'].map((type, i) => (
              <Col key={i} xs={4}>
                <DateOptionButton type={type} active={departArrive === type} setDepartArrive={this._setDepartArrive} />
              </Col>
            ))}
          </Row>
          {departArrive !== 'NOW' && !this._supportsDateTimeInputs && (
            <Row style={{ marginTop: 20 }}>
              <Col xs={6}>
                <FormControl
                  className='time-selector'
                  type='text'
                  defaultValue={moment(time, 'HH:mm').format(timeFormat)}
                  required='true'
                  onChange={this._onBackupTimeChange}
                />
              </Col>
              <Col xs={6}>
                <FormControl
                  className='date-selector'
                  type='text'
                  defaultValue={moment(date, 'YYYY-MM-DD').format(dateFormat)}
                  required='true'
                  onChange={this._onBackupDateChange}
                />
              </Col>
            </Row>
          )}
          {departArrive !== 'NOW' && this._supportsDateTimeInputs && (
            <Row style={{ marginTop: 20 }}>
              <Col xs={6}>
                <FormControl
                  className='time-selector'
                  type='time'
                  value={time}
                  required='true'
                  onChange={this._onTimeChange}
                  style={{width: '100%', display: departArrive === 'NOW' && 'none'}}
                />
              </Col>
              <Col xs={6}>
                <FormControl
                  className='date-selector'
                  type='date'
                  value={date}
                  required='true'
                  onChange={this._onDateChange}
                  style={{width: '100%', display: departArrive === 'NOW' && 'none'}}
                />
              </Col>
            </Row>
          )}
        </FormGroup>
      </Form>
    )
  }
}

class DateOptionButton extends Component {
  _onClick = () => {
    this.props.setDepartArrive(this.props.type)
  }

  render () {
    const { active, type } = this.props
    let text = type
    if (type === 'NOW') text = 'Leave now'
    if (type === 'DEPART') text = 'Depart at'
    if (type === 'ARRIVE') text = 'Arrive by'
    const classNames = ['date-option-button', 'select-button']
    if (active) classNames.push('active')
    return <Button className={classNames.join(' ')} onClick={this._onClick}>{text}</Button>
  }
}

const mapStateToProps = (state, ownProps) => {
  const { departArrive, date, time, startTime, endTime } = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time,
    startTime,
    endTime,
    timeFormat: getTimeFormat(state.otp.config),
    dateFormat: getDateFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeSelector)
