import debounce from 'lodash.debounce'
import { createAction } from 'redux-actions'

import { routingQuery } from './api'
import { queryIsValid } from '../util/state'

export const settingQueryParam = createAction('SET_QUERY_PARAM')
export const changingForm = createAction('FORM_CHANGED')

export function setQueryParam (payload) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload))
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
