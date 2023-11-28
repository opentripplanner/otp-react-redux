import { compareTwoStrings } from 'string-similarity'
import { createSelector } from 'reselect'
import { format } from 'date-fns-tz'
import { FormattedList, FormattedMessage } from 'react-intl'
import { itineraryToTransitive } from '@opentripplanner/transitive-overlay'
import coreUtils from '@opentripplanner/core-utils'
import isEqual from 'lodash.isequal'
import qs from 'qs'
import React from 'react'
import styled from 'styled-components'

import FormattedMode from '../components/util/formatted-mode'
import Strong from '../components/util/strong-text'

import {
  addCarbonInfoToAll,
  addSortingCosts,
  calculateItineraryCost,
  collectItinerariesWithoutDuplicates
} from './itinerary'

// For lowercase context
const LowerCase = styled.span`
  text-transform: lowercase;
`

/**
 * Get the active search object
 * @param {Object} state the redux state object
 * @returns {Object} an search object, or null if there is no active search
 */
export function getActiveSearch(state) {
  return state.otp.searches[state.otp.activeSearchId]
}

/**
 * Array sort function for itineraries (in batch routing context) that attempts
 * to sort based on the type/direction specified.
 */
export function sortItineraries(type, direction, a, b, config) {
  const dirFactor = direction === 'ASC' ? 1 : -1
  switch (type) {
    case 'WALKTIME':
      return dirFactor * (a.walkTime - b.walkTime)
    case 'ARRIVALTIME':
      return dirFactor * (a.endTime - b.endTime)
    case 'DEPARTURETIME':
      return dirFactor * (a.startTime - b.startTime)
    case 'DURATION':
      return dirFactor * (a.duration - b.duration)
    case 'COST':
      return dirFactor * (a.totalFare - b.totalFare)
    default:
      if (type !== 'BEST')
        console.warn(`Sort (${type}) not supported. Defaulting to BEST.`)
      // FIXME: Fully implement default sort algorithm.
      return dirFactor * (a.rank - b.rank)
  }
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
  (state) => state.callTaker?.fieldTrip?.activeId,
  (state) => state.callTaker?.fieldTrip?.requests,
  (activeId, requests) => {
    if (!activeId || !requests) return
    return requests.data.find((req) => req.id === activeId)
  }
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
  getActiveSearchRealtimeResponse,
  (config, nonRealtimeResponse, realtimeResponse) => {
    const response = realtimeResponse || nonRealtimeResponse
    const itineraries = collectItinerariesWithoutDuplicates(response).map(
      (itin) => addSortingCosts(itin, config)
    )
    // Add carbon info, if available.
    if (config.co2?.enabled) {
      return addCarbonInfoToAll(itineraries, config.co2)
    }
    return itineraries
  }
)

/**
 * Helper method to sort itineraries.
 * As the name indicates, it will mutate the order in the specified array.
 */
export function sortItinerariesInPlaceIfNeeded(itineraries, state) {
  const { config, filter } = state.otp
  const { sort } = filter
  const { direction, type } = sort

  // If no sort type is provided (e.g., because batch routing is not enabled),
  // do not sort itineraries (default sort from API response is used).
  // Also, do not sort itineraries if a field trip request is active
  return !type || Boolean(getActiveFieldTripRequest(state))
    ? itineraries
    : itineraries.sort((a, b) => sortItineraries(type, direction, a, b, config))
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
 * Get the active leg object
 * @param {Object} state the redux state object
 * @returns {Object} an search object, or null if there is no active search
 */
export function getActiveLeg(state) {
  const { activeLeg } = getActiveSearch(state) || {}
  // activeLeg is a number and can be zero, so check for null/undefined instead of truthy.
  if (activeLeg === undefined || activeLeg === null) return undefined

  const activeItinerary = getActiveItinerary(state)
  return activeItinerary?.legs?.[activeLeg]
}

/**
 * Get timestamp in the ISO-like format used by otp-datastore (call taker back end),
 * in the form 2021-07-10T13:46:12, expressed in the specified time zone. Defaults to now.
 */
export function getISOLikeTimestamp(timeZone, date = Date.now()) {
  return format(date, "yyyy-MM-dd'T'HH:mm:ss", { timeZone })
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
 * @return {Array} An array of objects describing errors seen. These could also
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
  } else if (error.id === 404 || error.id === 400) {
    // Localized messages for OTP's 404 PATH_NOT_FOUND error.
    // OTP2 throws 400
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
                    <LowerCase key={mode}>
                      <FormattedMode mode={mode} />
                    </LowerCase>
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
          reason: (
            <FormattedMessage
              id="util.state.noTripFoundReason"
              values={{ strong: Strong }}
            />
          )
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

const getAgencyIdsForFilter = (name, transitOperators) => {
  return transitOperators
    .filter((operator) => operator.name === name)
    .map((x) => x.agencyId)
}

/**
 * Determine if a string matches a query. Uses direct matching if the string is only numbers,
 * uses fuzzy matching otherwise.
 *
 * Fuzzy matching is based on string similarity, which can help with both typos and missing characters.
 * For example, fuzzy matching will allow "A-Line" to be matched by both "a line" and "z-line"
 *
 * If the fuzzy matching fails, the standard direct string matching used for strings of numbers
 * is used on the string. So "A" for "A-Line" may not have a high enough string similarity,
 * but will still return true as it is a direct substring.
 */
const isFilterMatch = (string, query) => {
  const normalizedQuery = query.toLowerCase()
  const normalizedString = string.toLowerCase()

  if (
    string.match(/^[0-9]+$/) == null &&
    compareTwoStrings(normalizedQuery, normalizedString) > 0.4
  ) {
    return true
  }

  return normalizedString.includes(normalizedQuery)
}

/**
 * Returns all routes that match the route viewer filters
 */
export const getFilteredRoutes = createSelector(
  routeSelector,
  routeViewerFilterSelector,
  (state) => state.otp.config.transitOperators,
  (routes, filter, transitOperators) =>
    routes.filter(
      (route) =>
        (!filter.agency ||
          getAgencyIdsForFilter(filter.agency, transitOperators).includes(
            route.agencyId
          ) ||
          filter.agency === route.agencyName) &&
        (!filter.mode || filter.mode === route.mode) &&
        // If user search is active, filter by either the long/short name, or the route description
        (!filter.search ||
          (route.longName && isFilterMatch(route.longName, filter.search)) ||
          (route.desc && isFilterMatch(route.desc, filter.search)) ||
          (route.shortName && isFilterMatch(route.shortName, filter.search)))
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
  (state) => state.otp.config.transitOperators,
  (routes, filter, transitOperators) =>
    Array.from(
      new Set(
        routes
          .filter(
            (route) =>
              route.mode &&
              (!filter.agency ||
                getAgencyIdsForFilter(filter.agency, transitOperators).includes(
                  route.agencyId
                ) ||
                filter.agency === route.agencyName)
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
    new Set(routes.map((route) => route.agencyName || route?.agency?.name))
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
  (state) => state.otp.config.map.transitive?.disableFlexArc,
  (state, props) => props.getTransitiveRouteLabel,
  (state, props) => props.intl,
  (
    hasResponse,
    otpResponse,
    hasItineraryResponse,
    itineraryToRender,
    companies,
    disableFlexArc,
    getTransitiveRouteLabel,
    intl
  ) => {
    if (hasResponse) {
      if (hasItineraryResponse) {
        return itineraryToRender
          ? itineraryToTransitive(itineraryToRender, {
              companies,
              disableFlexArc,
              getRouteLabel: getTransitiveRouteLabel,
              intl
            })
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
  return state.otp.config?.persistence?.enabled
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

export function getRouteOperator(routeObject, transitOperators) {
  return (
    coreUtils.route.getTransitOperatorFromOtpRoute(
      routeObject,
      transitOperators
    ) || {}
  )
}

/** Helper method to get the user-friendly operator name (fallback on GTFS route agency name). */
export function getOperatorName(operator, routeObject) {
  const { agency, agencyName } = routeObject
  return operator?.name || agency?.name || agencyName
}

/** Helper method to get a localized string of type "<operator> Route <number>" in the desired locale. */
export function getOperatorAndRoute(routeObject, transitOperators, intl) {
  // Find operator based on agency_id (extracted from OTP route ID).
  const operator = getRouteOperator(routeObject, transitOperators)
  const { longName, shortName } = routeObject
  const operatorName = getOperatorName(operator, routeObject)

  return (
    // Simply append the operator to create telegraphic-style text.
    (operatorName ? `${operatorName} ` : '') +
    intl.formatMessage(
      { id: 'common.routing.routeAndNumber' },
      { routeId: shortName || longName }
    )
  )
}

/**
 * Helper method returns true if an array is a subsequence of another.
 *
 * More efficient than comparing strings as we don't need to look at the entire
 * array.
 */
export function isValidSubsequence(array, sequence) {
  // Find starting point
  let i = 0
  let j = 0
  while (array[i] !== sequence[j] && i < array.length) {
    i = i + 1
  }
  // We've found the starting point, now we test to see if the rest of the sequence is matched
  while (array[i] === sequence[j] && i < array.length && j < sequence.length) {
    i = i + 1
    j = j + 1
  }
  return j === sequence.length
}
