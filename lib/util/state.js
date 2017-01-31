/**
 * Get the active itinerary for the active search object
 * @param {object} otpState the OTP state object
 * @returns {object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveSearch (otpState) {
  return otpState.searches.length > otpState.activeSearch && otpState.activeSearch >= 0
    ? otpState.searches[otpState.activeSearch]
    : null
}
export { getActiveSearch }

/**
 * Get the active itinerary for the active search object
 * @param {object} otpState the OTP state object
 * @returns {object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveItinerary (otpState) {
  const search = getActiveSearch(otpState)
  if (!search || !search.planResponse || !search.planResponse.plan) return null
  const plan = search.planResponse.plan
  return plan.itineraries.length > search.activeItinerary && search.activeItinerary >= 0
    ? plan.itineraries[search.activeItinerary]
    : null
}
export { getActiveItinerary }

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */

function hasValidLocation (otpState, locationKey) {
  return otpState.currentQuery[locationKey] &&
    otpState.currentQuery[locationKey].lat &&
    otpState.currentQuery[locationKey].lon
}
export { hasValidLocation }
