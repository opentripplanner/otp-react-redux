import coreUtils from '@opentripplanner/core-utils'
import moment from 'moment'
import 'moment-timezone'
import React from 'react'

import Icon from '../components/narrative/icon'

const {
  formatDuration,
  formatSecondsAfterMidnight,
  getUserTimezone
} = coreUtils.time

const ONE_HOUR_IN_SECONDS = 3600
const ONE_DAY_IN_SECONDS = 86400

/**
 * Helper method to generate stop time w/ status icon
 *
 * @param  {Object} stopTime  A stopTime object as received from a transit index API
 * @param  {string} [homeTimezone]  If configured, the timezone of the area
 * @param  {string} [soonText='Due']  The text to display for departure times
 *    about to depart in a short amount of time
 * @param  {string} timeFormat  A valid moment.js formatting string
 * @param  {boolean} useSchedule  Whether to use scheduled departure (otherwise uses realtime)
 */
export function getFormattedStopTime (stopTime, homeTimezone, soonText = 'Due', timeFormat, useSchedule = false) {
  const departureTime = useSchedule
    ? stopTime.scheduledDeparture
    : stopTime.realtimeDeparture
  const userTimeZone = getUserTimezone()
  const inHomeTimezone = homeTimezone && homeTimezone === userTimeZone

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
  const secondsUntilDeparture = (departureTime + stopTime.serviceDay) - now.unix()
  // Determine if vehicle arrives after midnight in order to advance the day of
  // the week when showing arrival time/day.
  const departsInFuture = secondsUntilDeparture > 0
  // Show the exact time if the departure happens within an hour.
  const showCountdown = secondsUntilDeparture < ONE_HOUR_IN_SECONDS && departsInFuture

  // Use "soon text" (e.g., Due) if vehicle is approaching.
  const countdownString = secondsUntilDeparture < 60
    ? soonText
    : formatDuration(secondsUntilDeparture)
  const formattedTime = formatSecondsAfterMidnight(
    departureTime,
    // Only show timezone (e.g., PDT) if user is not in home time zone (e.g., user
    // in New York, but viewing a trip planner for service based in Los Angeles).
    inHomeTimezone ? timeFormat : `${timeFormat} z`
  )
  // We only want to show the day of the week if the arrival is on a
  // different day and we're not showing the countdown string. This avoids
  // cases such as when it's Wednesday at 11:55pm and an arrival occurs at
  // Thursday 12:19am. We don't want the time to read: 'Thursday, 24 minutes'.
  const showDayOfWeek = !vehicleDepartsToday && !showCountdown
  return (
    <div>
      <div style={{ float: 'left' }}>
        {stopTime.realtimeState === 'UPDATED'
          ? <Icon
            type='rss'
            style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }} />
          : <Icon
            type='clock-o'
            style={{ color: '#888', fontSize: '0.8em', marginRight: 2 }} />
        }
      </div>
      <div style={{ marginLeft: 20, fontSize: showDayOfWeek ? 12 : 14 }}>
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

export function getRouteIdForPattern (pattern) {
  const patternIdParts = pattern.id.split(':')
  const routeId = patternIdParts[0] + ':' + patternIdParts[1]
  return routeId
}

export function getStopTimesByPattern (stopData) {
  const stopTimesByPattern = {}
  if (stopData && stopData.routes && stopData.stopTimes) {
    stopData.stopTimes.forEach(patternTimes => {
      const routeId = getRouteIdForPattern(patternTimes.pattern)
      const headsign = patternTimes.times[0] && patternTimes.times[0].headsign
      patternTimes.pattern.headsign = headsign
      const id = `${routeId}-${headsign}`
      if (!(id in stopTimesByPattern)) {
        const route = stopData.routes.find(r => r.id === routeId)
        // in some cases, the TriMet transit index will not return all routes
        // that serve a stop. Perhaps it doesn't return some routes if the
        // route only performs a drop-off at the stop... not quite sure. So a
        // check is needed to make sure we don't add data for routes not found
        // from the routes query.
        if (!route) {
          console.warn(`Route with id ${routeId} not found in list of routes! No stop times from this route will be displayed.`)
          return
        }
        stopTimesByPattern[id] = {
          id,
          route,
          pattern: patternTimes.pattern,
          times: []
        }
      }
      const filteredTimes = patternTimes.times.filter(stopTime => {
        return stopTime.stopIndex < stopTime.stopCount - 1 // ensure that this isn't the last stop
      })
      stopTimesByPattern[id].times = stopTimesByPattern[id].times.concat(filteredTimes)
    })
  }
  return stopTimesByPattern
}

/**
 * Gets the mode string from either an OTP Route or RouteShort model. The OTP
 * Route model returns the mode as an integer type whereas the RouteShort model
 * returns the mode string.
 */
export function getModeFromRoute (route) {
  const modeLookup = {
    0: 'TRAM', // - Tram, Streetcar, Light rail.
    1: 'SUBWAY', // - Subway, Metro.
    2: 'RAIL', // - Rail. Used for intercity or long-distance travel.
    3: 'BUS', // - Bus.
    4: 'FERRY', // - Ferry.
    5: 'CABLE_CAR', // - Cable tram.
    6: 'GONDOLA', // - Gondola, etc.
    7: 'FUNICULAR', // - Funicular.
    // TODO: 11 and 12 are not a part of OTP as of 2019-02-14, but for now just
    // associate them with bus/rail.
    11: 'BUS', // - Trolleybus.
    12: 'RAIL' // - Monorail.
  }
  return route.mode || modeLookup[route.type]
}

/**
 * Enum to represent transit realtime status for trips/stop times.
 */
export const REALTIME_STATUS = {
  EARLY: 'EARLY',
  LATE: 'LATE',
  ON_TIME: 'ON_TIME',
  SCHEDULED: 'SCHEDULED'
}

/**
 * Get one of the realtime states (on-time, late...) if a leg/stoptime is
 * registering realtime info and given a delay value in seconds.
 */
export function getTripStatus (
  isRealtime,
  delaySeconds,
  onTimeThresholdDeltaSeconds
) {
  if (isRealtime) {
    if (delaySeconds > onTimeThresholdDeltaSeconds) {
      // late departure
      return REALTIME_STATUS.LATE
    } else if (delaySeconds < -onTimeThresholdDeltaSeconds) {
      // early departure
      return REALTIME_STATUS.EARLY
    } else {
      // on-time departure
      return REALTIME_STATUS.ON_TIME
    }
  } else {
    // Schedule only
    return REALTIME_STATUS.SCHEDULED
  }
}
