// import moment from 'moment'
import React, {PropTypes, Component} from 'react'
import { Form, FormGroup, FormControl } from 'react-bootstrap'
// import { SingleDatePicker } from 'react-dates'
import { connect } from 'react-redux'

import { setDepart, setDate, setTime } from '../../actions/form'

class DateTimeSelector extends Component {
  static propTypes = {
    location: PropTypes.object,
    label: PropTypes.string,
    setLocation: PropTypes.func,
    type: PropTypes.string // replace with locationType?
  }
  constructor (props) {
    super(props)
    this.state = {
      dateFocused: false
    }
  }
  _onDepartChange = (evt) => {
    const departArrive = evt.target.value
    this.props.setDepart({departArrive})
  }
  _onDateChange = (evt) => {
    const date = evt.target.value
    this.props.setDate({date})
  }
  _onTimeChange = (evt) => {
    const time = evt.target.value
    this.props.setTime({time})
  }
  render () {
    const { departArrive, date, time } = this.props
    const options = ['NOW', 'DEPART', 'ARRIVE']
    // TODO: choose date / time selectors (currently Chrome optimized)
    return (
      <Form inline>
        <FormGroup style={{marginBottom: '15px'}}>
          <FormControl
            componentClass='select'
            value={departArrive}
            onChange={this._onDepartChange}
            style={{width: '100px'}}
          >
            {options.map((o, i) => (
              <option key={i} value={o}>{o}</option>
            ))}
          </FormControl>
          {' '}
          <FormControl
            type='date'
            value={date}
            onChange={this._onDateChange}
            style={{width: '160px', display: departArrive === 'NOW' && 'none'}}
          />
          {' '}
          <FormControl
            type='time'
            value={time}
            onChange={this._onTimeChange}
            style={{width: '123px', display: departArrive === 'NOW' && 'none'}}
          />
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

const mapDispatchToProps = {setDepart, setDate, setTime}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeSelector)
