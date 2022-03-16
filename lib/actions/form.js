// TODO: Typescript
/* eslint-disable @typescript-eslint/no-use-before-define */
import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'
import debounce from 'lodash.debounce'
import isEqual from 'lodash.isequal'
import moment from 'moment'
import qs from 'qs'

import { queryIsValid } from '../util/state'

import {
  MobileScreens,
  routeTo,
  setMainPanelContent,
  setMobileScreen
} from './ui'
import { routingQuery } from './api'
import { setLocation } from './map'

const {
  getDefaultQuery,
  getTripOptionsFromQuery,
  getUrlParams,
  planParamsToQueryAsync
} = coreUtils.query

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const clearActiveSearch = createAction('CLEAR_ACTIVE_SEARCH')
export const setActiveSearch = createAction('SET_ACTIVE_SEARCH')
export const clearDefaultSettings = createAction('CLEAR_DEFAULT_SETTINGS')
export const storeDefaultSettings = createAction('STORE_DEFAULT_SETTINGS')

/**
 * Reset the trip form parameters to their default values.
 * @param {Boolean} [full=false] if set to true, the from/to locations and URL
 *  query parameters will also be reset.
 */
export function resetForm(full = false) {
  return function (dispatch, getState) {
    const state = getState()
    const { transitModes } = state.otp.config.modes
    if (state.otp.user.defaults) {
      dispatch(settingQueryParam(state.otp.user.defaults))
    } else {
      // Get user overrides and apply to default query
      const userOverrides = coreUtils.storage.getItem('defaultQuery', {})
      const defaultQuery = Object.assign(
        getDefaultQuery(state.otp.config),
        userOverrides
      )
      // Filter out non-options (i.e., date, places).
      const options = getTripOptionsFromQuery(defaultQuery)
      // Default mode is currently WALK,TRANSIT. We need to update this value
      // here to match the list of modes, otherwise the form will break.
      options.mode = ['WALK', ...transitModes.map((m) => m.mode)].join(',')
      dispatch(settingQueryParam(options))
    }
    if (full) {
      // If fully resetting form, also clear the active search, from/to
      // locations, and query params.
      dispatch(clearActiveSearch())
      dispatch(setLocation({ location: null, locationType: 'from' }))
      dispatch(setLocation({ location: null, locationType: 'to' }))
      // Get query params. Delete everything except sessionId.
      const params = getUrlParams()
      for (const key in params) {
        if (key !== 'sessionId') delete params[key]
      }
      dispatch(routeTo('/', qs.stringify(params, { addQueryPrefix: true })))
    }
  }
}

/**
 * Action to update any specified query parameter. Replaces previous series of
 * parameter-specific actions. If a search ID is provided, a routing query (OTP
 * search) will be kicked off immediately.
 */
export function setQueryParam(payload, searchId) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload))
    if (searchId) dispatch(routingQuery(searchId))
  }
}

/**
 * An action that parses the active URL's query params (or whatever is passed in)
 * and updates the state with the OTP plan query params. A new search will be
 * performed according to the behavior of setQueryParam (i.e., if the passed
 * searchId is not null).
 * @param  {Object} params an object containing URL query params
 * @param  {string} source optionally contains the source of the query params
 *                         (e.g., _CALL indicates that the source is from a past
 *                         query made during a call taker session, to prevent
 *                         a search from being added to the current call)
 */
export function parseUrlQueryString(params = getUrlParams(), source) {
  return function (dispatch, getState) {
    const state = getState()
    if (state.otp.ui.mainPanelContent !== null) return state

    // Filter out the OTP (i.e. non-UI) params and set the initial query
    const planParams = {}
    Object.keys(params).forEach((key) => {
      if (!key.startsWith('ui_')) planParams[key] = params[key]
    })
    let searchId = params.ui_activeSearch || coreUtils.storage.randId()
    if (source) searchId += source
    // Convert strings to numbers/objects and dispatch
    planParamsToQueryAsync(planParams, getState().otp.config).then((query) =>
      dispatch(setQueryParam(query, searchId))
    )
  }
}

let debouncedPlanTrip // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs

/**
 * This action is dispatched when a change between the old query and new query
 * is detected. It handles checks for whether the trip should be replanned
 * (based on autoPlan strategies) as well as updating the UI state (esp. for
 * mobile).
 */
export function formChanged(oldQuery, newQuery) {
  return function (dispatch, getState) {
    const state = getState()
    const { config, currentQuery, ui } = state.otp
    const { autoPlan, debouncePlanTimeMs } = config
    const isMobile = coreUtils.ui.isMobile()
    const { fromChanged, oneLocationChanged, shouldReplanTrip, toChanged } =
      checkShouldReplanTrip(autoPlan, isMobile, oldQuery, newQuery)
    // If departArrive is set to 'NOW', update the query time to current
    if (currentQuery.departArrive === 'NOW') {
      const now = moment().format(coreUtils.time.OTP_API_TIME_FORMAT)
      dispatch(settingQueryParam({ time: now }))
    }
    // Only clear the main panel if a single location changed. This prevents
    // clearing the panel on load if the app is focused on a stop viewer but a
    // search query should also be visible.
    if (oneLocationChanged && !isMobile) {
      dispatch(setMainPanelContent(null))
    }
    if (!shouldReplanTrip) {
      // If not replanning the trip, clear the current search when either
      // location changes.
      if (fromChanged || toChanged) {
        dispatch(clearActiveSearch())
        // Return to search screen on mobile only if not currently on welcome
        // screen (otherwise when the current position is auto-set the screen
        // will change unexpectedly).
        if (ui.mobileScreen !== MobileScreens.WELCOME_SCREEN) {
          dispatch(setMobileScreen(MobileScreens.SEARCH_FORM))
        }
      }
    } else if (queryIsValid(state)) {
      // If replanning trip and query is valid,
      // check if debouncing function needs to be (re)created.
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = debounce(
          () => dispatch(routingQuery()),
          debouncePlanTimeMs
        )
        lastDebouncePlanTimeMs = debouncePlanTimeMs
      }
      debouncedPlanTrip()
    }
  }
}

/**
 * Check if the trip should be replanned based on the auto plan strategy,
 * whether the mobile view is active, and the old/new queries. Response type is
 * an object containing various booleans.
 */
export function checkShouldReplanTrip(autoPlan, isMobile, oldQuery, newQuery) {
  // Determine if either from/to location has changed
  const fromChanged = !isEqual(oldQuery.from, newQuery.from)
  const toChanged = !isEqual(oldQuery.to, newQuery.to)
  const oneLocationChanged =
    (fromChanged && !toChanged) || (!fromChanged && toChanged)
  // Check whether a trip should be auto-replanned
  const strategy =
    isMobile && autoPlan?.mobile ? autoPlan?.mobile : autoPlan?.default
  const shouldReplanTrip = evaluateAutoPlanStrategy(
    strategy,
    fromChanged,
    toChanged,
    oneLocationChanged
  )
  return {
    fromChanged,
    oneLocationChanged,
    shouldReplanTrip,
    toChanged
  }
}

/**
 * Shorthand method to evaluate auto plan strategy. It is assumed that this is
 * being called within the context of the `formChanged` action, so presumably
 * some query param has already changed. If further checking of query params is
 * needed, additional strategies should be added.
 */
const evaluateAutoPlanStrategy = (
  strategy,
  fromChanged,
  toChanged,
  oneLocationChanged
) => {
  switch (strategy) {
    case 'ONE_LOCATION_CHANGED':
      if (oneLocationChanged) return true
      break
    case 'BOTH_LOCATIONS_CHANGED':
      if (fromChanged && toChanged) return true
      break
    case 'ANY':
      return true
    default:
      return false
  }
}
