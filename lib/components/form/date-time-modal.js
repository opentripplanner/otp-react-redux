// import necessary React/Redux libraries
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { getTimeFormat, getDateFormat } from '@opentripplanner/core-utils/lib/time'

import { setQueryParam } from '../../actions/form'

import { StyledDateTimeSelector } from './styled'

class DateTimeModal extends Component {
  static propTypes = {
    setQueryParam: PropTypes.func
  }

  render () {
    const { date, dateFormatLegacy, departArrive, setQueryParam, time, timeFormatLegacy } = this.props

    return (
      <div className='date-time-modal'>
        <div className='main-panel'>
          <StyledDateTimeSelector
            className='date-time-selector'
            date={date}
            departArrive={departArrive}
            onQueryParamChange={setQueryParam}
            time={time}
            // These props below are for Safari on MacOS, and legacy browsers
            // that don't support `<input type="time|date">`.
            // These props are not relevant in modern browsers,
            // where `<input type="time|date">` already
            // formats the time|date according to the OS settings.
            dateFormatLegacy={dateFormatLegacy}
            timeFormatLegacy={timeFormatLegacy}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { departArrive, date, time } = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time,
    // These props below are for legacy browsers (see render method above).
    timeFormatLegacy: getTimeFormat(state.otp.config),
    dateFormatLegacy: getDateFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
