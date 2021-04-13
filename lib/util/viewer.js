import { isBlank } from './ui'

/**
 * Computes the seconds until departure for a given stop time,
 * based either on the scheduled or the realtime departure time.
 */
export function getSecondsUntilDeparture (stopTime, useSchedule) {
  const departureTime = useSchedule
    ? stopTime.scheduledDeparture
    : stopTime.realtimeDeparture

  return (departureTime + stopTime.serviceDay) - (Date.now() / 1000)
}

export function getRouteIdForPattern (pattern) {
  const patternIdParts = pattern.id.split(':')
  const routeId = patternIdParts[0] + ':' + patternIdParts[1]
  return routeId
}

/**
 * Filter predicate used, so that the stop viewer only shows departures from a stop
 * (arrivals at a terminus stop are not shown in the stop viewer).
 * @returns true if the given stopTime does not correspond to the last stop visited by a pattern.
 */
function excludeLastStop (stopTime) {
  return stopTime.stopIndex < stopTime.stopCount - 1
}

/**
 * Checks that the given route object from an OTP pattern is valid.
 * If it is not, logs a warning message.
 *
 * FIXME: there is currently a bug with the alernative transit index
 *        where routes are not associated with the stop if the only stoptimes
 *        for the stop are drop off only. See https://github.com/ibi-group/trimet-mod-otp/issues/217
 *
 * @param {*} route The route of an OTP pattern to check.
 * @param {*} routeId The route id to show for the specified route.
 * @returns true if route is not null.
 */
export function routeIsValid (route, routeId) {
  if (!route) {
    console.warn(`Cannot render stop times for missing route ID: ${routeId}`)
    return false
  }
  return true
}

export function getStopTimesByPattern (stopData) {
  const stopTimesByPattern = {}
  if (stopData && stopData.routes && stopData.stopTimes) {
    stopData.stopTimes.forEach(({ pattern, times }) => {
      const routeId = getRouteIdForPattern(pattern)

      let headsign = times[0] && times[0].headsign
      // In case stop time headsign is blank, extract headsign from the pattern 'desc' attribute
      // (format: '49 to <Destination> (<destid>)[ from <Origin> (<originid)]').
      if (isBlank(headsign)) {
        const matches = pattern.desc.match(/ to ([^(from)]+) \(.+\)/)
        if (matches) {
          headsign = matches[1]
        }
      }
      pattern.headsign = headsign

      const id = `${routeId}-${headsign}`
      if (!(id in stopTimesByPattern)) {
        const route = stopData.routes.find(r => r.id === routeId)
        // in some cases, the TriMet transit index will not return all routes
        // that serve a stop. Perhaps it doesn't return some routes if the
        // route only performs a drop-off at the stop... not quite sure. So a
        // check is needed to make sure we don't add data for routes not found
        // from the routes query.
        if (!routeIsValid(route, routeId)) {
          return
        }
        stopTimesByPattern[id] = {
          id,
          route,
          pattern,
          times: []
        }
      }
      // Exclude the last stop, as the stop viewer doesn't show arrival times to a terminus stop.
      const filteredTimes = times.filter(excludeLastStop)

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
 * Comparator to sort stop times by their departure times
 * (in chronological order - 9:13am, 9:15am, etc.)
 */
export function stopTimeComparator (a, b) {
  const aTime = a.serviceDay + a.scheduledDeparture
  const bTime = b.serviceDay + b.scheduledDeparture
  return aTime - bTime
}

/**
  * Finds the stop time corresponding to the first departure
  * (the closest departure past the current time).
  */
export function getFirstDepartureFromNow (stopTimes) {
  // Search starting from the last stop time (largest seconds until departure).
  const lastStopTime = stopTimes[stopTimes.length - 1]

  let firstStopTime = lastStopTime
  stopTimes.forEach(stopTime => {
    const firstStopTimeSeconds = getSecondsUntilDeparture(firstStopTime, true)
    const stopTimeSeconds = getSecondsUntilDeparture(stopTime, true)

    if (stopTimeSeconds < firstStopTimeSeconds && stopTimeSeconds >= 0) {
      firstStopTime = stopTime
    }
  })
  return firstStopTime
}

/**
 * Merges and sorts the stop time entries from the patterns in the given stopData object.
 */
export function mergeAndSortStopTimes (stopData) {
  const stopTimesByPattern = getStopTimesByPattern(stopData)

  // Merge stop times, so that we can sort them across all route patterns.
  // (stopData is assumed valid per StopViewer render condition.)
  let mergedStopTimes = []
  Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
    // Only add pattern if route info is returned by OTP.
    if (routeIsValid(route, getRouteIdForPattern(pattern))) {
      const filteredTimes = times
        .filter(excludeLastStop)
        .map(stopTime => {
          // Add the route attribute and headsign to each stop time for rendering route info.
          const headsign = isBlank(stopTime.headsign) ? pattern.headsign : stopTime.headsign
          return {
            ...stopTime,
            route,
            headsign
          }
        })
      mergedStopTimes = mergedStopTimes.concat(filteredTimes)
    }
  })

  return mergedStopTimes.sort(stopTimeComparator)
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
  onTimeThresholdSeconds
) {
  if (isRealtime) {
    if (delaySeconds > onTimeThresholdSeconds) {
      // late departure
      return REALTIME_STATUS.LATE
    } else if (delaySeconds < -onTimeThresholdSeconds) {
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
