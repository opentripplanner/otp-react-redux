import coreUtils from '@opentripplanner/core-utils'

import { isBlank } from './ui'

const { formatStoredPlaceName } = coreUtils.map

/**
 * Determines whether a loggedInUser is a new user
 * that needs to complete the new account wizard.
 */
export function isNewUser (loggedInUser) {
  return !loggedInUser.hasConsentedToTerms
}

// Helper functions to determine if
// a location is home or work.
export const isHome = loc => loc.type === 'home'
export const isWork = loc => loc.type === 'work'
export const isHomeOrWork = loc => isHome(loc) || isWork(loc)

/**
 * An index of common place types (excluding Home and Work),
 * each type including a display name and the FontAwesome icon name.
 * Add the supported place types below as needed.
 */
export const CUSTOM_PLACE_TYPES = {
  custom: {
    icon: 'map-marker',
    name: 'Custom',
    type: 'custom'
  },
  dining: {
    icon: 'cutlery',
    name: 'Dining',
    type: 'dining'
  }
}

/**
 * The above, with Home and Work locations added.
 */
export const PLACE_TYPES = {
  ...CUSTOM_PLACE_TYPES,
  home: {
    icon: 'home',
    name: 'Home',
    type: 'home'
  },
  work: {
    icon: 'briefcase',
    name: 'Work',
    type: 'work'
  }
}

// Defaults for home and work
const BLANK_HOME = {
  ...PLACE_TYPES.home,
  address: ''
}
const BLANK_WORK = {
  ...PLACE_TYPES.work,
  address: ''
}

/**
 * Moves the 'home' and 'work' locations of the provided user to the beginning of
 * the savedLocations list, so they are always shown at the top of the FavoritePlacesPane.
 * The name field is set to 'Home' and 'Work' regardless of the value that was persisted.
 */
export function positionHomeAndWorkFirst (userData) {
  // Note: cloning is not necessary as the data is obtained from fetch.
  const { savedLocations = [] } = userData

  const homeLocation = savedLocations.find(isHome) || BLANK_HOME
  const workLocation = savedLocations.find(isWork) || BLANK_WORK

  homeLocation.name = BLANK_HOME.name
  workLocation.name = BLANK_WORK.name

  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(loc => loc !== homeLocation && loc !== workLocation)
  ]

  userData.savedLocations = reorderedLocations
}

/**
 * Convert a LocationField entry to a persisted user savedLocations:
 * - id is included if requested,
 * - The icon for "Work" places is changed to 'briefcase',
 * - The address attribute is filled with the 'name' if available.
 */
export function convertToPlace (location, includeId) {
  const { icon, id, lat, lon, name, type } = location
  return {
    address: name,
    icon: isWork(location) ? 'briefcase' : icon,
    id: includeId ? id : undefined,
    lat,
    lon,
    name: formatStoredPlaceName(location, false),
    type
  }
}

/**
 * Returns the persistence.strategy string if the following apply in config.yml, null otherwise:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is defined.
 */
export function getPersistenceStrategy (persistence) {
  return persistence && persistence.enabled && persistence.strategy
}

/**
 * Convert an entry from persisted user savedLocations into LocationField locations:
 * - The icon for "Work" places is changed to 'work',
 * - The name attribute is filled with the place address.
 */
export function convertToLocation (place) {
  const { address, icon, lat, lon, name, type } = place
  return {
    icon: isWork(place) ? 'work' : icon,
    lat,
    lon,
    name: address || name,
    type
  }
}

/**
 * Remove entries with blank addresses, and
 * convert entries from persisted user savedLocations into LocationField locations.
 */
export function getOtpUiLocations (loggedInUser) {
  return loggedInUser
    ? loggedInUser.savedLocations
      .filter(place => !isBlank(place.address))
      .map(convertToLocation)
    : []
}

/**
 * Determines whether to allow a place to be deleted.
 * @returns true if a place is not 'home' or 'work', or if it is, it should have an address or not be marked blank'.
 */
export function canDeletePlace (place, useBlankFlag) {
  return !isHomeOrWork(place) || (useBlankFlag && !place.blank) || place.address
}
