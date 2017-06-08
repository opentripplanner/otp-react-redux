import debounce from 'lodash.debounce'
import { createAction } from 'redux-actions'

import { planTrip, profileTrip } from './api'
import { queryIsValid } from '../util/state'

export const settingMode = createAction('SET_MODE')
export const settingDepart = createAction('SET_DEPART')
export const settingDate = createAction('SET_DATE')
export const settingTime = createAction('SET_TIME')
export const settingStartTime = createAction('SET_START_TIME')
export const settingEndTime = createAction('SET_END_TIME')
export const settingMaxWalkDistance = createAction('SET_MAX_WALK_DISTANCE')
export const settingPlanType = createAction('SET_PLAN_TYPE')
export const settingOptimize = createAction('SET_OPTIMIZE')

export const changingForm = createAction('FORM_CHANGED')

export function setMode (payload) {
  return function (dispatch, getState) {
    dispatch(settingMode(payload))
    dispatch(formChanged())
  }
}

export function setDepart (payload) {
  return function (dispatch, getState) {
    dispatch(settingDepart(payload))
    dispatch(formChanged())
  }
}

export function setDate (payload) {
  return function (dispatch, getState) {
    dispatch(settingDate(payload))
    dispatch(formChanged())
  }
}

export function setTime (payload) {
  return function (dispatch, getState) {
    dispatch(settingTime(payload))
    dispatch(formChanged())
  }
}

export function setStartTime (payload) {
  return function (dispatch, getState) {
    dispatch(settingStartTime(payload))
    dispatch(formChanged())
  }
}

export function setEndTime (payload) {
  return function (dispatch, getState) {
    dispatch(settingEndTime(payload))
    dispatch(formChanged())
  }
}

export function setPlanType (payload) {
  return function (dispatch, getState) {
    dispatch(settingPlanType(payload))
    dispatch(formChanged())
  }
}

export function setMaxWalkDistance (payload) {
  return function (dispatch, getState) {
    dispatch(settingMaxWalkDistance(payload))
    dispatch(formChanged())
  }
}

export function setOptimize (payload) {
  return function (dispatch, getState) {
    dispatch(settingOptimize(payload))
    dispatch(formChanged())
  }
}

let debouncedPlanTrip  // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs
let lastPlanType

export function formChanged () {
  return function (dispatch, getState) {
    dispatch(changingForm())
    const otpState = getState().otp
    const {autoPlan, debouncePlanTimeMs} = otpState.config
    const planType = otpState.currentQuery.type
    // check if a trip plan should be made
    if (autoPlan && queryIsValid(otpState)) {
      // trip plan should be made

      const queryFn = planType === 'ITINERARY' ? planTrip : profileTrip
      // check if debouncing function needs to be (re)created
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs || lastPlanType !== planType) {
        debouncedPlanTrip = debounce(() => dispatch(queryFn()), debouncePlanTimeMs)
        lastDebouncePlanTimeMs = debouncePlanTimeMs
      }
      debouncedPlanTrip()
      lastPlanType = planType
    }
  }
}
