import debounce from 'lodash.debounce'
import qs from 'qs'
import moment from 'moment'
import { createAction } from 'redux-actions'
import isEqual from 'lodash.isequal'

import { getDefaultQuery, getTripOptionsFromQuery, getOtpUrlParams, planParamsToQuery } from '../util/query'
import { getItem } from '../util/storage'
import { queryIsValid } from '../util/state'
import { isMobile } from '../util/ui'
import {
  MobileScreens,
  setMainPanelContent,
  setMobileScreen
} from '../actions/ui'

import { routingQuery } from './api'

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const clearActiveSearch = createAction('CLEAR_ACTIVE_SEARCH')
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
      const userOverrides = getItem('defaultQuery')
      const defaultQuery = Object.assign(getDefaultQuery(), userOverrides)
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
 * parameter-specific actions.
 */
export function setQueryParam (payload) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload))
  }
}

export function parseUrlQueryString (queryString) {
  return function (dispatch, getState) {
    // Trim the leading question mark
    const params = qs.parse(queryString.substring(1))
    // Filter out the OTP (i.e. non-UI) params and set the initial query
    const planParams = {}
    Object.keys(params).forEach(key => {
      if (!key.startsWith('ui_')) planParams[key] = params[key]
    })
    // Convert strings to numbers/objects and dispatch
    dispatch(setQueryParam(planParamsToQuery(planParams)))
  }
}

let debouncedPlanTrip // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs

export function formChanged (oldQuery, newQuery) {
  return function (dispatch, getState) {
    const otpState = getState().otp

    // If departArrive is set to 'NOW', update the query time to current
    if (otpState.currentQuery && otpState.currentQuery.departArrive === 'NOW') {
      dispatch(settingQueryParam({ time: moment().format('HH:mm') }))
    }

    // Determine if either from/to location has changed
    const fromChanged = !isEqual(oldQuery.from, newQuery.from)
    const toChanged = !isEqual(oldQuery.to, newQuery.to)

    // Only clear the main panel if a single location changed. This prevents
    // clearing the panel on load if the app is focused on a stop viewer but a
    // search query should also be visible.
    if ((fromChanged && !toChanged) || (!fromChanged && toChanged)) {
      dispatch(setMainPanelContent(null))
    }

    // Clear the current search and return to search screen on mobile when
    // either location changes only if not currently on welcome screen (otherwise
    // when the current position is auto-set the screen will change unexpectedly).
    if (
      isMobile() &&
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
      (!isMobile() && (fromChanged || toChanged)) || // TODO: make autoplan configurable at the parameter level?
      (isMobile() && fromChanged && toChanged)
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
