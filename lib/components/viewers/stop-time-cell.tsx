import { format, getTimezoneOffset, utcToZonedTime } from 'date-fns-tz'
import { FormattedMessage } from 'react-intl'
import addDays from 'date-fns/addDays'
import coreUtils from '@opentripplanner/core-utils'
import isSameDay from 'date-fns/isSameDay'
import React from 'react'

import { getSecondsUntilDeparture } from '../../util/viewer'
import FormattedDayOfWeek from '../util/formatted-day-of-week'
import FormattedDuration from '../util/formatted-duration'
import Icon from '../util/icon'
import type { Time } from '../util/types'

import DepartureTime from './departure-time'

const { getUserTimezone } = coreUtils.time
const ONE_HOUR_IN_SECONDS = 3600
const ONE_DAY_IN_SECONDS = 86400

type Props = {
  /** If configured, the timezone of the area */
  homeTimezone?: string
  /** A stopTime object as received from a transit index API */
  stopTime: Time
}

/**
 * Renders a stop time as either schedule or countdown, with an optional status icon.
 * Stop time that apply to a different day have an additional text showing the day of departure.
 */
const StopTimeCell = ({
  homeTimezone = getUserTimezone(),
  stopTime
}: Props): JSX.Element => {
  if (!homeTimezone || !stopTime) {
    console.warn(
      'Missing required prop(s) for StopTimeCell: homeTimezone, stopTime'
    )
    return (
      <div>
        <FormattedMessage id="common.forms.error" />
      </div>
    )
  }
  if (isNaN(getTimezoneOffset(homeTimezone))) {
    console.warn(`homeTimezone '${homeTimezone}' is invalid`)
    return (
      <div>
        <FormattedMessage id="common.forms.error" />
      </div>
    )
  }
  const departureTime = stopTime.realtimeDeparture
  const now = utcToZonedTime(Date.now(), homeTimezone)
  const serviceDay = utcToZonedTime(
    new Date(stopTime.serviceDay * 1000),
    homeTimezone
  )

  // Determine if arrival occurs on different day, making sure to account for
  // any extra days added to the service day if it arrives after midnight. Note:
  // this can handle the rare (and non-existent?) case where an arrival occurs
  // 48:00 hours (or more) from the start of the service day.
  const departureTimeRemainder = departureTime % ONE_DAY_IN_SECONDS
  const daysAfterServiceDay =
    (departureTime - departureTimeRemainder) / ONE_DAY_IN_SECONDS
  const departureDay = addDays(serviceDay, daysAfterServiceDay)
  const vehicleDepartsToday = isSameDay(now, departureDay)

  // Determine whether to show departure as countdown (e.g. "5 min") or as HH:mm
  // time, using realtime updates if available.
  const secondsUntilDeparture = Math.round(
    getSecondsUntilDeparture(stopTime, false)
  )
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown =
    secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture
  // Whether to display "Due" or a countdown (used in conjunction with showCountdown).
  const isDue = secondsUntilDeparture < 60

  // We only want to show the day of the week if the arrival is on a
  // different day and we're not showing the countdown string. This avoids
  // cases such as when it's Wednesday at 11:55pm and an arrival occurs at
  // Thursday 12:19am. We don't want the time to read: 'Thursday, 24 minutes'.
  const showDayOfWeek = !vehicleDepartsToday && !showCountdown

  const realtime = stopTime.realtimeState === 'UPDATED'
  return (
    <>
      {/* Once font-awesome is removed this code will look less silly */}
      <Icon
        style={{
          fontSize: '0.6em',
          marginRight: 2,
          transform: `scaleX(${realtime ? '-1' : '1'})`
        }}
        type={realtime ? 'rss' : 'clock-o'}
        withSpace
      />

      {showDayOfWeek && (
        <span className="percy-hide" style={{ marginBottom: -4 }}>
          <FormattedDayOfWeek
            // 'iiii' returns the long ISO day of the week (independent of browser locale).
            // See https://date-fns.org/v2.28.0/docs/format
            day={format(departureDay, 'iiii', {
              timeZone: homeTimezone
            }).toLowerCase()}
          />{' '}
        </span>
      )}
      <span className="percy-hide">
        {showCountdown ? (
          // Show countdown string (e.g., 3 min or Due)
          isDue ? (
            <FormattedMessage id="components.StopTimeCell.imminentArrival" />
          ) : (
            <FormattedDuration duration={secondsUntilDeparture} />
          )
        ) : (
          <DepartureTime realTime stopTime={stopTime} />
        )}
      </span>
    </>
  )
}

export default StopTimeCell
