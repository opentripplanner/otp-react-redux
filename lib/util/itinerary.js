import React from 'react'
import { latLngBounds } from 'leaflet'
import polyline from '@mapbox/polyline'
import turfAlong from 'turf-along'

import ModeIcon from '../components/icons/mode-icon'

/**
 * @param  {string}  mode
 * @return {boolean}
 */

export const transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA']

export function isTransit (mode) {
  return transitModes.includes(mode) || mode === 'TRANSIT'
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are transit modes
 */
export function hasTransit (modesStr) {
  modesStr.split(',').forEach(mode => { if (isTransit(mode)) return true })
  return false
}

/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes are car-based modes
 */
export function hasCar (modesStr) {
  if (modesStr) {
    modesStr.split(',').forEach(mode => { if (isCar(mode)) return true })
  }
  return false
}

export function isWalk (mode) {
  mode = mode || this.get('mode')
  return mode === 'WALK'
}

export function isBicycle (mode) {
  mode = mode || this.get('mode')
  return mode === 'BICYCLE'
}

export function isBicycleRent (mode) {
  mode = mode || this.get('mode')
  return mode === 'BICYCLE_RENT'
}

export function isCar (mode) {
  mode = mode || this.get('mode')
  return mode.startsWith('CAR')
}

export function isAccessMode (mode) {
  return isWalk(mode) || isBicycle(mode) || isBicycleRent(mode) || isCar(mode)
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
  return '#aaa'
}

export function getStepInstructions (step) {
  return `${relativeDirectionString(step.relativeDirection)} on ${step.streetName}`
}

// TODO: temporary code; handle via migrated OTP i18n language table
export function relativeDirectionString (relativeDirection) {
  switch (relativeDirection) {
    case 'DEPART': return 'Depart'
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
  return relativeDirection
}

export function getModeIcon (mode, customIcons) {
  let modeStr = mode.mode || mode

  // Special handling for car-based modes
  if (modeStr === 'CAR_HAIL') {
    modeStr = `CAR_HAIL_${mode.label.toUpperCase()}`
  } else if (modeStr.startsWith('CAR')) { // covers CAR_PARK, etc.
    modeStr = 'CAR'
  }

  // Check if there is a custom icon for this mode
  if (customIcons && modeStr in customIcons) {
    return customIcons[modeStr]
  }

  // Otherwise, return the default icon
  return <ModeIcon mode={modeStr} />
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

export function routeComparator (a, b) {
  let aComp, bComp
  const aInt = parseInt(a.shortName)
  const bInt = parseInt(b.shortName)
  if (!isNaN(aInt) && !isNaN(bInt)) {
    aComp = aInt
    bComp = bInt
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

export function legElevationAtDistance (leg, distance) {
  // Iterate through the leg steps, constructing a combined profile for this leg
  let traversed = 0
  const ptArray = []
  for (let si = 0; si < leg.steps.length; si++) {
    const step = leg.steps[si]
    if (step.elevation && step.elevation.length > 0) {
      for (let ei = 0; ei < step.elevation.length; ei++) {
        const elevItem = step.elevation[ei]
        if (elevItem.first > step.length) continue
        ptArray.push({
          first: traversed + elevItem.first,
          second: elevItem.second
        })
      }
    }
    traversed += step.distance
  }

  // Iterate through the combined elevation profile
  traversed = 0
  for (let i = 1; i < ptArray.length; i++) {
    const elevDistanceSpan = ptArray[i].first - ptArray[i - 1].first
    if (distance >= traversed && distance <= traversed + elevDistanceSpan) {
      // Distance falls within this point and the previous one;
      // compute & return iterpolated elevation value
      const pct = (distance - traversed) / elevDistanceSpan
      const elevSpan = ptArray[i].second - ptArray[i - 1].second
      return ptArray[i - 1].second + elevSpan * pct
    }
    traversed += elevDistanceSpan
  }

  return null
}

export function toSentenceCase (str) {
  if (str == null) {
    return ''
  }
  str = String(str)
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
}
