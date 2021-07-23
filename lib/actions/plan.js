import {OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT} from '@opentripplanner/core-utils/lib/time'
import {getTimeZoneOffset} from '@opentripplanner/core-utils/lib/itinerary'
import moment from 'moment'

import {getFirstStopId} from '../util/itinerary'
import {getActiveItinerary} from '../util/state'

import {routingQuery} from './api'
import {setQueryParam} from './form'

const SERVICE_BREAK = '03:00'
const NINETY_SECONDS = 90000

function updateParamsAndPlan (params) {
  return function (dispatch, getState) {
    dispatch(setQueryParam(params))
    dispatch(routingQuery())
  }
}

function offsetTime (itinerary, unixTime) {
  let offset = 0
  if (itinerary) offset = getTimeZoneOffset(itinerary)
  return moment(unixTime + offset)
}

/**
 * Effectively checks whether #planFirst has already been clicked, i.e., the
 * query is planning a depart at the service break time.
 */
function isPlanningFirst (query) {
  const {departArrive, time} = query
  return departArrive === 'DEPART' && time === SERVICE_BREAK
}

/**
 * Plan the first trip of the day, or if the first trip has already been planned,
 * plan the first trip of the previous day.
 */
export function planFirst () {
  return function (dispatch, getState) {
    const state = getState()
    const itinerary = getActiveItinerary(state)
    const {currentQuery} = state.otp
    const date = moment(currentQuery.date)
    // If already planning for the "first" trip, subtract a day to mirror the
    // behavior of planLast.
    if (isPlanningFirst(currentQuery)) date.subtract('days', 1)
    const params = {
      date: date.format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART',
      startTransitStopId: getFirstStopId(itinerary),
      time: SERVICE_BREAK
    }
    dispatch(updateParamsAndPlan(params))
  }
}

/**
 * Plan the previous trip, setting the arrive by time to the current itinerary's
 * end time (minus a small amount).
 */
export function planPrevious () {
  return function (dispatch, getState) {
    const itinerary = getActiveItinerary(getState())
    const newEndTime = offsetTime(itinerary, itinerary.endTime - NINETY_SECONDS)
    const params = {
      date: newEndTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE',
      startTransitStopId: getFirstStopId(itinerary),
      time: newEndTime.format(OTP_API_TIME_FORMAT)
    }
    dispatch(updateParamsAndPlan(params))
  }
}

/**
 * Plan the next trip, setting the depart at time to the current itinerary's
 * start time (plus a small amount).
 */
export function planNext () {
  return function (dispatch, getState) {
    const itinerary = getActiveItinerary(getState())
    const newStartTime = offsetTime(itinerary, itinerary.startTime + NINETY_SECONDS)
    const params = {
      date: newStartTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART',
      startTransitStopId: getFirstStopId(itinerary),
      time: newStartTime.format(OTP_API_TIME_FORMAT)
    }
    dispatch(updateParamsAndPlan(params))
  }
}

/**
 * Plan the last trip of the day, or if the last trip has already been planned,
 * plan the last trip of the next day.
 */
export function planLast () {
  return function (dispatch, getState) {
    const state = getState()
    const itinerary = getActiveItinerary(state)
    const {currentQuery} = state.otp
    const params = {
      date: moment(currentQuery.date).add('days', 1).format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE',
      startTransitStopId: getFirstStopId(itinerary),
      time: SERVICE_BREAK
    }
    dispatch(updateParamsAndPlan(params))
  }
}
