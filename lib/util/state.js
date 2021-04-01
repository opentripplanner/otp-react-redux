import coreUtils from '@opentripplanner/core-utils'
import isEqual from 'lodash.isequal'
import memoize from 'lodash.memoize'
import moment from 'moment'
import hash from 'object-hash'
import { createSelector } from 'reselect'

import { MainPanelContent } from '../actions/ui'

const { calculateFares, hasBike, isCar, isTransit, isWalk } = coreUtils.itinerary

/**
 * Get the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an search object, or null if there is no active search
 */
export function getActiveSearch (otpState) {
  return otpState.searches[otpState.activeSearchId]
}

/**
 * Get timestamp in the expected format used by otp-datastore (call taker
 * back end). Defaults to now.
 * TODO: move to OTP-UI?
 */
export function getTimestamp (time = moment()) {
  return time.format('YYYY-MM-DDTHH:mm:ss')
}

/**
 * Gets the OTP responses that contain errors. For batch routing this could be
 * an array of multiple responses, but for standard itinerary routing it will be
 * at most an array with one response.
 * @param {Object} otpState the OTP state object
 * @return {Array}      array of OTP plan responses that contain errors
 */
export function getResponsesWithErrors (otpState) {
  const search = getActiveSearch(otpState)
  const errorResponses = []
  const response = !search ? null : search.response
  if (response) {
    response.forEach(res => {
      if (res && res.error) errorResponses.push(res)
    })
  }
  return errorResponses
}

/**
 * Gets the active error (first OTP plan response that contains an error). Only
 * one OTP response is expected in itinerary routing, but if batch routing is
 * enabled, multiple responses with errors should be handled.
 */
export function getActiveError (otpState) {
  const errorResponse = getResponsesWithErrors(otpState)[0]
  if (errorResponse && errorResponse.error) return errorResponse.error
}

/**
 * Helper to get the active search's non-realtime response
 */
function getActiveSearchNonRealtimeResponse (otpState) {
  const search = getActiveSearch(otpState)
  return search && search.nonRealtimeResponse
}

/**
 * Helper to get the active search's realtime response
 */
function getActiveSearchRealtimeResponse (otpState) {
  const search = getActiveSearch(otpState)
  return search && search.response
}

/**
 * A memoized function to hash the itinerary.
 * NOTE: It can take a while (>300ms) for the object-hash library to calculate
 * an itinerary's hash for some lengthy itineraries. If better performance is
 * desired, a custom hash function should be written that only uses certain
 * parts of the itinerary instead of everything.
 */
const hashItinerary = memoize(itinerary => hash(itinerary))

/**
 * Get the active itineraries for the active search, which is dependent on
 * whether realtime or non-realtime results should be displayed
 * @param {Object} otpState the OTP state object
 * @return {Array}      array of itinerary objects from the OTP plan response,
 *                      or null if there is no active search
 */
export const getActiveItineraries = createSelector(
  otpState => otpState.config,
  getActiveSearchNonRealtimeResponse,
  otpState => otpState.filter,
  getActiveSearchRealtimeResponse,
  otpState => otpState.useRealtime,
  (
    config,
    nonRealtimeResponse,
    otpStateFilter,
    realtimeResponse,
    useRealtime
  ) => {
    // set response to use depending on useRealtime
    const response = (!nonRealtimeResponse && !realtimeResponse)
      ? null
      : useRealtime
        ? realtimeResponse
        : nonRealtimeResponse
    const itineraries = []
    // keep track of itinerary hashes in order to not include duplicate
    // itineraries. Duplicate itineraries can occur in batch routing where a walk
    // to transit trip can sometimes still be the most optimal trip even when
    // additional modes such as bike rental were also requested
    const seenItineraryHashes = {}
    if (response) {
      response.forEach(res => {
        if (res && res.plan) {
          res.plan.itineraries.forEach(itinerary => {
            // hashing takes a while on itineraries
            const itineraryHash = hashItinerary(itinerary)
            if (!seenItineraryHashes[itineraryHash]) {
              itineraries.push(itinerary)
              seenItineraryHashes[itineraryHash] = true
            }
          })
        }
      })
    }
    const {filter, sort} = otpStateFilter
    const {direction, type} = sort
    const filteredItineraries = itineraries
      .filter(itinerary => {
        switch (filter) {
          case 'ALL':
            return true
          case 'ACTIVE':
            // ACTIVE filter checks that the only modes contained in the itinerary
            // are 'active' (i.e., walk or bike). FIXME: add micromobility?
            let allActiveModes = true
            itinerary.legs.forEach(leg => {
              if (!isWalk(leg.mode) && !hasBike(leg.mode)) allActiveModes = false
            })
            return allActiveModes
          case 'TRANSIT':
            return itineraryHasTransit(itinerary)
          case 'CAR':
            let hasCar = false
            itinerary.legs.forEach(leg => {
              if (isCar(leg.mode)) hasCar = true
            })
            return hasCar
          default:
            // return true for unrecognized or falsy filter
            return true
        }
      })
    // If no sort type is provided (e.g., because batch routing is not enabled),
    // do not sort itineraries (default sort from API response is used).
    return !type
      ? filteredItineraries
      : filteredItineraries.sort((a, b) => sortItineraries(type, direction, a, b, config))
  }
)

/**
 * Array sort function for itineraries (in batch routing context) that attempts
 * to sort based on the type/direction specified.
 */
function sortItineraries (type, direction, a, b, config) {
  switch (type) {
    case 'WALKTIME':
      if (direction === 'ASC') return a.walkTime - b.walkTime
      else return b.walkTime - a.walkTime
    case 'ARRIVALTIME':
      if (direction === 'ASC') return a.endTime - b.endTime
      else return b.endTime - a.endTime
    case 'DEPARTURETIME':
      if (direction === 'ASC') return a.startTime - b.startTime
      else return b.startTime - a.startTime
    case 'DURATION':
      if (direction === 'ASC') return a.duration - b.duration
      else return b.duration - a.duration
    case 'COST':
      const aTotal = getTotalFare(a, config)
      const bTotal = getTotalFare(b, config)
      if (direction === 'ASC') return aTotal - bTotal
      else return bTotal - aTotal
    default:
      if (type !== 'BEST') console.warn(`Sort (${type}) not supported. Defaulting to BEST.`)
      // FIXME: Fully implement default sort algorithm.
      const aCost = calculateItineraryCost(a, config)
      const bCost = calculateItineraryCost(b, config)
      if (direction === 'ASC') return aCost - bCost
      else return bCost - aCost
  }
}

/**
 * Default constants for calculating itinerary "cost", i.e., how preferential a
 * particular itinerary is based on factors like wait time, total fare, drive
 * time, etc.
 */
const DEFAULT_WEIGHTS = {
  walkReluctance: 0.1,
  driveReluctance: 2,
  durationFactor: 0.25,
  fareFactor: 0.5,
  waitReluctance: 0.1,
  transferReluctance: 0.9
}

/**
 * This calculates the "cost" (not the monetary cost, but the cost according to
 * multiple factors like duration, total fare, and walking distance) for a
 * particular itinerary, for use in sorting itineraries.
 * FIXME: Do major testing to get this right.
 */
function calculateItineraryCost (itinerary, config = {}) {
  // Initialize weights to default values.
  const weights = DEFAULT_WEIGHTS
  // If config contains values to override defaults, apply those.
  const configWeights = config.itinerary && config.itinerary.weights
  if (configWeights) Object.assign(weights, configWeights)
  return getTotalFare(itinerary, config) * weights.fareFactor +
    itinerary.duration * weights.durationFactor +
    itinerary.walkDistance * weights.walkReluctance +
    getDriveTime(itinerary) * weights.driveReluctance +
    itinerary.waitingTime * weights.waitReluctance +
    itinerary.transfers * weights.transferReluctance
}

/**
 * Get total drive time (i.e., total duration for legs with mode=CAR) for an
 * itinerary.
 */
function getDriveTime (itinerary) {
  if (!itinerary) return 0
  let driveTime = 0
  itinerary.legs.forEach(leg => {
    if (leg.mode === 'CAR') driveTime += leg.duration
  })
  return driveTime
}

/**
 * Default costs for modes that currently have no costs evaluated in
 * OpenTripPlanner.
 */
const DEFAULT_COSTS = {
  // $2 per trip? This is a made up number.
  bikeshareTripCostCents: 2 * 100,
  // $2 for 3 hours of parking?
  carParkingCostCents: 3 * 2.00 * 100,
  // FL per diem rate: https://www.flcourts.org/content/download/219314/1981830/TravelInformation.pdf
  drivingCentsPerMile: 0.445 * 100
}

/**
 * Returns total fare for itinerary (in cents)
 * FIXME: Move to otp-ui?
 * TODO: Add GBFS fares
 */
function getTotalFare (itinerary, config = {}) {
  // Get transit/TNC fares.
  const {maxTNCFare, transitFare} = calculateFares(itinerary)
  // Start with default cost values.
  const costs = DEFAULT_COSTS
  // If config contains values to override defaults, apply those.
  const configCosts = config.itinerary && config.itinerary.costs
  if (configCosts) Object.assign(costs, configCosts)
  // Calculate total cost from itinerary legs.
  let drivingCost = 0
  let hasBikeshare = false
  itinerary.legs.forEach(leg => {
    if (leg.mode === 'CAR') {
      // Convert meters to miles and multiple by cost per mile.
      drivingCost += leg.distance * 0.000621371 * costs.drivingCentsPerMile
    }
    if (leg.mode === 'BICYCLE_RENT' || leg.mode === 'MICROMOBILITY' || leg.rentedBike) {
      hasBikeshare = true
    }
  })
  const bikeshareCost = hasBikeshare ? costs.bikeshareTripCostCents : 0
  // If some leg uses driving, add parking cost to the total.
  if (drivingCost > 0) drivingCost += costs.carParkingCostCents
  return bikeshareCost + drivingCost + transitFare + maxTNCFare * 100
}

export function getTotalFareAsString (itinerary) {
  // Get centsToString formatter.
  const {centsToString} = calculateFares(itinerary)
  // Return total fare as formatted string.
  return centsToString(getTotalFare(itinerary))
}

function itineraryHasTransit (itinerary) {
  let itinHasTransit = false
  itinerary.legs.forEach(leg => {
    if (isTransit(leg.mode)) itinHasTransit = true
  })
  return itinHasTransit
}

/**
 * Get the active itinerary/profile for the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */
export function getActiveItinerary (otpState) {
  const search = getActiveSearch(otpState)
  const itineraries = getActiveItineraries(otpState)
  if (!itineraries || !search) return null
  return itineraries.length > search.activeItinerary && search.activeItinerary >= 0
    ? itineraries[search.activeItinerary]
    : null
}

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {Object} query an OTP query object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */
export function hasValidLocation (query, locationKey) {
  return query[locationKey] &&
    query[locationKey].lat &&
    query[locationKey].lon
}

/**
 * Determine if the current query is valid
 * @param {Object} otpState the OTP state object
 * @returns {boolean}
 */
export function queryIsValid (otpState) {
  const {currentQuery} = otpState
  return hasValidLocation(currentQuery, 'from') &&
    hasValidLocation(currentQuery, 'to')
    // TODO: add mode validation
    // TODO: add date/time validation
}

export function getRealtimeEffects (otpState) {
  const search = getActiveSearch(otpState)

  const realtimeItineraries = search &&
    search.response &&
    search.response.plan
    ? search.response.plan.itineraries
    : null

  const hasNonRealtimeItineraries = search &&
    search.nonRealtimeResponse &&
    search.nonRealtimeResponse.plan

  const nonRealtimeItineraries = hasNonRealtimeItineraries
    ? search.nonRealtimeResponse.plan.itineraries
    : null

  const isAffectedByRealtimeData = !!(
    realtimeItineraries &&
    hasNonRealtimeItineraries &&
    // FIXME: Are realtime impacts only indicated by a change in the duration
    // of the first itinerary
    realtimeItineraries[0].duration !== nonRealtimeItineraries[0].duration
  )

  const normalRoutes = isAffectedByRealtimeData && nonRealtimeItineraries
    ? nonRealtimeItineraries[0].legs.filter(leg => !!leg.route).map(leg => leg.route)
    : []

  const realtimeRoutes = isAffectedByRealtimeData && realtimeItineraries
    ? realtimeItineraries[0].legs.filter(leg => !!leg.route).map(leg => leg.route)
    : []

  const normalDuration = isAffectedByRealtimeData && nonRealtimeItineraries
    ? nonRealtimeItineraries[0].duration : 0

  const realtimeDuration = isAffectedByRealtimeData && realtimeItineraries
    ? realtimeItineraries[0].duration : 0
  return {
    isAffectedByRealtimeData,
    normalRoutes,
    realtimeRoutes,
    routesDiffer: !isEqual(normalRoutes, realtimeRoutes),
    normalDuration,
    realtimeDuration,
    exceedsThreshold: Math.abs(normalDuration - realtimeDuration) >= otpState.config.realtimeEffectsDisplayThreshold
  }
  // // TESTING: Return this instead to simulate a realtime-affected itinerary.
  // return {
  //   isAffectedByRealtimeData: true,
  //   normalRoutes: ['10', '2', '10'],
  //   realtimeRoutes: ['1', '2'],
  //   routesDiffer: true,
  //   normalDuration: 1000,
  //   realtimeDuration: 800,
  //   exceedsThreshold: true
  // }
}

/**
 * Determine whether user settings panel is enabled.
 */
export function getShowUserSettings (otpState) {
  return otpState.config.persistence && otpState.config.persistence.enabled
}

export function getStopViewerConfig (otpState) {
  return otpState.config.stopViewer
}

/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */
export function getUiUrlParams (otpState) {
  const activeSearch = getActiveSearch(otpState)
  const uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0,
    ui_activeSearch: otpState.activeSearchId
  }
  return uiParams
}

// Set default title to the original document title (on load) set in index.html
const DEFAULT_TITLE = document.title

export function getTitle (state) {
  // Override title can optionally be provided in config.yml
  const { config, ui, user } = state.otp
  let title = config.title || DEFAULT_TITLE
  const { mainPanelContent, viewedRoute, viewedStop } = ui
  switch (mainPanelContent) {
    case MainPanelContent.ROUTE_VIEWER:
      title += ' | Route'
      if (viewedRoute && viewedRoute.routeId) title += ` ${viewedRoute.routeId}`
      break
    case MainPanelContent.STOP_VIEWER:
      title += ' | Stop'
      if (viewedStop && viewedStop.stopId) title += ` ${viewedStop.stopId}`
      break
    default:
      const activeSearch = getActiveSearch(state.otp)
      if (activeSearch) {
        title += ` | ${coreUtils.query.summarizeQuery(activeSearch.query, user.locations)}`
      }
      break
  }
  // if (printView) title += ' | Print'
  return title
}
