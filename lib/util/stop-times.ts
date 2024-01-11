import { addDays, isBefore } from 'date-fns'

import {
  PatternDayStopTimes,
  PatternStopTimes,
  StopData,
  Time
} from '../components/util/types'

import { getOrPutEntry } from './arrays'
import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  patternComparator,
  routeIsValid,
  stopTimeComparator
} from './viewer'

function hasValidTimesAndRoute({
  pattern,
  route,
  times
}: PatternStopTimes): boolean {
  return (
    times &&
    times.length !== 0 &&
    routeIsValid(route, getRouteIdForPattern(pattern))
  )
}

/** Filter any times according to time range set in config. */
function isWithinDaysAhead(time: Time, now: Date, daysAhead: number) {
  const departureTime = time.serviceDay + time.realTimeDeparture
  return isBefore(departureTime, addDays(now, daysAhead))
}

/** Helper to sort and group stop times by pattern by service day */
export function groupAndSortStopTimesByPatternByDay(
  stopData: StopData,
  now: Date,
  daysAhead: number,
  numberOfDepartures: number
): PatternDayStopTimes[] {
  // construct a lookup table mapping pattern (e.g. 'ROUTE_ID-HEADSIGN') to
  // an array of stoptimes
  const stopTimesByPattern = getStopTimesByPattern(stopData) as Record<
    string,
    PatternStopTimes
  >

  return (
    Object.values(stopTimesByPattern)
      .filter(hasValidTimesAndRoute)
      .map((pattern) =>
        pattern.times
          .concat([])
          .sort(stopTimeComparator)
          .filter((time) => isWithinDaysAhead(time, now, daysAhead))
          // remove excess departure times
          .slice(0, numberOfDepartures)
          // collect times by pattern by day
          // (every pattern returned has stop times within the days ahead.)
          .reduce<Record<number, PatternDayStopTimes>>((days, t) => {
            const { serviceDay } = t
            const patternDay = getOrPutEntry(days, serviceDay, (day) => ({
              ...pattern,
              day,
              times: []
            }))
            patternDay.times.push(t)
            return days
          }, {})
      )
      // Concatenate all resulting patterns
      .reduce<PatternDayStopTimes[]>(
        (result, cur) => result.concat(Object.values(cur)),
        []
      )
      // Sort route times by service day then realtime departure
      .sort(patternComparator)
  )
}
