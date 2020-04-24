import { latLngBounds } from 'leaflet'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import ModeIcon from '../components/icons/mode-icon'

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

export function getLeafletItineraryBounds (itinerary) {
  return latLngBounds(coreUtils.itinerary.getItineraryBounds(itinerary))
}

/**
 * Return a leaflet LatLngBounds object that encloses the given leg's geometry.
 */
export function getLeafletLegBounds (leg) {
  return latLngBounds(coreUtils.itinerary.getLegBounds(leg))
}

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
