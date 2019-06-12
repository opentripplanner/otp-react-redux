import React from 'react'
import { latLngBounds } from 'leaflet'
import polyline from '@mapbox/polyline'
import turfAlong from 'turf-along'

import ModeIcon from '../components/icons/mode-icon'

// All OTP transit modes
export const transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA']

/**
 * @param  {config} config OTP-RR configuration object
 * @return {Array}  List of all transit modes defined in config; otherwise default mode list
 */

export function getTransitModes (config) {
  if (!config || !config.modes || !config.modes.transitModes) return transitModes
  return config.modes.transitModes.map(tm => tm.mode)
}

export function isTransit (mode) {
  return transitModes.includes(mode) || mode === 'TRANSIT'
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are transit modes
 */
export function hasTransit (modesStr) {
  for (const mode of modesStr.split(',')) {
    if (isTransit(mode)) return true
  }
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are car-based modes
 */
export function hasCar (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (isCar(mode)) return true
    }
  }
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are bicycle-based modes
 */
export function hasBike (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (isBicycle(mode) || isBicycleRent(mode)) return true
    }
  }
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are micromobility-based modes
 */
export function hasMicromobility (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (isMicromobility(mode)) return true
    }
  }
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a hailing mode
 */
export function hasVehicleHailing (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (mode.indexOf('_HAIL') > -1) return true
    }
  }
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a rental mode
 */
export function hasVehicleRental (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (mode.indexOf('_RENT') > -1) return true
    }
  }
  return false
}

export function isWalk (mode) {
  if (!mode) return false

  return mode === 'WALK'
}

export function isBicycle (mode) {
  if (!mode) return false

  return mode === 'BICYCLE'
}

export function isBicycleRent (mode) {
  if (!mode) return false

  return mode === 'BICYCLE_RENT'
}

export function isCar (mode) {
  if (!mode) return false
  return mode.startsWith('CAR')
}

export function isMicromobility (mode) {
  if (!mode) return false
  return mode.startsWith('MICROMOBILITY')
}

export function isAccessMode (mode) {
  return isWalk(mode) ||
    isBicycle(mode) ||
    isBicycleRent(mode) ||
    isCar(mode) ||
    isMicromobility(mode)
}

export function getMapColor (mode) {
  mode = mode || this.get('mode')
  if (mode === 'WALK') return '#444'
  if (mode === 'BICYCLE') return '#0073e5'
  if (mode === 'SUBWAY') return '#f00'
  if (mode === 'RAIL') return '#b00'
  if (mode === 'BUS') return '#080'
  if (mode === 'TRAM') return '#800'
  if (mode === 'FERRY') return '#008'
  if (mode === 'CAR') return '#444'
  if (mode === 'MICROMOBILITY') return '#f5a729'
  return '#aaa'
}

// TODO: temporary code; handle via migrated OTP i18n language table
export function getStepDirection (step) {
  switch (step.relativeDirection) {
    case 'DEPART': return 'Head ' + step.absoluteDirection.toLowerCase()
    case 'LEFT': return 'Left'
    case 'HARD_LEFT': return 'Hard left'
    case 'SLIGHTLY_LEFT': return 'Slight left'
    case 'CONTINUE': return 'Continue'
    case 'SLIGHTLY_RIGHT': return 'Slight right'
    case 'RIGHT': return 'Right'
    case 'HARD_RIGHT': return 'Hard right'
    case 'CIRCLE_CLOCKWISE': return 'Follow circle clockwise'
    case 'CIRCLE_COUNTERCLOCKWISE': return 'Follow circle counterclockwise'
    case 'ELEVATOR': return 'Take elevator'
    case 'UTURN_LEFT': return 'Left U-turn'
    case 'UTURN_RIGHT': return 'Right U-turn'
  }
  return step.relativeDirection
}

export function getStepStreetName (step) {
  if (step.streetName === 'road') return 'Unnamed Road'
  if (step.streetName === 'path') return 'Unnamed Path'
  return step.streetName
}

export function getLegModeLabel (leg) {
  switch (leg.mode) {
    case 'BICYCLE_RENT': return 'Biketown'
    case 'CAR': return leg.hailedCar ? 'Ride' : 'Drive'
    case 'GONDOLA': return 'Aerial Tram'
    case 'TRAM':
      if (leg.routeLongName.toLowerCase().indexOf('streetcar') !== -1) return 'Streetcar'
      return 'Light Rail'
    case 'MICROMOBILITY': return 'Ride'
  }
  return toSentenceCase(leg.mode)
}

export function getIcon (iconId, customIcons) {
  // Check if there is a custom icon
  if (customIcons && iconId in customIcons) {
    return customIcons[iconId]
  }

  // Use default car icon for any car-based modes that didn't have custom icon
  if (iconId && iconId.startsWith('CAR')) iconId = 'CAR'

  // Otherwise, return the default icon
  return <ModeIcon mode={iconId} />
}

export function getItineraryBounds (itinerary) {
  let coords = []
  itinerary.legs.forEach(leg => {
    const legCoords = polyline
      .toGeoJSON(leg.legGeometry.points)
      .coordinates.map(c => [c[1], c[0]])
    coords = [...coords, ...legCoords]
  })
  return latLngBounds(coords)
}

export function getLegBounds (leg) {
  return latLngBounds(polyline
    .toGeoJSON(leg.legGeometry.points)
    .coordinates.map(c => [c[1], c[0]])
  )
}

export function routeComparator (a, b) {
  let aComp, bComp
  if (a.sortOrder !== null && b.sortOrder !== null) {
    aComp = a.sortOrder
    bComp = b.sortOrder
  } else if (!isNaN(parseInt(a.shortName)) && !isNaN(parseInt(b.shortName))) {
    aComp = parseInt(a.shortName)
    bComp = parseInt(b.shortName)
  } else {
    aComp = a.shortName || a.longName
    bComp = b.shortName || b.longName
  }
  if (aComp < bComp) return -1
  if (aComp > bComp) return 1
  return 0
}

/* Returns an interpolated lat-lon at a specified distance along a leg */

export function legLocationAtDistance (leg, distance) {
  if (!leg.legGeometry) return null

  try {
    const line = polyline.toGeoJSON(leg.legGeometry.points)
    const pt = turfAlong(line, distance, 'meters')
    if (pt && pt.geometry && pt.geometry.coordinates) {
      return [
        pt.geometry.coordinates[1],
        pt.geometry.coordinates[0]
      ]
    }
  } catch (e) { }

  return null
}

/* Returns an interpolated elevation at a specified distance along a leg */

export function legElevationAtDistance (points, distance) {
  // Iterate through the combined elevation profile
  let traversed = 0
  // If first point distance is not zero, insert starting point at zero with
  // null elevation. Encountering this value should trigger the warning below.
  if (points[0][0] > 0) {
    points.unshift([0, null])
  }
  for (let i = 1; i < points.length; i++) {
    const start = points[i - 1]
    const elevDistanceSpan = points[i][0] - start[0]
    if (distance >= traversed && distance <= traversed + elevDistanceSpan) {
      // Distance falls within this point and the previous one;
      // compute & return iterpolated elevation value
      if (start[1] === null) {
        console.warn('Elevation value does not exist for distance.', distance, traversed)
        return null
      }
      const pct = (distance - traversed) / elevDistanceSpan
      const elevSpan = points[i][1] - start[1]
      return start[1] + elevSpan * pct
    }
    traversed += elevDistanceSpan
  }
  console.warn('Elevation value does not exist for distance.', distance, traversed)
  return null
}

// Iterate through the steps, building the array of elevation points and
// keeping track of the minimum and maximum elevations reached
export function getElevationProfile (steps, unitConversion = 1) {
  let minElev = 100000
  let maxElev = -100000
  let traversed = 0
  let gain = 0
  let loss = 0
  let previous = null
  const points = []
  steps.forEach((step, stepIndex) => {
    if (!step.elevation || step.elevation.length === 0) {
      traversed += step.distance
      return
    }
    for (let i = 0; i < step.elevation.length; i++) {
      const elev = step.elevation[i]
      if (previous) {
        const diff = (elev.second - previous.second) * unitConversion
        if (diff > 0) gain += diff
        else loss += diff
      }
      if (i === 0 && elev.first !== 0) {
        // console.warn(`No elevation data available for step ${stepIndex}-${i} at beginning of segment`, elev)
      }
      const convertedElevation = elev.second * unitConversion
      if (convertedElevation < minElev) minElev = convertedElevation
      if (convertedElevation > maxElev) maxElev = convertedElevation
      points.push([traversed + elev.first, elev.second])
      // Insert "filler" point if the last point in elevation profile does not
      // reach the full distance of the step.
      if (i === step.elevation.length - 1 && elev.first !== step.distance) {
        // points.push([traversed + step.distance, elev.second])
      }
      previous = elev
    }
    traversed += step.distance
  })
  return { maxElev, minElev, points, traversed, gain, loss }
}

/**
 * Uses canvas.measureText to compute and return the width of the given text of given font in pixels.
 *
 * @param {string} text The text to be rendered.
 * @param {string} font The css font descriptor that text is to be rendered with (e.g. "bold 14px verdana").
 *
 * @see https://stackoverflow.com/questions/118241/calculate-text-width-with-javascript/21015393#21015393
 */
export function getTextWidth (text, font = '22px Arial') {
  // re-use canvas object for better performance
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'))
  var context = canvas.getContext('2d')
  context.font = font
  var metrics = context.measureText(text)
  return metrics.width
}

export function toSentenceCase (str) {
  if (str == null) {
    return ''
  }
  str = String(str)
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
}

// Return an icon key depending on the mode
export function getLegIconKey (leg) {
  const legModeStr = leg.mode
  if (legModeStr === 'CAR' && leg.rentedCar) {
    return leg.rentedCarData.companies[0]
  } else if (legModeStr === 'CAR' && leg.tncData) {
    return leg.tncData.company
  } else if (legModeStr === 'BICYCLE' && leg.rentedBike) {
    // hack for current TriMet MOD project
    return 'BIKETOWN'
  } else if (legModeStr === 'MICROMOBILITY' && leg.rentedVehicle) {
    return leg.rentedVehicleData.companies[0]
  }

  return legModeStr
}

export function getPlaceName (place) {
  // If address is provided (i.e. for carshare station, use it)
  return place.address ? place.address.split(',')[0] : place.name
}

export function getTNCLocation (leg, type) {
  const location = leg[type]
  return `${location.lat.toFixed(5)},${location.lon.toFixed(5)}`
}

export function calculatePhysicalActivity (itinerary) {
  let walkDuration = 0
  let bikeDuration = 0
  for (const leg of itinerary.legs) {
    if (leg.mode.startsWith('WALK')) walkDuration += leg.duration
    if (leg.mode.startsWith('BICYCLE')) bikeDuration += leg.duration
  }
  const caloriesBurned =
    walkDuration / 3600 * 280 +
    bikeDuration / 3600 * 290
  return {
    bikeDuration,
    caloriesBurned,
    walkDuration
  }
}

export function calculateFares (itinerary) {
  let transitFare = 0
  let symbol = '$' // default to USD
  let dollarsToString = dollars => `${symbol}${dollars.toFixed(2)}`
  let centsToString = cents => `${symbol}${(cents / Math.pow(10, 2)).toFixed(2)}`
  if (itinerary.fare && itinerary.fare.fare && itinerary.fare.fare.regular) {
    const reg = itinerary.fare.fare.regular
    symbol = reg.currency.symbol
    transitFare = reg.cents
    centsToString = cents => `${symbol}${(cents / Math.pow(10, reg.currency.defaultFractionDigits)).toFixed(reg.currency.defaultFractionDigits)}`
    dollarsToString = dollars => `${symbol}${dollars.toFixed(2)}`
  }

  // Process any TNC fares
  let minTNCFare = 0
  let maxTNCFare = 0
  for (const leg of itinerary.legs) {
    if (leg.mode === 'CAR' && leg.hailedCar && leg.tncData) {
      const { maxCost, minCost } = leg.tncData
      // TODO: Support non-USD
      minTNCFare += minCost
      maxTNCFare += maxCost
    }
  }
  return {
    centsToString,
    dollarsToString,
    maxTNCFare,
    minTNCFare,
    transitFare
  }
}

export function getTimeZoneOffset (itinerary) {
  if (!itinerary.legs || !itinerary.legs.length) return 0

  // Determine if there is a DST offset between now and the itinerary start date
  const dstOffset = new Date(itinerary.startTime).getTimezoneOffset() - new Date().getTimezoneOffset()

  return itinerary.legs[0].agencyTimeZoneOffset + (new Date().getTimezoneOffset() + dstOffset) * 60000
}
