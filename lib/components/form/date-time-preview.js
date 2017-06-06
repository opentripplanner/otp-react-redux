import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

class DateTimePreview extends Component {
  static propTypes = {
    caret: PropTypes.string,
    compressed: PropTypes.bool,
    date: PropTypes.string,
    departArrive: PropTypes.string,
    time: PropTypes.string,
    onClick: PropTypes.func
  }

  render () {
    const { caret, date, time, departArrive } = this.props

    let timeStr
    if (departArrive === 'NOW') timeStr = 'Leave now'
    else if (departArrive === 'ARRIVE') timeStr = 'Arrive ' + time
    else if (departArrive === 'DEPART') timeStr = 'Depart ' + time

    const summary = (
      <div className='details'>
        <i className='fa fa-calendar' /> {date}
        <br />
        <i className='fa fa-clock-o' /> {timeStr}
      </div>
    )

    const button = (
      <div className='button-container'>
        <Button className='change-button' onClick={this.props.onClick}>
          Change {caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
      </div>
    )

    return this.props.compressed
      ? /* 'compressed' layout -- button is below selected mode preview */ (
        <div className='date-time-preview compressed'>
          {summary}
          {button}
        </div>
      ) : /* 'wide' layout -- button and selected mode preview are side-by-side  */ (
        <div className='date-time-preview wide'>
          {button}
          {summary}
          <div style={{ clear: 'both' }} />
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
