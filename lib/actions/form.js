import debounce from 'lodash.debounce'
import { createAction } from 'redux-actions'

import { planTrip, profileTrip } from './api'
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
