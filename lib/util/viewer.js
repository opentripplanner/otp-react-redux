/* eslint-disable @typescript-eslint/no-use-before-define */
import tinycolor from 'tinycolor2'

import { isBlank } from './ui'

/**
 * Computes the seconds until departure for a given stop time,
 * based either on the scheduled or the realtime departure time.
 */
export function getSecondsUntilDeparture(stopTime, useSchedule) {
  const departureTime = useSchedule
    ? stopTime.scheduledDeparture
    : stopTime.realtimeDeparture

  return departureTime + stopTime.serviceDay - Date.now() / 1000
}

export function getRouteIdForPattern(pattern) {
  const patternIdParts = pattern.id.split(':')
  const routeId = patternIdParts[0] + ':' + patternIdParts[1]
  return routeId
}

/**
 * Filter predicate used, so that the stop viewer only shows departures from a stop
 * (arrivals at a terminus stop are not shown in the stop viewer).
 *
 * OTP2 does not include stopIndexes. TODO: restore terminus stop filtering?
 * @returns true if the given stopTime does not correspond to the last stop visited by a pattern.
 */
function excludeLastStop(stopTime) {
  return !stopTime.stopIndex || stopTime.stopIndex < stopTime.stopCount - 1
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
export function routeIsValid(route, routeId) {
  if (!route) {
    console.warn(`Cannot render stop times for missing route ID: ${routeId}`)
    return false
  }
  return true
}

export function getStopName(stop) {
  return `${stop.name} (${getStopCodeToDisplay(stop)})`
}

/**
 * Gets stop code for displaying to user.
 * @param  {Object} stop OTP stop entity
 * @return {string}      stop_code or cleaned stop_id
 */
export function getStopCodeToDisplay(stop) {
  if (!stop) return ''
  return stop.code || stop.id.split(':')[1]
}

/**
 * Run heuristic on pattern description to extract headsign from pattern description
 * @param {*} pattern pattern to extract headsign out of
 * @returns           headsign of pattern
 */
export function extractHeadsignFromPattern(pattern) {
  let headsign = pattern.headsign
  // In case stop time headsign is blank, extract headsign from the pattern 'desc' attribute
  // (format: '49 to <Destination> (<destid>)[ from <Origin> (<originid)]').
  if (isBlank(headsign)) {
    const matches = pattern?.desc?.match(/(?: to )(.*?)(?: \()/)
    if (matches) {
      headsign = matches[1]
    }
  }

  // If that regex didn't work, try the old regex
  if (isBlank(headsign)) {
    const matches = pattern?.desc?.match(/ to ([^(from)]+) \(.+\)/)
    if (matches) {
      headsign = matches[1]
    }
  }

  // If the headsign is still blank, show the description
  if (isBlank(headsign)) {
    headsign = pattern?.desc || ''
  }

  return headsign
}

export function getStopTimesByPattern(stopData) {
  const stopTimesByPattern = {}
  if (stopData && stopData.routes && stopData.stopTimes) {
    stopData.stopTimes.forEach(({ pattern, times }) => {
      const routeId = getRouteIdForPattern(pattern)

      let headsign = times[0] && times[0].headsign
      // If times didn't provide a headsign, extract it from the pattern
      if (isBlank(headsign)) {
        headsign = extractHeadsignFromPattern(pattern)
      }
      pattern.headsign = headsign

      const id = `${routeId}-${headsign}`
      if (!(id in stopTimesByPattern)) {
        const route = stopData.routes.find((r) => r.id === routeId)
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
          pattern,
          route,
          times: []
        }
      }
      // Exclude the last stop, as the stop viewer doesn't show arrival times to a terminus stop.
      const filteredTimes = times.filter(excludeLastStop)

      stopTimesByPattern[id].times =
        stopTimesByPattern[id].times.concat(filteredTimes)
    })
  }
  return stopTimesByPattern
}

/**
 * Gets the mode string from either an OTP Route or RouteShort model. The OTP
 * Route model returns the mode as an integer type whereas the RouteShort model
 * returns the mode string.
 */
export function getModeFromRoute(route) {
  const modeLookup = {
    0: 'TRAM', // - Tram, Streetcar, Light rail.
    1: 'SUBWAY',
    // - Funicular.
    // TODO: 11 and 12 are not a part of OTP as of 2019-02-14, but for now just
    // associate them with bus/rail.
    // eslint-disable-next-line sort-keys
    11: 'BUS',

    // - Trolleybus.
    12: 'RAIL',

    // - Subway, Metro.
    2: 'RAIL',

    // - Rail. Used for intercity or long-distance travel.
    3: 'BUS',

    // - Bus.
    4: 'FERRY',

    // - Ferry.
    5: 'CABLE_CAR',

    // - Cable tram.
    6: 'GONDOLA',
    // - Gondola, etc.
    7: 'FUNICULAR' // - Monorail.
  }
  return route.mode || modeLookup[route.type]
}

/**
 * Gets the main mode from a stop. In most cases this is the single mode found.
 * In the case of a stop with multiple modes, this method will look at the most
 * frequently occurring mode and return that one.
 */
export const getModeFromStop = (stop) => {
  const modes = [...new Set(stop.routes?.map(getModeFromRoute))]
  if (modes.length === 1) {
    return modes[0]
  }
  if (modes.length > 1) {
    const stopModeCounts = modes.reduce((modes, cur) => {
      if (!cur) {
        return modes
      }

      if (!modes[cur]) {
        modes[cur] = 0
      }
      modes[cur]++

      return modes
    }, {})

    // Get stop mode by getting most common stop mode
    return (
      stopModeCounts &&
      Object.keys(stopModeCounts)
        // Sort by mode occurrence
        .sort((a, b) => {
          return stopModeCounts[a] - stopModeCounts[b]
        })[0]
    )
  }
}

/**
 * Comparator to sort stop times by their departure times
 * (in chronological order - 9:13am, 9:15am, etc.)
 */
export function stopTimeComparator(a, b) {
  const aTime = a.serviceDay + a.scheduledDeparture
  const bTime = b.serviceDay + b.scheduledDeparture
  return aTime - bTime
}

/**
 * Finds the stop time corresponding to the first departure
 * (the closest departure past the current time).
 */
export function getFirstDepartureFromNow(stopTimes) {
  // Search starting from the last stop time (largest seconds until departure).
  const lastStopTime = stopTimes[stopTimes.length - 1]

  let firstStopTime = lastStopTime
  stopTimes.forEach((stopTime) => {
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
export function mergeAndSortStopTimes(stopData) {
  const stopTimesByPattern = getStopTimesByPattern(stopData)

  // Merge stop times, so that we can sort them across all route patterns.
  // (stopData is assumed valid per StopViewer render condition.)
  let mergedStopTimes = []
  Object.values(stopTimesByPattern).forEach(({ pattern, route, times }) => {
    // Only add pattern if route info is returned by OTP.
    if (routeIsValid(route, getRouteIdForPattern(pattern))) {
      const filteredTimes = times.filter(excludeLastStop).map((stopTime) => {
        // Add the route attribute and headsign to each stop time for rendering route info.
        const headsign = isBlank(stopTime.headsign)
          ? pattern.headsign
          : stopTime.headsign
        return {
          ...stopTime,
          headsign,
          route
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
export function getTripStatus(
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

/**
 * Helper method that returns true only if an itinerary contains at least
 * one leg with realtime info
 */
export function containsRealtimeLeg(itinerary) {
  return itinerary.legs.some((leg) => leg?.realtime)
}

/**
 * Helper method that returns true only if an itinerary's first transit leg
 * has realtime info
 */
export function firstTransitLegIsRealtime(itinerary) {
  const firstTransitLeg = itinerary.legs.find((leg) => !!leg.transitLeg)
  return firstTransitLeg?.realTime
}

/**
 * Determine the appropriate contrast color for text (white or black) based on
 * the input hex string (e.g., '#ff00ff') value. Uses a tinted white/black if
 * it is acceptably readable.
 *
 * TODO: Move to @opentripplanner/core-utils once otp-rr uses otp-ui library.
 */
export function getContrastYIQ(routeColor) {
  const textColorOptions = [
    tinycolor(routeColor).darken(80).toHexString(),
    tinycolor(routeColor).lighten(80).toHexString(),
    tinycolor(routeColor).darken(90).toHexString(),
    tinycolor(routeColor).lighten(90).toHexString()
  ]

  return (
    tinycolor
      .mostReadable(routeColor, textColorOptions, {
        includeFallbackColors: true,
        level: 'AAA'
      })
      .toHexString()
      // Have to do this to remain compatible with former version of this function
      .split('#')[1]
  )
}

/**
 * Uses a long name splitter to prettify a route's long name
 */
function getCleanRouteLongName({ longNameSplitter, route }) {
  let longName = ''
  if (route.longName) {
    // Attempt to split route name if splitter is defined for operator (to
    // remove short name value from start of long name value).
    const nameParts = route.longName.split(longNameSplitter)
    longName =
      longNameSplitter && nameParts.length > 1 ? nameParts[1] : route.longName
    // If long name and short name are identical, set long name to be an empty
    // string.
    if (longName === route.shortName) longName = ''
  }
  return longName
}
/**
 * Using an operator and route, apply heuristics to determine color and contrast color
 * as well as a full route name
 */
export function getColorAndNameFromRoute(operator, route) {
  const { defaultRouteColor, defaultRouteTextColor, longNameSplitter } =
    operator || {}
  const backgroundColor = `#${defaultRouteColor || route.color || 'ffffff'}`
  // NOTE: text color is not a part of short response route object, so there
  // is no way to determine from OTP what the text color should be if the
  // background color is, say, black. Instead, determine the appropriate
  // contrast color and use that if no text color is available.
  const contrastColor = getContrastYIQ(backgroundColor)
  const color = `#${defaultRouteTextColor || route.textColor || contrastColor}`
  // Default long name is empty string (long name is an optional GTFS value).
  const longName = getCleanRouteLongName({ longNameSplitter, route })

  // Choose a color that the text color will look good against

  return {
    backgroundColor,
    color,
    longName
  }
}

/**
 * Helper method to determine if a stop being viewed is a flex stop. This is not marked by
 * otp, so we must use the geometry type to determine flex status (flex stops do not use points)
 *
 * Extra null checks are needed to avoid mistaking a stop where data has not yet loaded for
 * a flex stop.
 */
export function stopIsFlex(stopData) {
  return (
    stopData &&
    stopData.geometries &&
    stopData.geometries.geoJson?.type !== 'Point'
  )
}

/**
 * The RouteRenderer requires a leg. To get it to render a Route object,
 * we use this method
 */
export function generateFakeLegForRouteRenderer(route) {
  // RouteRenderer requires a "leg"
  return {
    agencyName: route?.agencyName || route.agency?.name,
    mode: getModeFromRoute(route),
    routeColor: route.color,
    routeLongName: route.longName,
    routeShortName: route.shortName,
    routeTextColor: route.textColor
  }
}
