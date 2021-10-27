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
 * The name field is set to 'Home' and 'Work' (or translated equivalent)
 * regardless of the value that was persisted.
 */
export function positionHomeAndWorkFirst (userData, homeName, workName) {
  // Note: cloning is not necessary as the data is obtained from fetch.
  const { savedLocations = [] } = userData

  const homeLocation = savedLocations.find(isHome) || BLANK_HOME
  const workLocation = savedLocations.find(isWork) || BLANK_WORK

  homeLocation.name = homeName || BLANK_HOME.name
  workLocation.name = workName || BLANK_WORK.name

  const reorderedLocations = [
    homeLocation,
    workLocation,
    ...savedLocations.filter(loc => loc !== homeLocation && loc !== workLocation)
  ]

  userData.savedLocations = reorderedLocations
}
