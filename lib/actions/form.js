import debounce from 'lodash.debounce'
import qs from 'qs'
import moment from 'moment'
import { createAction } from 'redux-actions'

import { routingQuery } from './api'
import { coordsToString, stringToCoords } from '../util/map'
import { queryIsValid } from '../util/state'
import { getCurrentTime, getCurrentDate } from '../util/time'

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const changingForm = createAction('FORM_CHANGED')

/**
 * Action to update any specified query parameter. Replaces previous series of
 * parameter-specific actions.
 */
export function setQueryParam (payload) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload))
    dispatch(formChanged())
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

function planParamsToQuery (params) {
  const query = {}
  for (var key in params) {
    switch (key) {
      case 'fromPlace':
        const from = stringToCoords(params.fromPlace)
        query.from = from.length ? {
          name: coordsToString(from) || null,
          lat: from[0] || null,
          lon: from[1] || null
        } : null
        break
      case 'toPlace':
        const to = stringToCoords(params.toPlace)
        query.to = to.length ? {
          name: coordsToString(to) || null,
          lat: to[0] || null,
          lon: to[1] || null
        } : null
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
        query[key] = params[key]
    }
  }
  return query
}

let debouncedPlanTrip  // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs

export function formChanged () {
  return function (dispatch, getState) {
    const otpState = getState().otp
    // If departArrive is set to 'NOW', update the query time to current
    if (otpState.currentQuery && otpState.currentQuery.departArrive === 'NOW') {
      dispatch(settingQueryParam({ time: moment().format('HH:mm') }))
    }

    dispatch(changingForm())
    const {autoPlan, debouncePlanTimeMs} = otpState.config
    // check if a trip plan should be made
    if (autoPlan && queryIsValid(otpState)) {
      // trip plan should be made

      // check if debouncing function needs to be (re)created
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = debounce(() => dispatch(routingQuery()), debouncePlanTimeMs)
        lastDebouncePlanTimeMs = debouncePlanTimeMs
      }
      debouncedPlanTrip()
    }
  }
}
