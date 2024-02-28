import { addInParentheses } from '@opentripplanner/location-field/lib/utils'
import coreUtils from '@opentripplanner/core-utils'

import {
  CREATE_ACCOUNT_PLACES_PATH,
  PERSIST_TO_LOCAL_STORAGE,
  PERSIST_TO_OTP_MIDDLEWARE,
  PLACES_PATH
} from './constants'
import { getFormattedPlaces } from './i18n'
import { isBlank } from './ui'

const { toSentenceCase } = coreUtils.itinerary

export const NONE_SINGLETON = ['none']

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

/**
 * Moves the 'home' and 'work' locations of the provided user to the beginning of
 * the savedLocations list, so they are always shown at the top of the FavoritePlacesPane.
 */
export function positionHomeAndWorkFirst(userData) {
  // Note: cloning is not necessary as the data is obtained from fetch.
  const { savedLocations = [] } = userData

  const homeLocation = savedLocations.find(isHome) || PLACE_TYPES.home
  const workLocation = savedLocations.find(isWork) || PLACE_TYPES.work

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
 * Sets at least the "none" option to the mobilityProfile.mobilityDevices.
 * If no mobility profile attribute exists, initialize it.
 */
export function setAtLeastNoMobilityDevice(userData) {
  // Note: cloning is not necessary as the data is obtained from fetch.
  const { mobilityProfile } = userData
  if (mobilityProfile) {
    const { mobilityDevices } = mobilityProfile
    if (!mobilityDevices || mobilityDevices.length === 0) {
      mobilityProfile.mobilityDevices = NONE_SINGLETON
    }
  } else {
    userData.mobilityProfile = {
      mobilityDevices: NONE_SINGLETON
    }
  }
}

/**
 * Cleanup the device selection vs the 'none' choice.
 */
export function cleanupMobilityDevices(
  mobilityProfile,
  initialMobilityDevices
) {
  if (mobilityProfile && initialMobilityDevices) {
    const { mobilityDevices } = mobilityProfile
    const noneWasSelected = initialMobilityDevices.includes('none')
    if (mobilityDevices.includes('none') && !noneWasSelected) {
      // If the user checks 'none', remove other devices that were checked.
      mobilityProfile.mobilityDevices = NONE_SINGLETON
    } else if (mobilityDevices.length > 1 && noneWasSelected) {
      // If devices are selected while 'none' is checked, remove 'none'.
      mobilityProfile.mobilityDevices = mobilityDevices.filter(
        (d) => d !== 'none'
      )
    }
  }
}

/**
 * Returns the persistence.strategy string if the following apply in config.yml, null otherwise:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is defined.
 */
function getPersistenceStrategy(persistence) {
  return persistence?.enabled && persistence?.strategy
}

/**
 * @returns true if the persistence strategy is OTP middleware, false otherwise.
 */
export function isOtpMiddleware(persistence) {
  return getPersistenceStrategy(persistence) === PERSIST_TO_OTP_MIDDLEWARE
}

/**
 * Constructs information regarding the persistence strategy.
 */
export function getPersistenceMode(persistence) {
  const persistenceStrategy = getPersistenceStrategy(persistence)
  return {
    isLocalStorage: persistenceStrategy === PERSIST_TO_LOCAL_STORAGE,
    isOtpMiddleware: persistenceStrategy === PERSIST_TO_OTP_MIDDLEWARE
  }
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
    name,
    type
  }
}

/**
 * Convert an entry from persisted user savedLocations into LocationField locations:
 * - The icon for "Work" places is changed to 'work',
 * - The name attribute is filled with the place address.
 */
export function convertToLegacyLocation(place) {
  const { address, icon, id, lat, lon, name, type } = place
  return {
    icon: isWork(place) ? 'work' : icon,
    id,
    lat,
    lon,
    // HACK: If a place name and address are provided, put the address in parentheses
    // to mimic the existing LocationField behavior for "work" and "home".
    // TODO: use addInParentheses from location-field (requires passing an intl context).
    name: isHomeOrWork(place)
      ? address
      : address && name
      ? `${name} (${address})`
      : address || name,
    type
  }
}

/**
 * Obtains the saved and recent locations based on the redux state.
 */
export function getUserLocations(state) {
  let saved = []
  let recent = []

  const { persistence } = state.otp.config
  const { localUser, loggedInUser } = state.user
  const persistenceMode = getPersistenceMode(persistence)
  if (persistenceMode.isOtpMiddleware && loggedInUser) {
    saved = loggedInUser.savedLocations
      .filter((place) => !isBlank(place.address))
      .map(convertToLegacyLocation)
  } else if (persistenceMode.isLocalStorage) {
    saved = localUser.savedLocations
    recent = localUser.recentPlaces
  }

  return {
    recent,
    saved
  }
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
export function getPlaceDetail(place, intl) {
  return (
    place.address ||
    // intl.formatMessage is used because this text can appear in tooltips.
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
export function getPlaceMainText(place, intl) {
  // Use toSentenceCase (and not text-transform: capitalize)
  // to change the first character of the work and home locations only (which come in lowercase).
  // TODO: Combine with similar code in @opentripplanner/location-field/options.tsx/LocationName
  return isHomeOrWork(place)
    ? toSentenceCase(getFormattedPlaces(place.type, intl))
    : place.name || place.address
}
