import moment from 'moment'
import 'moment-timezone'
import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React from 'react'
import { FormattedMessage } from 'react-intl'

import FormattedDuration from '../util/formatted-duration'
import Icon from '../util/icon'
import { getSecondsUntilDeparture } from '../../util/viewer'

const { formatSecondsAfterMidnight } = coreUtils.time

const ONE_HOUR_IN_SECONDS = 3600
const ONE_DAY_IN_SECONDS = 86400

/**
 * Renders a stop time as either schedule or countdown, with an optional status icon.
 * Stop time that apply to a different day have an additional text showing the day of departure.
 */
const StopTimeCell = ({
  homeTimezone,
  soonText,
  stopTime,
  timeFormat
}) => {
  const departureTime = stopTime.realtimeDeparture
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
  // time, using realtime updates if available.
  const secondsUntilDeparture = Math.round(getSecondsUntilDeparture(stopTime, false))
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown = secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture

  // Use "soon text" (e.g., Due) if vehicle is approaching.
  const formattedTime = formatSecondsAfterMidnight(departureTime, timeFormat)

  // We only want to show the day of the week if the arrival is on a
  // different day and we're not showing the countdown string. This avoids
  // cases such as when it's Wednesday at 11:55pm and an arrival occurs at
  // Thursday 12:19am. We don't want the time to read: 'Thursday, 24 minutes'.
  const showDayOfWeek = !vehicleDepartsToday && !showCountdown

  return (
    <div>
      <div className='pull-left'>
        <Icon
          style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }}
          type={stopTime.realtimeState === 'UPDATED' ? 'rss' : 'clock-o'}
        />
      </div>

      <div style={{ fontSize: showDayOfWeek ? 12 : 14, marginLeft: 20 }}>
        {showDayOfWeek &&
          <div style={{ marginBottom: -4 }}>
            <FormattedMessage
              id={`common.daysOfWeek.${departureDay.format('dddd').toLowerCase()}`}
            />
          </div>
        }
        <div>
          {showCountdown
            // Show countdown string (e.g., 3 min or Due)
            ? <FormattedMessage
              id='components.StopTimeCell.imminentArrival'
              values={{
                formattedDuration: <FormattedDuration
                  duration={Math.round(secondsUntilDeparture)}
                />,
                isDue: secondsUntilDeparture < 60 ? 'true' : 'false'
              }}
            />
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
  /** The text to display for imminent departure times */
  soonText: PropTypes.string,
  /** A stopTime object as received from a transit index API */
  stopTime: PropTypes.any.isRequired,
  /** A valid moment.js formatting string */
  timeFormat: PropTypes.string.isRequired
}

StopTimeCell.defaultProps = {
  homeTimezone: null,
  soonText: 'Due'
}

export default StopTimeCell
