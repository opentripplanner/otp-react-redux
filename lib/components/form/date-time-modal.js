// TODO: TypeScript with props.
/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { setQueryParam } from '../../actions/form'

import { StyledDateTimeSelector } from './styled'

class DateTimeModal extends Component {
  static propTypes = {
    setQueryParam: PropTypes.func
  }

  render() {
    const {
      config,
      date,
      dateFormatLegacy,
      departArrive,
      setQueryParam,
      time,
      timeFormatLegacy
    } = this.props
    const { homeTimezone, isTouchScreenOnDesktop } = config
    const touchClassName = isTouchScreenOnDesktop
      ? 'with-desktop-touchscreen'
      : ''

    return (
      <div className="date-time-modal">
        <div className="main-panel">
          <StyledDateTimeSelector
            className={`date-time-selector ${touchClassName}`}
            date={date}
            dateFormatLegacy={dateFormatLegacy}
            departArrive={departArrive}
            onQueryParamChange={setQueryParam}
            time={time}
            // These props below are for Safari on MacOS, and legacy browsers
            // that don't support `<input type="time|date">`.
            // These props are not relevant in modern browsers,
            // where `<input type="time|date">` already
            // formats the time|date according to the OS settings.
            // eslint-disable-next-line react/jsx-sort-props
            timeFormatLegacy={timeFormatLegacy}
            timeZone={homeTimezone}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { date, departArrive, time } = state.otp.currentQuery
  const config = state.otp.config
  return {
    config,
    date,
    // This prop is for legacy browsers (see render method above).
    dateFormatLegacy: coreUtils.time.getDateFormat(config),
    departArrive,
    time,
    // This prop is for legacy browsers (see render method above).
    timeFormatLegacy: coreUtils.time.getTimeFormat(config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
