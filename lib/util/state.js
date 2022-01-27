// REMOVE THIS LINE BEFORE EDITING THIS FILE
/* eslint-disable  */
import { createSelector } from 'reselect'
import { FormattedList, FormattedMessage } from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import hash from 'object-hash'
import isEqual from 'lodash.isequal'
import memoize from 'lodash.memoize'
import moment from 'moment'
import qs from 'qs'
import React from 'react'

import { MainPanelContent } from '../actions/ui'
import { StyledFormattedMode } from '../components/util/formatted-mode'

const { calculateFares } = coreUtils.itinerary

/**
 * Get the active search object
 * @param {Object} state the redux state object
 * @returns {Object} an search object, or null if there is no active search
 */
export function getActiveSearch(state) {
  return state.otp.searches[state.otp.activeSearchId]
}

/**
 * Get timestamp in the expected format used by otp-datastore (call taker
 * back end). Defaults to now.
 * TODO: move to OTP-UI?
 */
export function getTimestamp(time = moment()) {
  return time.format('YYYY-MM-DDTHH:mm:ss')
}

/**
 * Analyzes all rental networks provided in the response and returns a list of
 * those that have a FEED_WIDE error.
 */
export function getFeedWideRentalErrors(response) {
  // return empty array if the plan key is not available in the response
  if (!response) return []

  // get first available rental info (this assumes that there won't be
  // 2 rental info types (for example car rental access and vehicle
  // rental egress))
  const rentalInfo =
    response.bikeRentalInfo ||
    response.carRentalInfo ||
    response.vehicleRentalInfo
  if (!rentalInfo) return []

  // iterate through all networks and collect a list of feeds that have a feed-
  // wide error
  return Object.entries(rentalInfo)
    .filter(
      ([network, networkRentalInfo]) =>
        networkRentalInfo.errors &&
        networkRentalInfo.errors.some((error) => error.severity === 'FEED_WIDE')
    )
    .map(([network, networkRentalInfo]) => ({
      network,
      networkRentalInfo
    }))
}

/**
 * Generates a list of issues/errors from a list of OTP responses.
 *
 * @param {Object} state the redux state object
 * @return {Array} An array of objects describing the errors seen. These could also
 *   include an `id` and `modes` key for trip planning errors or `network` for
 *   errors with vehicle rentals.
 */
export function getResponsesWithErrors(state) {
  const search = getActiveSearch(state)
  const rentalFeedErrors = []
  const networksWithFeedWideErrors = {}
  const tripPlanningErrors = []
  const response = !search ? null : search.response
  if (response) {
    const showModes = response.length > 1
    response.forEach((res) => {
      if (res) {
        if (res.error) {
          const params = qs.parse(res.url)
          const modeStr = res.requestParameters?.mode || params.mode || ''
          tripPlanningErrors.push({
            id: res.error.id,
            modes: modeStr.split(','),
            showModes,
            url: res.url
          })
        }
        const feedWideRentalErrors = getFeedWideRentalErrors(res)
        feedWideRentalErrors.forEach((networkWithFeedWideError) => {
          const { network } = networkWithFeedWideError
          if (!networksWithFeedWideErrors[network]) {
            rentalFeedErrors.push({ network })
            networksWithFeedWideErrors[network] = true
          }
        })
      }
    })
  }

  // generate list so rental errors show up first
  return [...rentalFeedErrors, ...tripPlanningErrors]
}

/**
 * Gets the active error (either a planning error or a rental feed error). This
 * should only be used with itinerary routing, not batch routing.
 */
export function getActiveError(state) {
  const errors = getResponsesWithErrors(state)
  return errors[errors.length - 1]
}

/**
 * Get the appropriate message for a trip planning error given possibly pre-
 * configured message overrides from the config.
 */
/* eslint-disable-next-line complexity */
export function getErrorMessage(error, intl) {
  if (!error) return null

  let message
  if (error.network) {
    message = (
      <FormattedMessage
        id="util.state.networkUnavailable"
        values={{ network: error.network }}
      />
    )
  } else if (error.id === 404) {
    // Localized messages for OTP's 404 PATH_NOT_FOUND error.
    // include the modes if doing batch routing.
    const noTripFoundText =
      error.showModes && error.modes.length > 0 ? (
        <FormattedMessage
          id="util.state.noTripFoundForMode"
          values={{
            modes: (
              <FormattedList
                type="conjunction"
                value={error.modes.map(
                  // Styled component makes text lowercase
                  (mode) => (
                    <StyledFormattedMode key={mode} mode={mode.toLowerCase()} />
                  )
                )}
              />
            )
          }}
        />
      ) : (
        <FormattedMessage id="util.state.noTripFound" />
      )

    message = (
      <FormattedMessage
        id="util.state.noTripFoundWithReason"
        values={{
          noTripFound: noTripFoundText,
          reason: <FormattedMessage id="util.state.noTripFoundReason" />
        }}
      />
    )
  }

  message = message || <FormattedMessage id="util.state.errorPlanningTrip" />

  // check for configuration-defined message override
  const localizedMsgId = `errorMessages.${error.id}.msg`
  const localizedMsg = intl.formatMessage({ id: localizedMsgId })

  const localizedModesId = `errorMessages.${error.id}.modes`
  const localizedModes = intl.formatMessage({ id: localizedModesId })

  if (localizedMsg !== localizedMsgId) {
    if (error.modes && localizedModes !== localizedModesId) {
      const modes = localizedModes.split(', ')
      for (let i = 0; i < modes.length; i++) {
        if (error.modes.includes(modes[i])) {
          message = localizedMsg
          break
        }
      }
    } else message = localizedMsg
  }

  return message
}

/**
 * Helper to get the active search's non-realtime response
 * 
 * This is not actively used, but may be again in the future to 
 * facilitate trip monitoring, which requires a non-realtime
 * trip 
 */
function getActiveSearchNonRealtimeResponse(state) {
  const search = getActiveSearch(state)
  return search && search.nonRealtimeResponse
}

/**
 * Helper to get the active search's realtime response
 */
function getActiveSearchRealtimeResponse(state) {
  const search = getActiveSearch(state)
  return search && search.response
}

/**
 * Selector to get the active field trip request.
 *
 * Note: this selector needs to be in this file instead of util/call-taker.js
 * to avoid a circular reference that would fail the a11y build/test.
 * For more info, see:
 * https://decembersoft.com/posts/error-selector-creators-expect-all-input-selectors-to-be-functions/
 */
export const getActiveFieldTripRequest = createSelector(
  state => state.callTaker?.fieldTrip.activeId,
  state => state.callTaker?.fieldTrip.requests,
  (activeId, requests) => {
    if (!activeId || !requests) return
    return requests.data.find(req => req.id === activeId)
  }
)

// Ignore certain keys that could add significant calculation time to hashing.
// The alerts are irrelevant, but the intermediateStops, interStopGeometry and
// steps could have the legGeometry substitute as an equivalent hash value
const blackListedKeys = [
  'alerts',
  'intermediateStops',
  'interStopGeometry',
  'steps'
]
// make blackListedKeys into an object due to superior lookup performance
const blackListedKeyLookup = {}
blackListedKeys.forEach((key) => {
  blackListedKeyLookup[key] = true
})

/**
 * A memoized function to hash the itinerary.
 * NOTE: It can take a while (>30ms) for the object-hash library to calculate
 * an itinerary's hash for some lengthy itineraries. If better performance is
 * desired, additional values to blackListedKeys should be added to avoid
 * spending extra time hashing values that wouldn't result in different
 * itineraries.
 */
const hashItinerary = memoize((itinerary) =>
  hash(itinerary, { excludeKeys: (key) => blackListedKeyLookup[key] })
)

/**
 * Get the active itineraries for the active search, which is dependent on
 * whether realtime or non-realtime results should be displayed
 * @param {Object} state the redux state object
 * @return {Array}      array of itinerary objects from the OTP plan response,
 *                      or null if there is no active search
 */
export const getActiveItineraries = createSelector(
  (state) => state.otp.config,
  getActiveSearchNonRealtimeResponse,
  (state) => state.otp.filter,
  getActiveSearchRealtimeResponse,
  getActiveFieldTripRequest,
  (
    config,
    nonRealtimeResponse,
    itinerarySortSettings,
    realtimeResponse,
    activeFieldTripRequest
  ) => {
    const response =
      !nonRealtimeResponse && !realtimeResponse
        ? null
        : realtimeResponse
        ? realtimeResponse
        : nonRealtimeResponse
    const itineraries = []
    // keep track of itinerary hashes in order to not include duplicate
    // itineraries. Duplicate itineraries can occur in batch routing where a walk
    // to transit trip can sometimes still be the most optimal trip even when
    // additional modes such as bike rental were also requested
    const seenItineraryHashes = {}
    if (response) {
      response.forEach((res) => {
        if (res && res.plan) {
          res.plan.itineraries.forEach((itinerary) => {
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
    const { sort } = itinerarySortSettings
    const { direction, type } = sort
    // If no sort type is provided (e.g., because batch routing is not enabled),
    // do not sort itineraries (default sort from API response is used).
    // Also, do not sort itineraries if a field trip request is active
    return !type || Boolean(activeFieldTripRequest)
      ? itineraries
      : itineraries.sort((a, b) =>
          sortItineraries(type, direction, a, b, config)
        )
  }
)

/**
 * Array sort function for itineraries (in batch routing context) that attempts
 * to sort based on the type/direction specified.
 */
/* eslint-disable-next-line complexity */
function sortItineraries(type, direction, a, b, config) {
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
      const configCosts = config.itinerary?.costs
      const aTotal = getTotalFare(a, configCosts)
      const bTotal = getTotalFare(b, configCosts)
      if (direction === 'ASC') return aTotal - bTotal
      else return bTotal - aTotal
    default:
      if (type !== 'BEST')
        console.warn(`Sort (${type}) not supported. Defaulting to BEST.`)
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
  driveReluctance: 2,
  durationFactor: 0.25,
  fareFactor: 0.5,
  transferReluctance: 0.9,
  waitReluctance: 0.1,
  walkReluctance: 0.1
}

/**
 * This calculates the "cost" (not the monetary cost, but the cost according to
 * multiple factors like duration, total fare, and walking distance) for a
 * particular itinerary, for use in sorting itineraries.
 * FIXME: Do major testing to get this right.
 */
function calculateItineraryCost(itinerary, config = {}) {
  // Initialize weights to default values.
  const weights = DEFAULT_WEIGHTS
  // If config contains values to override defaults, apply those.
  const configWeights = config.itinerary && config.itinerary.weights
  if (configWeights) Object.assign(weights, configWeights)
  return (
    getTotalFare(
      itinerary,
      config.itinerary?.costs,
      config.itinerary?.defaultFareKey
    ) *
      weights.fareFactor +
    itinerary.duration * weights.durationFactor +
    itinerary.walkDistance * weights.walkReluctance +
    getDriveTime(itinerary) * weights.driveReluctance +
    itinerary.waitingTime * weights.waitReluctance +
    itinerary.transfers * weights.transferReluctance
  )
}

/**
 * Get total drive time (i.e., total duration for legs with mode=CAR) for an
 * itinerary.
 */
function getDriveTime(itinerary) {
  if (!itinerary) return 0
  let driveTime = 0
  itinerary.legs.forEach((leg) => {
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
  carParkingCostCents: 3 * 2.0 * 100,
  // FL per diem rate: https://www.flcourts.org/content/download/219314/1981830/TravelInformation.pdf
  drivingCentsPerMile: 0.445 * 100
}

/**
 * Returns total fare for itinerary (in cents)
 * FIXME: Move to otp-ui?
 * TODO: Add GBFS fares
 */
export function getTotalFare(
  itinerary,
  configCosts = {},
  defaultFareKey = 'regular'
) {
  // Get transit/TNC fares.
  const { maxTNCFare, transitFares } = calculateFares(itinerary, true)
  const transitFare =
    (transitFares?.[defaultFareKey] || transitFares.regular)?.transitFare || 0
  // Start with default cost values.
  const costs = DEFAULT_COSTS
  // If config contains values to override defaults, apply those.
  if (configCosts) Object.assign(costs, configCosts)
  // Calculate total cost from itinerary legs.
  let drivingCost = 0
  let hasBikeshare = false
  itinerary.legs.forEach((leg) => {
    if (leg.mode === 'CAR') {
      // Convert meters to miles and multiple by cost per mile.
      drivingCost += leg.distance * 0.000621371 * costs.drivingCentsPerMile
    }
    if (
      leg.mode === 'BICYCLE_RENT' ||
      leg.mode === 'MICROMOBILITY' ||
      leg.rentedBike
    ) {
      hasBikeshare = true
    }
  })
  const bikeshareCost = hasBikeshare ? costs.bikeshareTripCostCents : 0
  // If some leg uses driving, add parking cost to the total.
  if (drivingCost > 0) drivingCost += costs.carParkingCostCents
  return bikeshareCost + drivingCost + transitFare + maxTNCFare * 100
}

/**
 * Get the active itinerary/profile for the active search object
 * @param {Object} state the redux state object
 * @returns {Object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */
export function getActiveItinerary(state) {
  const search = getActiveSearch(state)
  const itineraries = getActiveItineraries(state)
  if (!itineraries || !search) return null
  return itineraries.length > search.activeItinerary &&
    search.activeItinerary >= 0
    ? itineraries[search.activeItinerary]
    : null
}

/**
 * Returns true if the OTP state contains a response within the current active search.
 * @param {*} state The entire redux state used to obtain the response.
 */
function activeSearchHasResponse(state) {
  const activeSearch = getActiveSearch(state)
  return !!(activeSearch && activeSearch.response)
}

/**
 * Returns the raw OTP response for the current active search.
 * @param {*} state The entire redux state used to obtain the response.
 */
function getOtpResponse(state) {
  return getActiveSearch(state)?.response?.otp
}

/**
 * Returns true if the query routing type specifies 'ITINERARY' and an OTP response is available.
 * @param {*} state The entire redux state in which the query is stored.
 */
function itineraryResponseExists(state) {
  const activeSearch = getActiveSearch(state)
  return (
    activeSearch?.response?.length > 0 &&
    activeSearch?.query?.routingType === 'ITINERARY'
  )
}

/**
 * Returns the visible itinerary index to render on the map and in narrative components.
 * @param {*} state The entire redux state from which to retrieve the itinerary.
 */
export function getVisibleItineraryIndex(state) {
  return getActiveSearch(state)?.visibleItinerary
}

/**
 * Returns the itinerary to be passed to the transitive overlay for rendering.
 * @param {*} state The entire redux state from which to derive the itinerary.
 */
function getItineraryToRender(state) {
  const visibleItineraryIndex = getVisibleItineraryIndex(state)
  const activeItinerary = getActiveItinerary(state)
  const itins = getActiveItineraries(state)
  return itins[visibleItineraryIndex] || activeItinerary
}

const routeSelector = (state) => Object.values(state.otp.transitIndex.routes)
const routeViewerFilterSelector = (state) => state.otp.ui.routeViewer.filter

/**
 * Returns all routes that match the route viewer filters
 */
export const getFilteredRoutes = createSelector(
  routeSelector,
  routeViewerFilterSelector,
  (routes, filter) =>
    routes.filter(
      (route) =>
        // If the filter isn't defined, don't check.
        (!filter.agency || filter.agency === route.agencyName) &&
        (!filter.mode || filter.mode === route.mode) &&
        // If user search is active, filter by either the long or short name
        (!filter.search ||
          (route.longName &&
            route.longName
              .toLowerCase()
              .includes(filter.search.toLowerCase())) ||
          (route.shortName &&
            route.shortName
              .toLowerCase()
              .includes(filter.search.toLowerCase())))
    )
)

/**
 * Sorts routes filtered by the selector which filters routes
 */
export const getSortedFilteredRoutes = createSelector(
  getFilteredRoutes,
  (state) => state.otp.config.transitOperators,
  (routes, transitOperators) =>
    routes.sort(coreUtils.route.makeRouteComparator(transitOperators))
)

/**
 * Get the modes available for the current agency filter. First filters only by agency,
 * then extracts each mode
 */
export const getModesForActiveAgencyFilter = createSelector(
  routeSelector,
  routeViewerFilterSelector,
  (routes, filter) =>
    Array.from(
      new Set(
        routes
          .filter(
            (route) =>
              route.mode &&
              (!filter.agency || filter.agency === route.agencyName)
          )
          .map((route) => route.mode)
          .filter((mode) => mode !== undefined)
      )
    ).sort()
)

/**
 * Returns list of agencies present within all routes
 */
export const getAgenciesFromRoutes = createSelector(routeSelector, (routes) =>
  Array.from(
    new Set(routes.map((route) => route.agencyName || route.agency.name))
  )
    .filter((agency) => agency !== undefined)
    .sort()
)

/**
 * Converts an OTP itinerary to the transitive.js format,
 * using a selector to prevent unnecessary re-renderings of the transitive overlay.
 */
export const getTransitiveData = createSelector(
  activeSearchHasResponse,
  getOtpResponse,
  itineraryResponseExists,
  getItineraryToRender,
  (state) => state.otp.config.companies,
  (state, props) => props.getTransitiveRouteLabel,
  (
    hasResponse,
    otpResponse,
    hasItineraryResponse,
    itineraryToRender,
    companies,
    getTransitiveRouteLabel
  ) => {
    if (hasResponse) {
      if (hasItineraryResponse) {
        return itineraryToRender
          ? coreUtils.map.itineraryToTransitive(
              itineraryToRender,
              companies,
              getTransitiveRouteLabel
            )
          : null
      } else if (otpResponse) {
        return otpResponse
      }
    }
  }
)

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {Object} query an OTP query object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */
export function hasValidLocation(query, locationKey) {
  return query[locationKey] && query[locationKey].lat && query[locationKey].lon
}

/**
 * Determine if the current query is valid
 * @param {Object} state the redux state object
 * @returns {boolean}
 */
export function queryIsValid(state) {
  const { currentQuery } = state.otp
  return (
    hasValidLocation(currentQuery, 'from') &&
    hasValidLocation(currentQuery, 'to')
  )
  // TODO: add mode validation
  // TODO: add date/time validation
}
/* eslint-disable-next-line complexity */
export function getRealtimeEffects(state) {
  const search = getActiveSearch(state)

  const realtimeItineraries =
    search && search.response && search.response.plan
      ? search.response.plan.itineraries
      : null

  /*
    This is not actively used, but may be again in the future to 
    facilitate trip monitoring, which requires a non-realtime
    trip 
  */
  const hasNonRealtimeItineraries =
    search && search.nonRealtimeResponse && search.nonRealtimeResponse.plan

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

  const normalRoutes =
    isAffectedByRealtimeData && nonRealtimeItineraries
      ? nonRealtimeItineraries[0].legs
          .filter((leg) => !!leg.route)
          .map((leg) => leg.route)
      : []

  const realtimeRoutes =
    isAffectedByRealtimeData && realtimeItineraries
      ? realtimeItineraries[0].legs
          .filter((leg) => !!leg.route)
          .map((leg) => leg.route)
      : []

  const normalDuration =
    isAffectedByRealtimeData && nonRealtimeItineraries
      ? nonRealtimeItineraries[0].duration
      : 0

  const realtimeDuration =
    isAffectedByRealtimeData && realtimeItineraries
      ? realtimeItineraries[0].duration
      : 0
  return {
    exceedsThreshold:
      Math.abs(normalDuration - realtimeDuration) >=
      state.otp.config.realtimeEffectsDisplayThreshold,
    isAffectedByRealtimeData,
    normalDuration,
    normalRoutes,
    realtimeDuration,
    realtimeRoutes,
    routesDiffer: !isEqual(normalRoutes, realtimeRoutes)
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
export function getShowUserSettings(state) {
  return state.otp.config.persistence?.enabled
}

export function getStopViewerConfig(state) {
  return state.otp.config.stopViewer
}

/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */
export function getUiUrlParams(state) {
  const activeSearch = getActiveSearch(state)
  const uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0,
    ui_activeSearch: state.otp.activeSearchId
  }
  return uiParams
}

// Set default title to the original document title (on load) set in index.html
const DEFAULT_TITLE = document.title

export function getTitle(state, intl) {
  // Override title can optionally be provided in config.yml
  const { config, ui, user } = state.otp
  const title = config.title || DEFAULT_TITLE
  const { mainPanelContent, viewedRoute, viewedStop } = ui
  let status
  switch (mainPanelContent) {
    case MainPanelContent.ROUTE_VIEWER:
      status = intl.formatMessage(
        { id: 'util.state.titleBarRouteId' },
        { routeId: viewedRoute?.routeId }
      )
      break
    case MainPanelContent.STOP_VIEWER:
      status = intl.formatMessage(
        { id: 'util.state.titleBarStopId' },
        { stopId: viewedStop?.stopId }
      )
      break
    default:
      const activeSearch = getActiveSearch(state)
      if (activeSearch) {
        status = coreUtils.query.summarizeQuery(
          activeSearch.query,
          user.locations
        )
      }
      break
  }

  if (status) {
    return intl.formatMessage(
      { id: 'util.state.titleBarWithStatus' },
      { status, title }
    )
  }

  return title
}
