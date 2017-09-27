import qs from 'qs'

import { getCurrentTime, getCurrentDate } from '../util/time'
import { coordsToString } from '../util/map'

/**
 * Get the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an search object, or null if there is no active search
 */

export function getActiveSearch (otpState) {
  return otpState.searches[otpState.activeSearchId]
}

/**
 * Get the active itinerary/profile for the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveItinerary (otpState) {
  const search = getActiveSearch(otpState)
  const {useRealtime} = otpState
  // set response to use depending on useRealtime
  const response = !search
    ? null
    : useRealtime ? search.response : search.nonRealtimeResponse
  if (!response || !response.plan) return null
  const plan = response.plan
  return plan.itineraries.length > search.activeItinerary && search.activeItinerary >= 0
    ? plan.itineraries[search.activeItinerary]
    : null
}
export { getActiveItinerary }

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {Object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */

function hasValidLocation (otpState, locationKey) {
  return otpState.currentQuery[locationKey] &&
    otpState.currentQuery[locationKey].lat &&
    otpState.currentQuery[locationKey].lon
}
export { hasValidLocation }

/**
 * Determine if the current query is valid
 * @param {Object} otpState the OTP state object
 * @returns {boolean}
 */

function queryIsValid (otpState) {
  return hasValidLocation(otpState, 'from') &&
    hasValidLocation(otpState, 'to')
    // TODO: add mode validation
    // TODO: add date/time validation
}
export { queryIsValid }

export function getDefaultQuery () {
  let params = {}
  if (typeof (window) !== 'undefined') {
    params = qs.parse(window.location.hash.split('#plan?')[1])
  }
  console.log(params)
  const from = (params.fromPlace && params.fromPlace.split(',')) || []
  const to = (params.toPlace && params.toPlace.split(',')) || []
  return {
    routingType: 'ITINERARY',
    from: from.length ? {
      name: coordsToString(from) || null,
      lat: from[0] || null,
      lon: from[1] || null
    } : null,
    to: to.length ? {
      name: coordsToString(to) || null,
      lat: to[0] || null,
      lon: to[1] || null
    } : null,
    departArrive: params.arriveBy === 'true'
      ? 'ARRIVE'
      : params.arriveBy === 'false'
      ? 'DEPART'
      : 'NOW',
    date: params.date || getCurrentDate(),
    time: params.time || getCurrentTime(),
    mode: params.mode
  }
}
