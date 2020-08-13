import coreUtils from '@opentripplanner/core-utils'
import isEqual from 'lodash.isequal'
import moment from 'moment'

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
 * Get the active itineraries for the active search, which is dependent on
 * whether realtime or non-realtime results should be displayed
 * @param {Object} otpState the OTP state object
 * @return {Array}      array of itinerary objects from the OTP plan response,
 *                      or null if there is no active search
 */
export function getActiveItineraries (otpState) {
  const search = getActiveSearch(otpState)
  const { useRealtime } = otpState
  // set response to use depending on useRealtime
  const response = !search
    ? null
    : useRealtime
      ? search.response
      : search.nonRealtimeResponse
  const itineraries = []
  if (response) {
    response.forEach(res => {
      if (res && res.plan) itineraries.push(...res.plan.itineraries)
    })
  }
  const {filter, sort} = otpState.filter
  const {direction, type} = sort
  return itineraries
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
          console.warn(`Filter (${filter}) not supported`)
          return true
      }
    })
    .sort((a, b) => {
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
          const aTotal = getTotalFare(a)
          const bTotal = getTotalFare(b)
          if (direction === 'ASC') return aTotal - bTotal
          else return bTotal - aTotal
        default:
          if (type !== 'BEST') console.warn(`Sort (${type}) not supported. Defaulting to BEST.`)
          // FIXME: Fully implement default sort algorithm.
          const aCost = calculateItineraryCost(a)
          const bCost = calculateItineraryCost(b)
          if (direction === 'ASC') return aCost - bCost
          else return bCost - aCost
      }
    })
}

/**
 * This calculates the "cost" (not the monetary cost, but the cost according to
 * multiple factors like duration, total fare, and walking distance) for a
 * particular itinerary, for use in sorting itineraries.
 */
function calculateItineraryCost (itinerary) {
  const FARE_COST_FACTOR = 0.5
  const DURATION_COST_FACTOR = 0.25
  const WALK_COST_FACTOR = 0.1
  const WAIT_COST_FACTOR = 0.1
  const TRANSFER_COST_FACTOR = 0.9
  return getTotalFare(itinerary) * FARE_COST_FACTOR +
    itinerary.duration * DURATION_COST_FACTOR +
    itinerary.walkDistance * WALK_COST_FACTOR +
    itinerary.waitingTime * WAIT_COST_FACTOR +
    itinerary.transfers * TRANSFER_COST_FACTOR
}

// FIXME: Move to otp-ui?
// TODO: Add GBFS fares
/**
 * Returns total fare for itinerary (in cents)
 */
function getTotalFare (itinerary) {
  const {maxTNCFare, transitFare} = calculateFares(itinerary)
  // TODO: move driving costs to calc fares?
  // TODO: Add config setttings?
  // $2 for 3 hours of parking?
  const PARKING_COST = 3 * 2.00 * 100
  // FL per diem rate: https://www.flcourts.org/content/download/219314/1981830/TravelInformation.pdf
  const PER_MILE_COST_TO_DRIVE = 0.445 * 100
  const BIKESHARE_FARE = 2 * 100 // $2 per trip? This is a made up number.
  let drivingCost = 0
  let hasBikeshare = false
  itinerary.legs.forEach(leg => {
    if (leg.mode === 'CAR') {
      drivingCost += leg.distance * 0.000621371 * PER_MILE_COST_TO_DRIVE
    }
    if (leg.mode === 'BICYCLE_RENT' || leg.mode === 'MICROMOBILITY' || leg.rentedBike) {
      hasBikeshare = true
    }
  })
  const bikeshareCost = hasBikeshare ? BIKESHARE_FARE : 0
  // If some leg uses driving, add parking cost to the total.
  if (drivingCost > 0) drivingCost += PARKING_COST
  return bikeshareCost + drivingCost + transitFare + maxTNCFare * 100
}

export function getTotalFareAsString (itinerary) {
  // TODO clean up
  const {centsToString} = calculateFares(itinerary)
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
 * @param {Object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */
export function hasValidLocation (otpState, locationKey) {
  return otpState.currentQuery[locationKey] &&
    otpState.currentQuery[locationKey].lat &&
    otpState.currentQuery[locationKey].lon
}

/**
 * Determine if the current query is valid
 * @param {Object} otpState the OTP state object
 * @returns {boolean}
 */
export function queryIsValid (otpState) {
  return hasValidLocation(otpState, 'from') &&
    hasValidLocation(otpState, 'to')
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
