// FIXME: Remove the following eslint rule exceptions.
/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import { toDate } from 'date-fns-tz'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import FormattedCalendarString from '../util/formatted-calendar-string'
import FormattedDateTimePreview from '../util/formatted-date-time-preview'
import Icon from '../util/icon'

class DateTimePreview extends Component {
  static propTypes = {
    caret: PropTypes.string,
    className: PropTypes.string,
    // FIXME: remove unused prop or implement prop passed from containing components.
    compressed: PropTypes.bool,
    config: PropTypes.object,
    date: PropTypes.string,
    departArrive: PropTypes.string,
    editButtonText: PropTypes.element,
    endTime: PropTypes.string,
    hideButton: PropTypes.bool,
    intl: PropTypes.object,
    onClick: PropTypes.func,
    routingType: PropTypes.string,
    startTime: PropTypes.string,
    time: PropTypes.string
  }

  static defaultProps = {
    className: 'settings-preview',
    editButtonText: <i className="fa fa-pencil" />
  }

  render() {
    const {
      caret,
      className,
      config,
      date,
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

    const { homeTimezone: timeZone } = config
    const toTimestamp = (t) => toDate(`${date} ${t}`, { timeZone }).valueOf()

    const timestamp = toTimestamp(time)
    const endTimestamp = toTimestamp(endTime)
    const startTimestamp = toTimestamp(startTime)

    const summary = (
      <div className="summary">
        <Icon className="fa fa-calendar" type="calendar" withSpace />
        <FormattedCalendarString date={date} />
        <br />
        <Icon className="fa fa-clock-o" type="clock" withSpace />
        <FormattedDateTimePreview
          departArrive={departArrive}
          endTime={endTimestamp}
          routingType={routingType}
          startTime={startTimestamp}
          time={timestamp}
        />
      </div>
    )

    const button = hideButton ? null : (
      <div className="button-container">
        <Button
          aria-label={intl.formatMessage({
            id: 'components.DateTimePreview.editDepartOrArrival'
          })}
          onClick={onClick}
        >
          {editButtonText}
          {caret && (
            <span>
              {' '}
              <i className={`fa fa-caret-${caret}`} />
            </span>
          )}
        </Button>
      </div>
    )

    return (
      <div className={className} onClick={onClick}>
        {summary}
        {button}
        <div style={{ clear: 'both' }} />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  const { date, departArrive, endTime, routingType, startTime, time } =
    state.otp.currentQuery
  const config = state.otp.config
  return {
    config,
    date,
    departArrive,
    endTime,
    routingType,
    startTime,
    time
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(DateTimePreview))
