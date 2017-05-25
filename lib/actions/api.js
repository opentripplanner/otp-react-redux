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

// bike rental station query

export const receivedBikeRentalError = createAction('BIKE_RENTAL_ERROR')
export const receivedBikeRentalResponse = createAction('BIKE_RENTAL_RESPONSE')
export const requestBikeRentalResponse = createAction('BIKE_RENTAL_REQUEST')

export function bikeRentalQuery () {
  return async function (dispatch, getState) {
    const otpState = getState().otp

    dispatch(requestBikeRentalResponse())
    const api = otpState.config.api
    const planEndpoint = `${api.host}:${api.port}${api.path}/bike_rental`
    const url = planEndpoint // TODO: add bbox

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
      return dispatch(receivedBikeRentalError(err))
    }

    dispatch(receivedBikeRentalResponse(json))
  }
}


export const receivedNearbyStopsResponse = createAction('NEARBY_STOPS_RESPONSE')
export const receivedNearbyStopsError = createAction('NEARBY_STOPS_ERROR')

export function findNearbyStops (params) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    params = Object.assign({ radius: 1000 }, params)
    const paramStr = Object.keys(params).map(k => `${k}=${encodeURIComponent(params[k])}`).join('&')
    const url = `${api.host}:${api.port}${api.path}/index/stops?${paramStr}`
    let stops
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      stops = await response.json()
    } catch (err) {
      return dispatch(receivedNearbyStopsError(err))
    }

    stops.sort((a, b) => a.dist - b.dist)
    if (stops.length > 5) stops = stops.slice(0, 5)
    console.log('stops', stops)
    dispatch(receivedNearbyStopsResponse({ stops }))

    // retrieve routes for each stop
    stops.forEach(stop => {
      dispatch(findRoutesAtStop(stop.id))
    })
  }
}

export const receivedRoutesAtStopResponse = createAction('ROUTES_AT_STOP_RESPONSE')
export const receivedRoutesAtStopError = createAction('ROUTES_AT_STOP_ERROR')

export function findRoutesAtStop (stopId) {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const api = otpState.config.api
    const url = `${api.host}:${api.port}${api.path}/index/stops/${stopId}/routes`
    let routes
    try {
      const response = await fetch(url)
      if (response.status >= 400) {
        const error = new Error('Received error from server')
        error.response = response
        throw error
      }
      routes = await response.json()
    } catch (err) {
      return dispatch(receivedRoutesAtStopError(err))
    }

    dispatch(receivedRoutesAtStopResponse({ stopId, routes }))
  }
}
