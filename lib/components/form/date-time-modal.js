import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'

import { StyledDateTimeSelector } from './styled'

class DateTimeModal extends Component {
  static propTypes = {
    setQueryParam: PropTypes.func
  }

  render () {
    const {
      date,
      dateFormatLegacy,
      departArrive,
      setQueryParam,
      time,
      timeFormatLegacy
    } = this.props

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
            // eslint-disable-next-line react/jsx-sort-props
            dateFormatLegacy={dateFormatLegacy}
            timeFormatLegacy={timeFormatLegacy}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { date, departArrive, time } = state.otp.currentQuery
  const config = state.otp.config
  return {
    config,
    date,
    departArrive,
    time,
    // These props below are for legacy browsers (see render method above).
    // eslint-disable-next-line sort-keys
    dateFormatLegacy: coreUtils.time.getDateFormat(config),
    timeFormatLegacy: coreUtils.time.getTimeFormat(config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
