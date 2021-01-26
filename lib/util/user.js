import clone from 'clone'

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
 * An index of common place types, used to obtain FontAwesome icons
 * for place types and to initialize place defaults.
 * Add the supported place types below as needed.
 */
export const PLACE_TYPES = {
  custom: {
    icon: 'map-marker',
    name: 'Custom',
    type: 'custom'
  },
  dining: {
    icon: 'cutlery',
    name: 'Dining',
    type: 'dining'
  },
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
 * Makes a copy of the provided logged-in user data for editing
 * (e.g. to set the Formik initial state), with:
 * - the 'home' and 'work' locations at the top of the savedLocations list
 *   so they are always shown and shown at the top of the FavoriteLocationsPane.
 *   The name field is set to 'Home' and 'Work' regardless of the value that was persisted.
 *   Note: In the returned value, savedLocations is always a valid array.
 */
export function cloneUserDataForEditing (userData) {
  const clonedUser = clone(userData)
  const { savedLocations = [] } = clonedUser

  const homeLocation = savedLocations.find(isHome) || BLANK_HOME
  const workLocation = savedLocations.find(isWork) || BLANK_WORK

  homeLocation.name = BLANK_HOME.name
  workLocation.name = BLANK_WORK.name

  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(loc => loc !== homeLocation && loc !== workLocation)
  ]

  clonedUser.savedLocations = reorderedLocations
  return clonedUser
}
