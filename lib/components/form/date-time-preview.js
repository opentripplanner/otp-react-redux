// FIXME: Remove the following eslint rule exceptions.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { injectIntl } from 'react-intl'
import { connect } from 'react-redux'

import FormattedDateTimePreview from '../util/formatted-date-time-preview'
import Icon from '../util/icon'

const {
  getDateFormat,
  getTimeFormat,
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} = coreUtils.time

class DateTimePreview extends Component {
  static propTypes = {
    caret: PropTypes.string,
    compressed: PropTypes.bool,
    date: PropTypes.string,
    departArrive: PropTypes.string,
    editButtonText: PropTypes.element,
    hideButton: PropTypes.bool,
    onClick: PropTypes.func,
    routingType: PropTypes.string,
    time: PropTypes.string
  }

  static defaultProps = {
    className: 'settings-preview',
    editButtonText: <i className='fa fa-pencil' />
  }

  render () {
    const {
      caret,
      className,
      date,
      dateFormat,
      departArrive,
      editButtonText,
      endTime,
      hideButton,
      intl,
      onClick,
      routingType,
      startTime,
      time
    } = this.props

    const summary = (
      <div className='summary'>
        <i className='fa fa-calendar' /> {
          moment(date, OTP_API_DATE_FORMAT)
            .calendar(null, { sameElse: dateFormat })
            .split(' at')[0]}
        <br />
        <Icon className='fa fa-clock-o' type='clock' withSpace />
        <FormattedDateTimePreview
          departArrive={departArrive}
          endTime={moment.utc(endTime, OTP_API_TIME_FORMAT).unix()}
          routingType={routingType}
          startTime={moment.utc(startTime, OTP_API_TIME_FORMAT).unix()}
          time={moment.utc(time, OTP_API_TIME_FORMAT).unix()}
        />
      </div>
    )

    const button = hideButton
      ? null
      : <div className='button-container'>
        <Button
          aria-label={intl.formatMessage({id: 'components.DateTimePreview.editDepartOrArrival'})}
          onClick={onClick}
        >
          {editButtonText}{caret && <span> <i className={`fa fa-caret-${caret}`} /></span>}
        </Button>
      </div>

    return (
      <div
        className={className}
        onClick={onClick}
      >
        {summary}
        {button}
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { date, departArrive, endTime, routingType, startTime, time } = state.otp.currentQuery
  const config = state.otp.config
  return {
    config,
    date,
    dateFormat: getDateFormat(config),
    departArrive,
    endTime,
    routingType,
    startTime,
    time,
    timeFormat: getTimeFormat(config)
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(injectIntl(DateTimePreview))
