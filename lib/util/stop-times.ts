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
    .filter(
      ({ pattern, route, times }) =>
        times &&
        times.length !== 0 &&
        routeIsValid(route, getRouteIdForPattern(pattern))
    )
    .sort(patternComparator)
    .forEach((pattern) => {
      const sortedTimes = pattern.times
        .concat()
        ?.sort(stopTimeComparator)
        // filter any times according to time range set in config.
        .filter((time: Time, i: number, array: Time[]) => {
          const departureTime = time.serviceDay + time.realtimeDeparture
          return isBefore(departureTime, addDays(now, daysAhead))
        })
        // remove excess departure times
        .slice(0, numberOfDepartures)

      const serviceDays: Record<number, Time[]> = {}
      const serviceDayList: number[] = []
      sortedTimes.forEach((t: Time) => {
        const { serviceDay } = t
        if (!serviceDays[serviceDay]) {
          serviceDays[serviceDay] = []
          serviceDayList.push(serviceDay)
        }
        serviceDays[serviceDay].push(t)
      })

      serviceDayList.forEach((day) => {
        // Don't return patterns with no times within the days ahead.
        const times = serviceDays[day]
        if (times.length !== 0) {
          patternTimes.push({
            ...pattern,
            day,
            times
          })
        }
      })
    })

  // Sort route times by service day then realtime departure
  patternTimes.sort(patternComparator)
  return patternTimes
}
