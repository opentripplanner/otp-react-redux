import coreUtils from '@opentripplanner/core-utils'

import { CREATE_ACCOUNT_PLACES_PATH, PLACES_PATH } from './constants'
import { getFormattedPlaces } from './i18n'
import { isBlank } from './ui'

const { toSentenceCase } = coreUtils.itinerary
const { formatStoredPlaceName } = coreUtils.map

/**
 * Determines whether a loggedInUser is a new user
 * that needs to complete the new account wizard.
 */
export function isNewUser(loggedInUser) {
  return !loggedInUser.hasConsentedToTerms
}

// Helper functions to determine if
// a location is home or work.
export const isHome = (loc) => loc.type === 'home'
export const isWork = (loc) => loc.type === 'work'
export const isHomeOrWork = (loc) => isHome(loc) || isWork(loc)

/**
 * An index of common place types (excluding Home and Work),
 * each type including a display name and the FontAwesome icon name.
 * Add the supported place types below as needed.
 */
export const CUSTOM_PLACE_TYPES = {
  custom: {
    icon: 'map-marker',
    type: 'custom'
  },
  dining: {
    icon: 'cutlery',
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
    type: 'home'
  },
  work: {
    icon: 'briefcase',
    type: 'work'
  }
}

// Defaults for home and work
const BLANK_HOME = {
  ...PLACE_TYPES.home,
  address: '',
  blank: true
}
const BLANK_WORK = {
  ...PLACE_TYPES.work,
  address: '',
  blank: true
}

/**
 * Moves the 'home' and 'work' locations of the provided user to the beginning of
 * the savedLocations list, so they are always shown at the top of the FavoritePlacesPane.
 * The name field is set to 'Home' and 'Work' (or translated equivalent)
 * regardless of the value that was persisted.
 */
export function positionHomeAndWorkFirst(userData, homeName, workName) {
  // Note: cloning is not necessary as the data is obtained from fetch.
  const { savedLocations = [] } = userData

  const homeLocation = savedLocations.find(isHome) || BLANK_HOME
  const workLocation = savedLocations.find(isWork) || BLANK_WORK

  homeLocation.name = homeName || 'Home'
  workLocation.name = workName || 'Work'

  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(
      (loc) => loc !== homeLocation && loc !== workLocation
    )
  ]

  userData.savedLocations = reorderedLocations
}

/**
 * Convert a LocationField entry to a persisted user savedLocations:
 * - The icon for "Work" places is changed to 'briefcase',
 * - The address attribute is filled with the 'name' if available.
 */
export function convertToPlace(location) {
  const { icon, lat, lon, name, type } = location
  return {
    address: name,
    icon: isWork(location) ? 'briefcase' : icon,
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
export function getPersistenceStrategy(persistence) {
  return persistence && persistence.enabled && persistence.strategy
}

/**
 * Convert an entry from persisted user savedLocations into LocationField locations:
 * - The icon for "Work" places is changed to 'work',
 * - The name attribute is filled with the place address.
 */
export function convertToLocation(place) {
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
 * Remove entries with blank addresses, and convert entries
 * from persisted user savedLocations into LocationField/EndpointOverlay locations.
 */
export function getOtpUiLocations(loggedInUser) {
  return loggedInUser
    ? loggedInUser.savedLocations
        .filter((place) => !isBlank(place.address))
        .map(convertToLocation)
    : []
}

/**
 * Obtains the base path for editing a place depending on whether user is creating a new account.
 */
export function getPlaceBasePath(isCreating) {
  return isCreating ? CREATE_ACCOUNT_PLACES_PATH : PLACES_PATH
}

/**
 * Constructs the detail text of a favorite place.
 * That text is typically the address of a location
 * or, for unset home or work locations, a prompt for
 * the user to set the address, as in:
 *   Home
 *   123 Main Street
 * or
 *   Home
 *   Set your home address
 */
export function getPlaceDetail(place, intl, isUsingOtpMiddleware) {
  // intl.formatMessage is used because this text can appear in tooltips.
  // FIXME_QBD: unify the two location models.
  return (
    (isUsingOtpMiddleware ? place.address : place.name) ||
    intl.formatMessage(
      { id: 'components.FavoritePlaceList.setAddressForPlaceType' },
      { placeType: getFormattedPlaces(place.type, intl) }
    )
  )
}

/**
 * Constructs the main text of a favorite place.
 * That text is typically the nickname a location
 * or, for home or work locations, the corresponding localized text,
 * as in:
 *   Home
 *   123 Main Street
 * or
 *   Mom's house
 *   123 Main Street
 */
export function getPlaceMainText(place, intl, isUsingOtpMiddleware) {
  // FIXME_QBD: unify the two location models.
  // Use toSentenceCase (and not text-transform: capitalize)
  // to change the first char. of the work and home locations only (which come in lowercase).
  return isHomeOrWork(place)
    ? toSentenceCase(
        isUsingOtpMiddleware ? place.name : getFormattedPlaces(place.type, intl)
      )
    : place.name || place.address
}
