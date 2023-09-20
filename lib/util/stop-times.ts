import { addDays, isBefore } from 'date-fns'

import { StopTimesForPattern } from '../components/util/types'

import {
  getRouteIdForPattern,
  getStopTimesByPattern,
  patternComparator,
  routeIsValid,
  stopTimeComparator
} from './viewer'

/** Helper to sort and group stop times by pattern by service day */
export function groupAndSortStopTimesByPatternByDay(
  stopData: Record<string, StopTimesForPattern>,
  now: Date,
  daysAhead: number
) {
  // construct a lookup table mapping pattern (e.g. 'ROUTE_ID-HEADSIGN') to
  // an array of stoptimes
  const stopTimesByPattern = getStopTimesByPattern(stopData)

  const routeTimes = []
  Object.values(stopTimesByPattern)
    .filter(
      ({ pattern, route, times }) =>
        times &&
        times.length !== 0 &&
        routeIsValid(route, getRouteIdForPattern(pattern))
    )
    .sort(patternComparator)
    .forEach((route) => {
      const sortedTimes = route.times
        .concat()
        ?.sort(stopTimeComparator)
        // filter any times according to time range set in config.
        .filter((time: any, i: number, array: Array<any>) => {
          const departureTime = time.serviceDay + time.realtimeDeparture
          return isBefore(departureTime, addDays(now, daysAhead))
        })

      const serviceDays = {}
      const serviceDayList = []
      sortedTimes.forEach((t) => {
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
          routeTimes.push({
            ...route,
            day,
            times
          })
        }
      })
    })

  // Sort route times by service day then realtime departure
  routeTimes.sort(
    (rt1, rt2) =>
      (rt1.day - rt2.day) * 100000 +
      (rt1.times[0].realtimeDeparture - rt2.times[0].realtimeDeparture)
  )

  return routeTimes
}
