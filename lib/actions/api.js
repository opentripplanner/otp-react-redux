import { createAction } from 'redux-actions'
import fetch from 'isomorphic-fetch'

import { hasValidLocation } from '../util/state'

export const receivedPlanResponse = createAction('PLAN_RESPONSE')

export function planTrip () {
  return function (dispatch, getState) {
    const otpState = getState().otp
    if (!hasValidLocation(otpState, 'from') || !hasValidLocation(otpState, 'to')) return
    const url = constructPlanQuery(getState().otp.config.api, getState().otp.currentQuery)
    fetch(url)
      .then(response => {
        if (response.status >= 400) {
          throw new Error('Bad response from server')
        }
        return response.json()
      }).then(json => {
        dispatch(receivedPlanResponse(json))
      })
  }
}

function constructPlanQuery (api, query) {
  const planEndpoint = `${api.host}:${api.port}${api.path}/plan`

  const params = {}

  // TODO: check that valid from/to locations are provided
  params.fromPlace = `${query.from.lat},${query.from.lon}`
  params.toPlace = `${query.to.lat},${query.to.lon}`

  // convert the params object to a URL-encoded string
  const paramStr = Object.keys(params)
    .map(k => `${encodeURIComponent(k)}=${encodeURIComponent(params[k])}`)
    .join('&')

  return `${planEndpoint}?${paramStr}`
}
