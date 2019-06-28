import debounce from 'lodash.debounce'
import qs from 'qs'
import moment from 'moment'
import { createAction } from 'redux-actions'
import isEqual from 'lodash.isequal'

import { coordsToString, stringToCoords } from '../util/map'
import { queryIsValid } from '../util/state'
import { getCurrentTime, getCurrentDate } from '../util/time'
import { isMobile } from '../util/ui'
import {
  MobileScreens,
  setViewedStop,
  setViewedTrip,
  setViewedRoute,
  setMainPanelContent,
  setMobileScreen
} from '../actions/ui'

import { routingQuery } from './api'

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const clearActiveSearch = createAction('CLEAR_ACTIVE_SEARCH')

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

/**
 * OTP allows passing a location in the form '123 Main St::lat,lon', so we check
 * for the double colon and parse the coordinates accordingly.
 */
function parseLocationString (value) {
  const parts = value.split('::')
  const coordinates = parts[1]
    ? stringToCoords(parts[1])
    : stringToCoords(parts[0])
  const name = parts[1]
    ? parts[0]
    : coordsToString(coordinates)
  return coordinates.length === 2 ? {
    name: name || null,
    lat: coordinates[0] || null,
    lon: coordinates[1] || null
  } : null
}

function planParamsToQuery (params) {
  const query = {}
  for (var key in params) {
    switch (key) {
      case 'fromPlace':
        query.from = parseLocationString(params.fromPlace)
        break
      case 'toPlace':
        query.to = parseLocationString(params.toPlace)
        break
      case 'arriveBy':
        query.departArrive = params.arriveBy === 'true'
          ? 'ARRIVE'
          : params.arriveBy === 'false'
            ? 'DEPART'
            : 'NOW'
        break
      case 'date':
        query.date = params.date || getCurrentDate()
        break
      case 'time':
        query.time = params.time || getCurrentTime()
        break
      default:
        if (!isNaN(params[key])) query[key] = parseFloat(params[key])
        else query[key] = params[key]
    }
  }
  return query
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

    // Clear the main panel if location changed
    if (fromChanged || toChanged) {
      dispatch(setViewedStop(null))
      dispatch(setViewedTrip(null))
      dispatch(setViewedRoute(null))
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
    const {autoPlan, debouncePlanTimeMs} = otpState.config
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
