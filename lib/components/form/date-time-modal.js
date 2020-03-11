// import necessary React/Redux libraries
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, ButtonGroup } from 'react-bootstrap'
import styled from 'styled-components'
import { getTimeFormat, getDateFormat } from '@opentripplanner/core-utils/lib/time'
import { DateTimeSelector } from '@opentripplanner/trip-form'
import * as TripFormClasses from '@opentripplanner/trip-form/lib/styled'

import { setQueryParam } from '../../actions/form'

// Styles for the DateTimeSelector.
// TODO: Find a way to bring OTP CSS classes in here.
const StyledDateTimeSelector = styled(DateTimeSelector)`
  margin: 0 -15px 20px;
  ${TripFormClasses.DateTimeSelector.DateTimeRow} {
    margin-top: 20px;
  }

  input {
    -webkit-appearance: textfield;
    -moz-appearance: textfield;
    appearance: textfield;
    background-color: #fff;
    background-image: none;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: none;
    color: #555;
    font-family: inherit;
    font-size: 16px;
    height: 34px;
    padding: 6px 12px;
    text-align: center;
    &.focused {
      outline: 0;
      border-color: #66afe9;
      font-weight: 400;
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
    }
  }

  button {
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    background-color: #fff;
    border: 1px solid #ccc;
    border-radius: 4px;
    color: #333;
    cursor: pointer;
    font-family: inherit;
    font-weight: 400;
    font-size: 14px;
    line-height: 1.42857143;
    outline-offset:-2px;
    padding: 6px 12px;
    text-align: center;
    touch-action: manipulation;
    user-select: none;
    white-space: nowrap;

    &.active {
      background-color: #e6e6e6;
      border-color: #adadad;
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
      font-weight: 400;
    }
    &:hover {
      background-color: #e6e6e6;
      border-color: #adadad;
    }
    &.active {
      background-color: #e6e6e6;
      border-color: #adadad;
      box-shadow: inset 0 3px 5px rgba(0, 0, 0, .125);
      font-weight: 400;
      &:hover {
        background-color: #d4d4d4;
        border-color: #8c8c8c;
      }
    }
  }
`

// Define default routingType labels and components
const rtDefaults = [
  {
    key: 'ITINERARY',
    text: 'Itinerary'
  }, {
    key: 'PROFILE',
    text: 'Profile'
  }
]

class DateTimeModal extends Component {
  static propTypes = {
    routingType: PropTypes.string,
    setQueryParam: PropTypes.func
  }

  render () {
    const { config, date, dateFormatLegacy, departArrive, routingType, setQueryParam, time, timeFormatLegacy } = this.props

    return (
      <div className='date-time-modal'>
        {/* The routing-type selection button row. Only show if more than one configured */}
        {config.routingTypes.length > 1 && (
          <div className='button-row'>
            <ButtonGroup justified>
              {config.routingTypes.map(rtConfig => {
                return (
                  <ButtonGroup key={rtConfig.key}>
                    <Button
                      className={rtConfig.key === routingType ? 'selected' : ''}
                      onClick={() => {
                        setQueryParam({ routingType: rtConfig.key })
                      }}
                    >
                      {rtConfig.text || rtDefaults.find(d => d.key === rtConfig.key).text}
                    </Button>
                  </ButtonGroup>
                )
              })}
            </ButtonGroup>
          </div>
        )}

        {/* The main panel for the selected routing type */}
        <div className='main-panel'>
          <StyledDateTimeSelector
            className='date-time-selector'
            date={date}
            dateFormatLegacy={dateFormatLegacy}
            departArrive={departArrive}
            onQueryParamChange={setQueryParam}
            time={time}
            timeFormatLegacy={timeFormatLegacy}
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const {departArrive, date, time, routingType} = state.otp.currentQuery
  return {
    config: state.otp.config,
    departArrive,
    date,
    time,
    routingType,
    // These props below are for Safari on MacOS, and old browsers
    // that don't support `<input type="time|date">`.
    // In modern browsers, `<input type="time|date">` already
    // formats the time|date according to the OS settings.
    timeFormatLegacy: getTimeFormat(state.otp.config),
    dateFormatLegacy: getDateFormat(state.otp.config)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(DateTimeModal)
