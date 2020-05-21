import debounce from 'lodash.debounce'
import isEqual from 'lodash.isequal'
import moment from 'moment'
import coreUtils from '@opentripplanner/core-utils'
import { createAction } from 'redux-actions'

import { queryIsValid } from '../util/state'
import {
  MobileScreens,
  setMainPanelContent,
  setMobileScreen
} from '../actions/ui'

import { routingQuery } from './api'

const {
  getDefaultQuery,
  getTripOptionsFromQuery,
  getUrlParams,
  planParamsToQuery
} = coreUtils.query

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const clearActiveSearch = createAction('CLEAR_ACTIVE_SEARCH')
export const setActiveSearch = createAction('SET_ACTIVE_SEARCH')
export const clearDefaultSettings = createAction('CLEAR_DEFAULT_SETTINGS')
export const storeDefaultSettings = createAction('STORE_DEFAULT_SETTINGS')

export function resetForm () {
  return function (dispatch, getState) {
    const otpState = getState().otp
    const { transitModes } = otpState.config.modes
    if (otpState.user.defaults) {
      dispatch(settingQueryParam(otpState.user.defaults))
    } else {
      // Get user overrides and apply to default query
      const userOverrides = coreUtils.storage.getItem('defaultQuery', {})
      const defaultQuery = Object.assign(
        getDefaultQuery(otpState.config),
        userOverrides
      )
      // Filter out non-options (i.e., date, places).
      const options = getTripOptionsFromQuery(defaultQuery)
      // Default mode is currently WALK,TRANSIT. We need to update this value
      // here to match the list of modes, otherwise the form will break.
      options.mode = ['WALK', ...transitModes.map(m => m.mode)].join(',')
      dispatch(settingQueryParam(options))
    }
  }
}

/**
 * Action to update any specified query parameter. Replaces previous series of
 * parameter-specific actions. If a search ID is provided, a routing query (OTP
 * search) will be kicked off immediately.
 */
export function setQueryParam (payload, searchId) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload))
    if (searchId) dispatch(routingQuery(searchId))
  }
}

// FIXME: remove
function stringToCoords(str) {
  return (str && str.split(",").map(c => +c)) || [];
}

// FIXME: remove
export function coordsToString(coords) {
  return coords.length && coords.map(c => (+c).toFixed(5)).join(", ");
}

// FIXME: remove
function parseLocationString(value) {
  const parts = value.split("::");
  const coordinates = parts[1]
    ? stringToCoords(parts[1])
    : stringToCoords(parts[0]);
  const name = parts[1] ? parts[0] : coordsToString(coordinates);
  return coordinates.length === 2
    ? {
        name: name || null,
        lat: coordinates[0] || null,
        lon: coordinates[1] || null
      }
    : null;
}

export function parseUrlQueryString (params = getUrlParams()) {
  return function (dispatch, getState) {
    // Filter out the OTP (i.e. non-UI) params and set the initial query
    const planParams = {}
    Object.keys(params).forEach(key => {
      if (!key.startsWith('ui_')) planParams[key] = params[key]
    })
    const searchId = params.ui_activeSearch || coreUtils.storage.randId()
    // Convert strings to numbers/objects and dispatch
    const parsedParams = planParamsToQuery(planParams, getState().otp.config)
    parsedParams.intermediatePlaces = planParams.intermediatePlaces
      ? planParams.intermediatePlaces.split(',').map(parseLocationString)
      : []
    dispatch(setQueryParam(parsedParams, searchId))
  }
}

let debouncedPlanTrip // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs

export function formChanged (oldQuery, newQuery) {
  return function (dispatch, getState) {
    const otpState = getState().otp
    const isMobile = coreUtils.ui.isMobile()

    // If departArrive is set to 'NOW', update the query time to current
    if (otpState.currentQuery && otpState.currentQuery.departArrive === 'NOW') {
      dispatch(settingQueryParam({ time: moment().format(coreUtils.time.OTP_API_TIME_FORMAT) }))
    }

    // Determine if either from/to location has changed
    const fromChanged = !isEqual(oldQuery.from, newQuery.from)
    const toChanged = !isEqual(oldQuery.to, newQuery.to)

    // Only clear the main panel if a single location changed. This prevents
    // clearing the panel on load if the app is focused on a stop viewer but a
    // search query should also be visible.
    const oneLocationChanged = (fromChanged && !toChanged) || (!fromChanged && toChanged)
    if (oneLocationChanged) {
      dispatch(setMainPanelContent(null))
    }

    // Clear the current search and return to search screen on mobile when
    // either location changes only if not currently on welcome screen (otherwise
    // when the current position is auto-set the screen will change unexpectedly).
    if (
      isMobile &&
      (fromChanged || toChanged) &&
      otpState.ui.mobileScreen !== MobileScreens.WELCOME_SCREEN
    ) {
      dispatch(clearActiveSearch())
      dispatch(setMobileScreen(MobileScreens.SEARCH_FORM))
    }

    // Check whether a trip should be auto-replanned
    const { autoPlan, debouncePlanTimeMs } = otpState.config
    const updatePlan =
      autoPlan ||
      (!isMobile && oneLocationChanged) || // TODO: make autoplan configurable at the parameter level?
      (isMobile && fromChanged && toChanged)
    if (updatePlan && queryIsValid(otpState)) { // trip plan should be made
      // check if debouncing function needs to be (re)created
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = debounce(() => dispatch(routingQuery()), debouncePlanTimeMs)
        lastDebouncePlanTimeMs = debouncePlanTimeMs
      }
      debouncedPlanTrip()
    }
  }
}
