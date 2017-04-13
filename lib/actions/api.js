/* globals fetch */

import deepEqual from 'deep-equal'
import { createAction } from 'redux-actions'
import qs from 'qs'

if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

import { queryIsValid } from '../util/state'

export const receivedPlanError = createAction('PLAN_ERROR')
export const receivedPlanResponse = createAction('PLAN_RESPONSE')
export const requestPlanResponse = createAction('PLAN_REQUEST')

export function planTrip (customOtpQueryBuilder) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const latest = otpState.searches.length && otpState.searches[otpState.searches.length - 1]
    // check for query change
    if (otpState.activeSearch !== null && latest && deepEqual(latest.query, otpState.currentQuery)) {
      console.log('query hasn\'t changed')
      return
    }
    if (!queryIsValid(otpState)) return
    dispatch(requestPlanResponse())
    const queryBuilderFn = customOtpQueryBuilder || otpState.config.customOtpQueryBuilder || constructPlanQuery
    const url = queryBuilderFn(otpState.config.api, otpState.currentQuery)
    // setURLSearch(url)
    let json
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      json = await response.json()
    } catch (err) {
      return dispatch(receivedPlanError(err))
    }

    dispatch(receivedPlanResponse(json))
  }
}

// function setURLSearch (params) {
//   window.location.hash = `#plan?${params.split('plan?')[1]}`
// }

function constructPlanQuery (api, query) {
  const planEndpoint = `${api.host}:${api.port}${api.path}/plan`
  const { mode, time, date } = query
  const params = {
    arriveBy: query.departArrive === 'ARRIVE',
    date,
    fromPlace: `${query.from.lat},${query.from.lon}`,
    showIntermediateStops: true,
    toPlace: `${query.to.lat},${query.to.lon}`,
    mode,
    time
  }
  const stringParams = qs.stringify(params)
  // TODO: set url hash based on params
  // setURLSearch(stringParams)
  // TODO: check that valid from/to locations are provided

  return `${planEndpoint}?${stringParams}`
}
