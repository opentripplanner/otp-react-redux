/* globals fetch */

import { createAction } from 'redux-actions'
import qs from 'qs'

if (typeof (fetch) === 'undefined') {
  require('isomorphic-fetch')
}

import { queryIsValid } from '../util/state'

import queryParams from '../util/query-params'
import { filterProfileOptions } from '../util/profile'

// Generic API actions

export const routingRequest = createAction('ROUTING_REQUEST')
export const routingResponse = createAction('ROUTING_RESPONSE')
export const routingError = createAction('ROUTING_ERROR')

let lastSearchId = 0

export function routingQuery () {
  return async function (dispatch, getState) {
    const otpState = getState().otp
    const routingType = otpState.currentQuery.routingType
    const searchId = ++lastSearchId

    if (!queryIsValid(otpState)) return
    dispatch(routingRequest({ routingType, searchId }))
    const url = constructRoutingQuery(otpState)
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

      if (json && json.otp && json.otp.profile) {
        json.otp = filterProfileOptions(json.otp)
      }
    } catch (error) {
      return dispatch(routingError({ error, searchId }))
    }

    dispatch(routingResponse({ response: json, searchId }))
  }
}

function constructRoutingQuery (otpState) {
  const { config, currentQuery } = otpState
  const routingType = currentQuery.routingType
  const isItinerary = routingType === 'ITINERARY'
  const api = isItinerary ? config.api : config.profileApi
  const planEndpoint = `${api.host}${api.port
    ? ':' + api.port
    : ''}${api.path}/plan`

  let params = {}
  queryParams
    .filter(
      qp => qp.routingTypes.indexOf(routingType) !== -1 && qp.name in currentQuery
    )
    .forEach(qp => {
      const rewriteFunction = isItinerary
        ? qp.itineraryRewrite
        : qp.profileRewrite
      params = Object.assign(
        params,
        rewriteFunction
          ? rewriteFunction(currentQuery[qp.name])
          : { [qp.name]: currentQuery[qp.name] }
      )
    })

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
    const planEndpoint = `${api.host}:${api.port ? ':' + api.port : ''}${api.path}/bike_rental`
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
    const url = `${api.host}:${api.port ? ':' + api.port : ''}${api.path}/index/stops?${paramStr}`
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
    const url = `${api.host}:${api.port ? ':' + api.port : ''}${api.path}/index/stops/${stopId}/routes`
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
