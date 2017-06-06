import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

class DateTimePreview extends Component {
  static propTypes = {
    date: PropTypes.string,
    departArrive: PropTypes.string,
    time: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { date, time, departArrive } = this.props

    let timeStr
    if (departArrive === 'NOW') timeStr = 'Leave now'
    else if (departArrive === 'ARRIVE') timeStr = 'Arrive ' + time
    else if (departArrive === 'DEPART') timeStr = 'Depart ' + time

    return (
      <div className='date-time-preview'>
        <div className='details'>
          <i className='fa fa-calendar' /> {date}
          <br />
          <i className='fa fa-clock-o' /> {timeStr}
        </div>
        <div>
          <Button className='change-button' onClick={this.props.onClick}>
            Change
          </Button>
        </div>
      </div>
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

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimePreview)
