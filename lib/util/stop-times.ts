import { Agency, Place, Route } from '@opentripplanner/types'

import { Pattern, StopTime } from '../components/util/types'

import {
  extractHeadsignFromPattern,
  getRouteIdForPattern,
  stopTimeComparator
} from './viewer'
import { isBlank } from './ui'

// TODO move to common file
type PatternStopTime = {
  pattern: Pattern
  stoptimes: StopTime[]
}

// FIXME: add to OTP-UI types
interface AgencyWithGtfsId extends Agency {
  gtfsId: string
}

// FIXME: add to OTP-UI types
interface RouteWithAgencyGtfsId extends Route {
  agency: AgencyWithGtfsId
}

// TODO move to common file
export type StopDataV2 = Place & {
  code: string
  fetchStatus: number
  gtfsId: string
  routes: RouteWithAgencyGtfsId[]
  stoptimesForPatterns: PatternStopTime[]
}

export interface StopTimesForPattern {
  id: string
  pattern: Pattern
  route?: Route
  times: StopTime[]
}

export interface DetailedStopTime extends StopTime {
  blockId?: string
  headsign: string
  route?: Route
}

/**
 * Determines whether a stopId corresponds to the last stop time of a pattern.
 * (Arrivals at a terminus stop are not shown in the schedule viewer.)
 * Note: OTP offers a stopPosition attribute, but it is not necessarily the index of the stop in an array.
 * @returns true if the given stopId corresponds to the last stop visited by a pattern.
 */
export function isLastStop(stopId: string, pattern: Pattern): boolean {
  if (!pattern.stops) return false
  const position = pattern.stops.findIndex((stop) => stop.gtfsId === stopId)
  return position === pattern.stops.length - 1
}

export function getStopTimesByPatternV2(
  stopData: StopDataV2
): Record<string, StopTimesForPattern> {
  const stopTimesByPattern: Record<string, StopTimesForPattern> = {}
  if (stopData && stopData.routes && stopData.stoptimesForPatterns) {
    stopData.stoptimesForPatterns.forEach(({ pattern, stoptimes }) => {
      const routeId = getRouteIdForPattern(pattern)

      let headsign = stoptimes[0] && stoptimes[0].headsign
      // If times didn't provide a headsign, extract it from the pattern
      if (isBlank(headsign)) {
        headsign = extractHeadsignFromPattern(pattern)
      }
      pattern.headsign = headsign

      const id = `${routeId}-${headsign}`
      if (!(id in stopTimesByPattern)) {
        const route = stopData.routes.find((r) => r.id === routeId)
        stopTimesByPattern[id] = {
          id,
          pattern,
          route,
          times: []
        }
      }
      stopTimesByPattern[id].times =
        stopTimesByPattern[id].times.concat(stoptimes)
    })
  }
  return stopTimesByPattern
}

/**
 * Merges and sorts the stop time entries from the patterns in the given stopData object.
 */
export function mergeAndSortStopTimes(
  stopData: StopDataV2
): DetailedStopTime[] {
  const stopTimesByPattern = getStopTimesByPatternV2(stopData)

  // Merge stop times, so that we can sort them across all route patterns.
  // (stopData is assumed valid per StopScheduleViewer render condition.)
  let mergedStopTimes: DetailedStopTime[] = []
  Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
    const timesWithHeadsign = times.map((stopTime) => {
      // Add the route attribute and headsign to each stop time for rendering route info.
      const headsign = isBlank(stopTime.headsign)
        ? pattern.headsign
        : stopTime.headsign
      return {
        ...stopTime,
        blockId: stopTime.trip.blockId,
        headsign,
        route
      } as DetailedStopTime
    })
    mergedStopTimes = mergedStopTimes.concat(timesWithHeadsign)
  })

  return mergedStopTimes.sort(stopTimeComparator)
}
