import debounce from 'lodash.debounce'
import { createAction } from 'redux-actions'

import { planTrip } from './api'
import { queryIsValid } from '../util/state'

export const settingMode = createAction('SET_MODE')
export const settingDepart = createAction('SET_DEPART')
export const settingDate = createAction('SET_DATE')
export const settingTime = createAction('SET_TIME')
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

let debouncedPlanTrip  // store as variable here, so it can be reused.
let lastDebouncePlanTimeMs

export function formChanged () {
  return function (dispatch, getState) {
    dispatch(changingForm())
    const otpState = getState().otp
    const {autoPlan, debouncePlanTimeMs} = otpState.config
    if (autoPlan && queryIsValid(otpState)) {
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = debounce(() => dispatch(planTrip()), debouncePlanTimeMs)
        lastDebouncePlanTimeMs = debouncePlanTimeMs
      }
      debouncedPlanTrip()
    }
  }
}
