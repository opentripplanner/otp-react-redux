// import moment from 'moment'
import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap'
// import { SingleDatePicker } from 'react-dates'
import { connect } from 'react-redux'
import moment from 'moment'

import { setQueryParam } from '../../actions/form'

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

  _onDepartChange = (evt) => {
    this.props.setQueryParam({ departArrive: evt.target.value })
    if (evt.target.value === 'NOW') {
      this.props.setQueryParam({
        date: moment().format('YYYY-MM-DD'),
        time: moment().format('HH:mm')
      })
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

  render () {
    const { departArrive, date, time, startTime, endTime } = this.props
    const options = ['NOW', 'DEPART', 'ARRIVE']
    // TODO: choose date / time selectors (currently Chrome optimized)

    if (this.props.profile) {
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
    }

    return (
      <Form>
        <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
          <Row>
            <Col xs={12}>
              <FormControl
                className='dropdown-selector'
                componentClass='select'
                value={departArrive}
                onChange={this._onDepartChange}
                style={{width: '100%'}}
              >
                {options.map((o, i) => (
                  <option key={i} value={o}>{o}</option>
                ))}
              </FormControl>
            </Col>
          </Row>
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
        </FormGroup>
      </Form>
    )
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
    endTime
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeSelector)
