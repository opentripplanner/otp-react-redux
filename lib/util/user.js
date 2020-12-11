
export function isNewUser (loggedInUser) {
  return !loggedInUser.hasConsentedToTerms
}

// Helper functions to determine if
// a location is home or work.
export const isHome = loc => loc.type === 'home'
export const isWork = loc => loc.type === 'work'
export const isHomeOrWork = loc => isHome(loc) || isWork(loc)
