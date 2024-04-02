import { addDays, format, isBefore, subDays } from 'date-fns'
import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import { toDate, utcToZonedTime } from 'date-fns-tz'

import { getActiveItineraries, getActiveItinerary } from '../util/state'
import { getFirstStopId } from '../util/itinerary'
import { getServiceStart, SERVICE_BREAK } from '../util/api'

import { routingQuery } from './api'
import { setQueryParam } from './form'
import { updateItineraryFilter } from './narrative'

const NINETY_SECONDS = 90000

function updateParamsAndPlan(params) {
  return function (dispatch) {
    dispatch(setQueryParam(params))
    dispatch(routingQuery())
  }
}

/**
 * Effectively checks whether #planFirst has already been clicked, i.e., the
 * query is planning a depart at the service break time.
 */
function isPlanningFirst(query) {
  const { departArrive, time } = query
  return departArrive === 'DEPART' && time === SERVICE_BREAK
}

function getActiveItineraryOrFirstFound(state) {
  const itineraries = getActiveItineraries(state)
  // (Use first entry from from itineraries if no active itinerary is selected.)
  return getActiveItinerary(state) || itineraries[0]
}

/**
 * Shifts the planning start/end date/time to the specified values.
 */
function shiftPlan(departArrive, zonedDate, time, itinerary) {
  return function (dispatch, getState) {
    const state = getState()
    const { api } = state.otp.config
    const params = {
      date: format(zonedDate, OTP_API_DATE_FORMAT),
      departArrive,
      time
    }
    if (!api?.v2) {
      if (!itinerary) {
        itinerary = getActiveItineraryOrFirstFound(state)
      }
      params.startTransitStopId = getFirstStopId(itinerary)
    }
    dispatch(updateParamsAndPlan(params))
  }
}

/**
 * Plan the first or last trip of the day, or if the first/last trip has already been planned,
 * plan the first/last trip of the previous/next day, respectively.
 */
function shiftDay(dayDirection, newSort) {
  return function (dispatch, getState) {
    const { config, currentQuery } = getState().otp
    const { homeTimezone: timeZone } = config
    const { date, time } = currentQuery

    let newDate = toDate(date, { timeZone })

    const isBackward = dayDirection === -1
    if (isBackward && isPlanningFirst(currentQuery)) {
      // Initially go to the beginning of the service day.
      // If already planning for the "first" trip, shift one full day back.
      newDate = subDays(newDate, 1)
    } else if (
      !isBackward &&
      !isBefore(
        toDate(`${date} ${time}`, { timeZone }),
        getServiceStart(date, timeZone)
      )
    ) {
      // If searching for the "last" trip, shift to the next calendar day
      // at the time when the next service day starts (e.g. 3 am),
      // unless the time is between midnight and the service break time.
      newDate = addDays(newDate, 1)
    }

    if (newSort) {
      dispatch(
        updateItineraryFilter({
          sort: newSort
        })
      )
    }
    dispatch(
      shiftPlan(isBackward ? 'DEPART' : 'ARRIVE', newDate, SERVICE_BREAK)
    )
  }
}

/**
 * Plan the previous/next trip, setting the arrive by/departure time to the current itinerary's
 * end time (minus/plus a small amount).
 */
function shiftTime(offset) {
  return function (dispatch, getState) {
    const state = getState()
    const { homeTimezone } = state.otp.config
    const itinerary = getActiveItineraryOrFirstFound(state)
    const isBackward = offset < 0
    // newEndTime is expressed in the configured homeTimezone.
    const newEndTime = utcToZonedTime(
      new Date((isBackward ? itinerary.startTime : itinerary.endTime) + offset),
      homeTimezone
    )

    dispatch(
      shiftPlan(
        isBackward ? 'ARRIVE' : 'DEPART',
        newEndTime,
        format(newEndTime, OTP_API_TIME_FORMAT),
        itinerary
      )
    )
  }
}

/**
 * Plan the first trip of the day, or if the first trip has already been planned,
 * plan the first trip of the previous day.
 */
export function planFirst() {
  return shiftDay(-1, { direction: 'ASC', type: 'DEPARTURETIME' })
}

/**
 * Plan the previous trip, setting the arrive by time to the current itinerary's
 * end time (minus a small amount).
 */
export function planPrevious() {
  return shiftTime(-NINETY_SECONDS)
}

/**
 * Plan the next trip, setting the depart at time to the current itinerary's
 * start time (plus a small amount).
 */
export function planNext() {
  return shiftTime(NINETY_SECONDS)
}

/**
 * Plan the last trip of the day, or if the last trip has already been planned,
 * plan the last trip of the next day.
 */
export function planLast() {
  return shiftDay(1, { direction: 'DESC', type: 'DEPARTURETIME' })
}
