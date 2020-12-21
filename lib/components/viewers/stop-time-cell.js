import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'
import 'moment-timezone'
import PropTypes from 'prop-types'
import React from 'react'

import Icon from '../narrative/icon'
import { formatDepartureTime, getSecondsUntilDeparture } from '../../util/viewer'

const { formatDuration } = coreUtils.time

const ONE_HOUR_IN_SECONDS = 3600
const ONE_DAY_IN_SECONDS = 86400

/**
 * Renders an icon based on the given stop time realtime state.
 */
function renderIcon (stopTime) {
  const iconType = stopTime.realtimeState === 'UPDATED' ? 'rss' : 'clock-o'
  return (
    <div style={{ float: 'left' }}>
      <Icon
        type={iconType}
        style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }}
      />
    </div>
  )
}

/**
 * Renders a stop time as either schedule or countdown, with an optional status icon.
 * Stop time that apply to a different day have an additional text showing the day of departure.
 */
const StopTimeCell = ({
  homeTimezone,
  showIcon,
  soonText,
  stopTime,
  timeFormat,
  useCountdown,
  useSchedule
}) => {
  const departureTime = useSchedule
    ? stopTime.scheduledDeparture
    : stopTime.realtimeDeparture
  const now = moment().tz(homeTimezone)
  const serviceDay = moment(stopTime.serviceDay * 1000).tz(homeTimezone)

  // Determine if arrival occurs on different day, making sure to account for
  // any extra days added to the service day if it arrives after midnight. Note:
  // this can handle the rare (and non-existent?) case where an arrival occurs
  // 48:00 hours (or more) from the start of the service day.
  const departureTimeRemainder = departureTime % ONE_DAY_IN_SECONDS
  const daysAfterServiceDay = (departureTime - departureTimeRemainder) / ONE_DAY_IN_SECONDS
  const departureDay = serviceDay.add(daysAfterServiceDay, 'day')
  const vehicleDepartsToday = now.dayOfYear() === departureDay.dayOfYear()

  // Determine whether to show departure as countdown (e.g. "5 min") or as HH:mm
  // time.
  const secondsUntilDeparture = getSecondsUntilDeparture(stopTime, useSchedule)
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown = useCountdown && secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture

  // Use "soon text" (e.g., Due) if vehicle is approaching.
  const countdownString = secondsUntilDeparture < 60
    ? soonText
    : formatDuration(secondsUntilDeparture)
  const formattedTime = formatDepartureTime(
    departureTime,
    timeFormat,
    homeTimezone
  )
  // We only want to show the day of the week if the arrival is on a
  // different day and we're not showing the countdown string. This avoids
  // cases such as when it's Wednesday at 11:55pm and an arrival occurs at
  // Thursday 12:19am. We don't want the time to read: 'Thursday, 24 minutes'.
  const showDayOfWeek = !vehicleDepartsToday && !showCountdown
  return (
    <div>
      {showIcon && renderIcon(stopTime)}

      <div style={{ marginLeft: showIcon ? 20 : 0, fontSize: showDayOfWeek ? 12 : 14 }}>
        {showDayOfWeek &&
          <div style={{ marginBottom: -4 }}>{departureDay.format('dddd')}</div>
        }
        <div>
          {showCountdown
            // Show countdown string (e.g., 3 min or Due)
            ? countdownString
            // Show formatted time (with timezone if user is not in home timezone)
            : formattedTime
          }
        </div>
      </div>
    </div>
  )
}

StopTimeCell.propTypes = {
  /** If configured, the timezone of the area */
  homeTimezone: PropTypes.any,
  /** Whether to display an icon next to the departure time */
  showIcon: PropTypes.bool,
  /** The text to display for imminent departure times */
  soonText: PropTypes.string,
  /** A stopTime object as received from a transit index API */
  stopTime: PropTypes.any.isRequired,
  /** A valid moment.js formatting string */
  timeFormat: PropTypes.string.isRequired,
  /**
   * Whether to display a countdown in minutes instead of the
   * scheduled time for departures within an hour.
   */
  useCountdown: PropTypes.bool,
  /** Whether to use scheduled departure (otherwise uses realtime) */
  useSchedule: PropTypes.bool
}

StopTimeCell.defaultProps = {
  homeTimezone: null,
  showIcon: true,
  soonText: 'Due',
  useCountdown: true,
  useSchedule: false
}

export default StopTimeCell
