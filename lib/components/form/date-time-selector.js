// import moment from 'moment'
import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl, Row, Col } from 'react-bootstrap'
// import { SingleDatePicker } from 'react-dates'
import { connect } from 'react-redux'

import { setDepart, setDate, setTime } from '../../actions/form'

class DateTimeSelector extends Component {
  static propTypes = {
    date: PropTypes.string,
    departArrive: PropTypes.string,
    time: PropTypes.string,
    location: PropTypes.object,
    label: PropTypes.string,
    profile: PropTypes.bool,
    setDate: PropTypes.func,
    setDepart: PropTypes.func,
    setLocation: PropTypes.func,
    setTime: PropTypes.func,
    type: PropTypes.string // replace with locationType?
  }

  constructor (props) {
    super(props)
    this.state = {
      dateFocused: false
    }
  }

  _onDepartChange = (evt) => {
    console.log(evt.target.value)
    this.props.setDepart(evt.target.value)
  }

  _onDateChange = (evt) => {
    console.log(evt.target.value)
    this.props.setDate(evt.target.value)
  }

  _onTimeChange = (evt) => {
    console.log(evt.target.value)
    this.props.setTime(evt.target.value)
  }

  render () {
    const { departArrive, date, time } = this.props
    const options = ['NOW', 'DEPART', 'ARRIVE']
    // TODO: choose date / time selectors (currently Chrome optimized)

    if (this.props.profile) {
      const dowOptions = ['WEEKDAY', 'SATURDAY', 'SUNDAY']
      return (
        <Form>
          <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
            <Row>
              <Col xs={12}>
                <FormControl
                  componentClass='select'
                  style={{width: '100%'}}
                >
                  {dowOptions.map((o, i) => (
                    <option key={i} value={o}>{o}</option>
                  ))}
                </FormControl>
              </Col>
            </Row>
            <Row style={{ marginTop: 20 }}>
              <Col xs={5}>
                <FormControl
                  className='time-selector'
                  type='time'
                  value='07:00'
                  style={{width: '100%'}}
                />
              </Col>
              <Col xs={2}>TO</Col>
              <Col xs={5}>
                <FormControl
                  className='time-selector'
                  type='time'
                  value='09:00'
                  style={{width: '100%'}}
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
                className='date-selector'
                type='date'
                value={date}
                onChange={this._onDateChange}
                style={{width: '100%', display: departArrive === 'NOW' && 'none'}}
              />
            </Col>
            <Col xs={6}>
              <FormControl
                className='time-selector'
                type='time'
                value={time}
                onChange={this._onTimeChange}
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
  const {departArrive, date, time} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setDepart: (departArrive) => { dispatch(setDepart({ departArrive })) },
    setDate: (date) => { dispatch(setDate({ date })) },
    setTime: (time) => { dispatch(setTime({ time })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeSelector)
