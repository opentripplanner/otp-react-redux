import React from 'react'
import { latLngBounds } from 'leaflet'
import polyline from '@mapbox/polyline'
import turfAlong from '@turf/along'

import ModeIcon from '../components/icons/mode-icon'

// All OTP transit modes
export const transitModes = ['TRAM', 'BUS', 'SUBWAY', 'FERRY', 'RAIL', 'GONDOLA']

// Good to go.
/**
 * @param  {config} config OTP-RR configuration object
 * @return {Array}  List of all transit modes defined in config; otherwise default mode list
 */
export function getTransitModes (config) {
  if (!config || !config.modes || !config.modes.transitModes) return transitModes
  return config.modes.transitModes.map(tm => tm.mode)
}

// Good to go.
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

// CHECK arg
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

// CHECK arg
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

// CHECK arg
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

// CHECK arg
/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a hailing mode
 */
export function hasHail (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (mode.indexOf('_HAIL') > -1) return true
    }
  }
  return false
}

// CHECK arg
/**
 * @param  {string}  modesStr a comma-separated list of OTP modes
 * @return {boolean} whether any of the modes is a rental mode
 */
export function hasRental (modesStr) {
  if (modesStr) {
    for (const mode of modesStr.split(',')) {
      if (mode.indexOf('_RENT') > -1) return true
    }
  }
  return false
}

// Good to go.
export function isWalk (mode) {
  if (!mode) return false

  return mode === 'WALK'
}

// Good to go.
export function isBicycle (mode) {
  if (!mode) return false

  return mode === 'BICYCLE'
}

// Good to go.
export function isBicycleRent (mode) {
  if (!mode) return false

  return mode === 'BICYCLE_RENT'
}

// Good to go.
export function isCar (mode) {
  if (!mode) return false
  return mode.startsWith('CAR')
}

// Good to go.
export function isMicromobility (mode) {
  if (!mode) return false
  return mode.startsWith('MICROMOBILITY')
}

// Good to go.
export function isAccessMode (mode) {
  return isWalk(mode) ||
    isBicycle(mode) ||
    isBicycleRent(mode) ||
    isCar(mode) ||
    isMicromobility(mode)
}

// Good to go.
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

// Good to go.
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

// Good to go.
export function getStepInstructions (step) {
  const conjunction = step.relativeDirection === 'ELEVATOR' ? 'to' : 'on'
  return `${getStepDirection(step)} ${conjunction} ${step.streetName}`
}

// Good to go.
export function getStepStreetName (step) {
  if (step.streetName === 'road') return 'Unnamed Road'
  if (step.streetName === 'path') return 'Unnamed Path'
  return step.streetName
}

// Good to go.
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

/**
 * Returns a react element of the desired icon. If customIcons are defined, then
 * the icon will be attempted to be used from that lookup of icons. Otherwise,
 * a ModeIcon element will be returned.
 *
 * @param  {string} iconId  A string with the desired icon ID. This icon can
 * include modes or companies or anything that is defined in the customIcons.
 * @param  {[Map<string, React.Element>]} customIcons A customized lookup of
 * icons. These are defined as part of the implementing webapp. If this lookup
 * is not defined, then the ModeIcon class will be used instead.
 * @return {React.Element}
 */
export function getIcon (iconId, customIcons) {
  // Check if there is a custom icon
  if (customIcons && iconId in customIcons) {
    return customIcons[iconId]
  }

  // Custom icon not available for the given iconId. Use the ModeIcon component
  // to show the icon based on the iconId, but always use the default car icon
  // for any car-based modes that didn't have custom icon
  if (iconId && iconId.startsWith('CAR')) iconId = 'CAR'
  return <ModeIcon mode={iconId} />
}

// DIFFERENT!!
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

// DIFFERENT!
/**
 * Return a leaflet LatLngBounds object that encloses the given leg's geometry.
 */
export function getLegBounds (leg) {
  const coords = polyline
    .toGeoJSON(leg.legGeometry.points)
    .coordinates.map(c => [c[1], c[0]])

  // in certain cases, there might be zero-length coordinates in the leg
  // geometry. In these cases, build us an array of coordinates using the from
  // and to data of the leg.
  if (coords.length === 0) {
    coords.push([leg.from.lat, leg.from.lon], [leg.to.lat, leg.to.lon])
  }
  return latLngBounds(coords)
}

// CHECK THIS ONE
/**
 * Gets the desired sort values according to an optional getter function. If the
 * getter function is not defined, the original sort values are returned.
 */
function getSortValues (getterFn, a, b) {
  let aVal
  let bVal
  if (typeof getterFn === 'function') {
    aVal = getterFn(a)
    bVal = getterFn(b)
  } else {
    aVal = a
    bVal = b
  }
  return { aVal, bVal }
}

// Lookup for the sort values associated with various OTP modes.
// Note: JSDoc format not used to avoid bug in documentationjs.
// https://github.com/documentationjs/documentation/issues/372
const modeComparatorValue = {
  SUBWAY: 1,
  TRAM: 2,
  RAIL: 3,
  GONDOLA: 4,
  FERRY: 5,
  CABLE_CAR: 6,
  FUNICULAR: 7,
  BUS: 8
}

// Lookup that maps route types to the OTP mode sort values.
// Note: JSDoc format not used to avoid bug in documentationjs.
// https://github.com/documentationjs/documentation/issues/372
const routeTypeComparatorValue = {
  0: modeComparatorValue.TRAM, // - Tram, Streetcar, Light rail.
  1: modeComparatorValue.SUBWAY, // - Subway, Metro.
  2: modeComparatorValue.RAIL, // - Rail. Used for intercity or long-distance travel.
  3: modeComparatorValue.BUS, // - Bus.
  4: modeComparatorValue.FERRY, // - Ferry.
  5: modeComparatorValue.CABLE_CAR, // - Cable tram.
  6: modeComparatorValue.GONDOLA, // - Gondola, etc.
  7: modeComparatorValue.FUNICULAR, // - Funicular.
  // TODO: 11 and 12 are not a part of OTP as of 2019-02-14, but for now just
  // associate them with bus/rail.
  11: modeComparatorValue.BUS, // - Trolleybus.
  12: modeComparatorValue.RAIL // - Monorail.
}

// CHECK THIS ONE
// Gets a comparator value for a given route's type (OTP mode).
// Note: JSDoc format not used to avoid bug in documentationjs.
// ttps://github.com/documentationjs/documentation/issues/372
function getRouteTypeComparatorValue (route) {
  // For some strange reason, the short route response in OTP returns the
  // string-based modes, but the long route response returns the
  // integer route type. This attempts to account for both of those cases.
  if (!route) throw new Error('Route is undefined.', route)
  if (typeof modeComparatorValue[route.mode] !== 'undefined') {
    return modeComparatorValue[route.mode]
  } else if (typeof routeTypeComparatorValue[route.type] !== 'undefined') {
    return routeTypeComparatorValue[route.type]
  } else {
    // Default the comparator value to a large number (placing the route at the
    // end of the list).
    console.warn('no mode/route type found for route', route)
    return 9999
  }
}

// CHANGED
/**
 * Calculates the sort comparator value given two routes based off of route type
 * (OTP mode).
 */
function routeTypeComparator (a, b) {
  return getRouteTypeComparatorValue(a) - getRouteTypeComparatorValue(b)
}

/**
 * Determines whether a value is a string that starts with an alphabetic
 * ascii character.
 */
function startsWithAlphabeticCharacter (val) {
  if (typeof val === 'string' && val.length > 0) {
    const firstCharCode = val.charCodeAt(0)
    return (firstCharCode >= 65 && firstCharCode <= 90) ||
      (firstCharCode >= 97 && firstCharCode <= 122)
  }
  return false
}
// Check this one => Replace with routeComparator.
/**
 * Sorts routes based off of whether the shortName begins with an alphabetic
 * character. Routes with shortn that do start with an alphabetic character will
 * be prioritized over those that don't.
 */
function alphabeticShortNameComparator (a, b) {
  const aStartsWithAlphabeticCharacter = startsWithAlphabeticCharacter(
    a.shortName
  )
  const bStartsWithAlphabeticCharacter = startsWithAlphabeticCharacter(
    b.shortName
  )

  if (aStartsWithAlphabeticCharacter && bStartsWithAlphabeticCharacter) {
    // both start with an alphabetic character, return equivalence
    return 0
  }
  // a does start with an alphabetic character, but b does not. Prioritize a
  if (aStartsWithAlphabeticCharacter) return -1
  // b does start with an alphabetic character, but a does not. Prioritize b
  if (bStartsWithAlphabeticCharacter) return 1
  // neither route has a shortName that starts with an alphabetic character.
  // Return equivalence
  return 0
}

/**
 * Checks whether an appropriate comparison of numeric values can be made for
 * sorting purposes. If both values are not valid numbers according to the
 * isNaN check, then this function returns undefined which indicates that a
 * secondary sorting criteria should be used instead. If one value is valid and
 * the other is not, then the valid value will be given sorting priority. If
 * both values are valid numbers, the difference is obtained as the sort value.
 *
 * An optional argument can be provided which will be used to obtain the
 * comparison value from the comparison function arguments.
 *
 * IMPORTANT: the comparison values must be numeric values or at least be
 * attempted to be converted to numeric values! If one of the arguments is
 * something crazy like an empty string, unexpected behavior will occur because
 * JavaScript.
 *
 * @param  {function} [objGetterFn] An optional function to obtain the
 *  comparison value from the comparator function arguments
 */
function makeNumericValueComparator (objGetterFn) {
  return (a, b) => {
    const { aVal, bVal } = getSortValues(objGetterFn, a, b)
    // if both values aren't valid numbers, use the next sort criteria
    if (isNaN(aVal) && isNaN(bVal)) return 0
    // b is a valid number, b gets priority
    if (isNaN(aVal)) return 1
    // a is a valid number, a gets priority
    if (isNaN(bVal)) return -1
    // a and b are valid numbers, return the sort value
    return aVal - bVal
  }
}

/**
 * Create a comparator function that compares string values. The comparison
 * values feed to the sort comparator function are assumed to be objects that
 * will have either undefined, null or string values at the given key. If one
 * object has undefined, null or an empty string, but the other does have a
 * string with length > 0, then that string will get priority.
 *
 * @param  {function} [objGetterFn] An optional function to obtain the
 *  comparison value from the comparator function arguments
 */
function makeStringValueComparator (objGetterFn) {
  return (a, b) => {
    const { aVal, bVal } = getSortValues(objGetterFn, a, b)
    // both a and b are uncomparable strings, return equivalent value
    if (!aVal && !bVal) return 0
    // a is not a comparable string, b gets priority
    if (!aVal) return 1
    // b is not a comparable string, a gets priority
    if (!bVal) return -1
    // a and b are comparable strings, return the sort value
    if (aVal < bVal) return -1
    if (aVal > bVal) return 1
    return 0
  }
}

// CHECK THIS ONE
/**
 * OpenTripPlanner sets the routeSortOrder to -999 by default. So, if that value
 * is encountered, assume that it actually means that the routeSortOrder is not
 * set in the GTFS.
 *
 * See https://github.com/opentripplanner/OpenTripPlanner/issues/2938
 * Also see https://github.com/opentripplanner/otp-react-redux/issues/122
 */
function getRouteSortOrderValue (val) {
  return val === -999 ? undefined : val
}

/**
 * Create a multi-criteria sort comparator function composed of other sort
 * comparator functions. Each comparator function will be ran in the order given
 * until a non-zero comparison value is obtained which is then immediately
 * returned. If all comparison functions return equivalance, then the values
 * are assumed to be equivalent.
 */
function makeMultiCriteriaSort (...criteria) {
  return (a, b) => {
    for (let i = 0; i < criteria.length; i++) {
      const curCriteriaComparatorValue = criteria[i](a, b)
      // if the comparison objects are not equivalent, return the value obtained
      // in this current criteria comparison
      if (curCriteriaComparatorValue !== 0) {
        return curCriteriaComparatorValue
      }
    }
    return 0
  }
}

// Move this and dependent functions to OTP-UI.
/**
 * Compares routes for the purposes of sorting and displaying in a user
 * interface. Due to GTFS feeds having varying levels of data quality, a multi-
 * criteria sort is needed to account for various differences. The criteria
 * included here are each applied to the routes in the order listed. If a given
 * sort criterion yields equivalence (e.g., two routes have the short name
 * "20"), the comparator falls back onto the next sort criterion (e.g., long
 * name). If desired, the criteria of sorting based off of integer shortName can
 * be disabled. The sort operates on the following values (in order):
 *
 *  1. sortOrder. Routes that do not have a valid sortOrder will be placed
 *    beneath those that do.
 *  2. route type (OTP mode). See routeTypeComparator code for prioritization of
 *    route types.
 *  3. shortNames that begin with alphabetic characters. shortNames that do not
 *    start with alphabetic characters will be place beneath those that do.
 *  4. shortName as integer. shortNames that cannot be parsed as integers will
 *    be placed beneath those that are valid.
 *  5. shortName as string. Routes without shortNames will be placed beneath
 *    those with shortNames.
 *  6. longName as string.
 */
export const routeComparator = makeMultiCriteriaSort(
  makeNumericValueComparator(obj => getRouteSortOrderValue(obj.sortOrder)),
  routeTypeComparator,
  alphabeticShortNameComparator,
  makeNumericValueComparator(obj => parseInt(obj.shortName)),
  makeStringValueComparator(obj => obj.shortName),
  makeStringValueComparator(obj => obj.longName)
)

// Good to go.
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

// Good to go.
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

// Good to go.
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

// Good to go.
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

// Good to go.
export function toSentenceCase (str) {
  if (str == null) {
    return ''
  }
  str = String(str)
  return str.charAt(0).toUpperCase() + str.substr(1).toLowerCase()
}

/**
 * Return an icon depending on the leg info
 *
 * @param  {Object} leg  The leg data of an itinerary in an OTP trip plan result
 * @param  {[Object]} customIcons If defined for this webapp, the custom icons
 * consist of a lookup table of icons to return for a specific icon ID. These
 * icons typically show either companies or transport modes, but they could show
 * other icons too. See this file in trimet-mod-otp for an example setup:
 * https://github.com/ibi-group/trimet-mod-otp/blob/6a32e2142655c4f4d09a3f349b971b7505e2866a/lib/icons/index.js#L24-L55
 */
export function getLegIcon (leg, customIcons) {
  // check if a custom function exists for determining the icon for a leg
  if (customIcons && typeof customIcons.customIconForLeg === 'function') {
    // function exits, get the icon string lookup. It's possible for there to be
    // a custom function that only returns a string for when a leg meets the
    // criteria of the custom function
    const customIconStr = customIcons.customIconForLeg(leg)
    // the customIconStr could be undefined for this leg, but if it is not, then
    // immediately return this custom icon for the leg
    if (customIconStr) return getIcon(customIconStr, customIcons)
  }
  let iconStr = leg.mode
  if (iconStr === 'CAR' && leg.rentedCar) {
    iconStr = leg.from.networks[0]
  } else if (iconStr === 'CAR' && leg.tncData) {
    iconStr = leg.tncData.company
  } else if (iconStr === 'BICYCLE' && leg.rentedBike && leg.from.networks) {
    iconStr = leg.from.networks[0]
  } else if (iconStr === 'MICROMOBILITY' && leg.rentedVehicle && leg.from.networks) {
    iconStr = leg.from.networks[0]
  }

  return getIcon(iconStr, customIcons)
}

// Good to go.
/**
 * Get the configured company object for the given network string if the company
 * has been defined in the provided companies array config.
 */
function getCompanyForNetwork (networkString, companies = []) {
  const company = companies.find(co => co.id === networkString)
  if (!company) {
    console.warn(`No company found in config.yml that matches rented vehicle network: ${networkString}`, companies)
  }
  return company
}

// Good to go.
/**
 * Get a string label to display from a list of vehicle rental networks.
 *
 * @param  {Array<string>} networks  A list of network ids.
 * @param  {Array<object>}  [companies=[]] An optional list of the companies config.
 * @return {string}  A label for use in presentation on a website.
 */
export function getCompaniesLabelFromNetworks (networks, companies = []) {
  return networks.map(network => getCompanyForNetwork(network, companies))
    .filter(co => !!co)
    .map(co => co.label)
    .join('/')
}

// Good to go.
/**
 * Returns mode name by checking the vertex type (VertexType class in OTP) for
 * the provided place. NOTE: this is currently only intended for vehicles at
 * the moment (not transit or walking).
 *
 * TODO: I18N
 * @param  {string} place place from itinerary leg
 */
export function getModeForPlace (place) {
  switch (place.vertexType) {
    case 'CARSHARE':
      return 'car'
    case 'VEHICLERENTAL':
      return 'E-scooter'
    // TODO: Should the type change depending on bike vertex type?
    case 'BIKESHARE':
    case 'BIKEPARK':
      return 'bike'
    // If company offers more than one mode, default to `vehicle` string.
    default:
      return 'vehicle'
  }
}

// Good to go.
export function getPlaceName (place, companies) {
  // If address is provided (i.e. for carshare station, use it)
  if (place.address) return place.address.split(',')[0]
  if (place.networks && place.vertexType === 'VEHICLERENTAL') {
    // For vehicle rental pick up, do not use the place name. Rather, use
    // company name + vehicle type (e.g., SPIN E-scooter). Place name is often just
    // a UUID that has no relevance to the actual vehicle. For bikeshare, however,
    // there are often hubs or bikes that have relevant names to the user.
    const company = getCompanyForNetwork(place.networks[0], companies)
    if (company) {
      return `${company.label} ${getModeForPlace(place)}`
    }
  }
  // Default to place name
  return place.name
}

// Good to go.
export function getTNCLocation (leg, type) {
  const location = leg[type]
  return `${location.lat.toFixed(5)},${location.lon.toFixed(5)}`
}

// Good to go.
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

// Good to go.
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

// Good to go.
export function getTimeZoneOffset (itinerary) {
  if (!itinerary.legs || !itinerary.legs.length) return 0

  // Determine if there is a DST offset between now and the itinerary start date
  const dstOffset = new Date(itinerary.startTime).getTimezoneOffset() - new Date().getTimezoneOffset()

  return itinerary.legs[0].agencyTimeZoneOffset + (new Date().getTimezoneOffset() + dstOffset) * 60000
}
