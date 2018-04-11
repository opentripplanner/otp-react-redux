import qs from 'qs'

import { isAccessMode } from './itinerary'
import { getActiveSearch } from './state'

export function ensureSingleAccessMode (queryModes) {
  // Count the number of access modes
  const accessCount = queryModes.filter(m => isAccessMode(m)).length

  // If multiple access modes are specified, keep only the first one
  if (accessCount > 1) {
    const firstAccess = queryModes.find(m => isAccessMode(m))
    queryModes = queryModes.filter(m => !isAccessMode(m) || m === firstAccess)

  // If no access modes are specified, add 'WALK' as the default
  } else if (accessCount === 0) {
    queryModes.push('WALK')
  }

  return queryModes
}

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 * FIXME: Should we be using react-router-redux for this?
 */

export function setUrlSearch (params) {
  window.history.pushState(params, '', `?${qs.stringify(params)}`)
}

/**
 * Update the OTP Query parameters in the URL. Leaves any other existing URL
 * parameters unchanged.
 */

export function updateOtpUrlParams (otpParams) {
  const params = {}

  // Get all non-OTP params, which will be retained unchanged in the URL
  if (window.history.state) {
    Object.keys(window.history.state)
      .filter(key => key.indexOf('_') !== -1)
      .forEach(key => { params[key] = window.history.state[key] })
  }

  // Merge in the provided OTP params and update the URL
  setUrlSearch(Object.assign(params, otpParams))
}

/**
 * Update the UI-state parameters in the URL. Leaves any other existing URL
 * parameters unchanged.
 */

export function updateUiUrlParams (uiParams) {
  const params = {}

  // Get all non-OTP params, which will be retained unchanged in the URL
  if (window.history.state) {
    Object.keys(window.history.state)
      .filter(key => !key.startsWith('ui_'))
      .forEach(key => { params[key] = window.history.state[key] })
  }

  // Merge in the provided UI params and update the URL
  setUrlSearch(Object.assign(params, uiParams))
}

/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */

export function getUiUrlParams (otpState) {
  const activeSearch = getActiveSearch(otpState)
  const uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0
  }
  return uiParams
}
