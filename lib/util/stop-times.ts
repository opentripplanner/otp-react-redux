import { addDays, isBefore } from 'date-fns'

import {
  PatternDayStopTimes,
  PatternStopTimes,
  StopData,
  Time
} from '../components/util/types'

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

function sortAndFilterPatternTimes(
  times: Time[],
  now: Date,
  daysAhead: number,
  numberOfDepartures: number
): Time[] {
  return (
    times
      .concat()
      ?.sort(stopTimeComparator)
      // filter any times according to time range set in config.
      .filter((time, i, array) => {
        const departureTime = time.serviceDay + time.realtimeDeparture
        return isBefore(departureTime, addDays(now, daysAhead))
      })
      // remove excess departure times
      .slice(0, numberOfDepartures)
  )
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

  const patternTimes: PatternDayStopTimes[] = []
  Object.values(stopTimesByPattern)
    .filter(hasValidTimesAndRoute)
    .forEach((pattern) => {
      const sortedTimes = sortAndFilterPatternTimes(
        pattern.times,
        now,
        daysAhead,
        numberOfDepartures
      )

      const patternDays: Record<number, PatternDayStopTimes> = {}
      sortedTimes.forEach((t: Time) => {
        const { serviceDay } = t
        let patternDay = patternDays[serviceDay]
        if (!patternDay) {
          patternDays[serviceDay] = patternDay = {
            ...pattern,
            day: serviceDay,
            times: []
          }
          patternTimes.push(patternDay)
        }
        // Ensures that every pattern returned has stop times within the days ahead.
        patternDay.times.push(t)
      })
    })

  // Sort route times by service day then realtime departure
  patternTimes.sort(patternComparator)
  return patternTimes
}
