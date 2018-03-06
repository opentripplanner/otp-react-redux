import React from 'react'
import { latLngBounds } from 'leaflet'
import polyline from '@mapbox/polyline'

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
  let result = false
  modesStr.split(',').forEach(mode => {
    if (isTransit(mode)) result = true
  })
  return result
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
  return mode === 'CAR' || mode === 'CAR_HAIL'
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
  return `${step.relativeDirection} on ${step.streetName}`
}

export function getModeIcon (mode, customIcons) {
  let modeStr = mode.mode || mode
  if (mode.mode === 'CAR_HAIL') {
    modeStr = `CAR_HAIL_${mode.label.toUpperCase()}`
  }
  if (customIcons && modeStr in customIcons) {
    return customIcons[modeStr]
  }
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

export function toSentenceCase (str) {
  if (str == null) {
    return ''
  }
  str = String(str)
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
}
