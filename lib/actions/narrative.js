import { createAction } from 'redux-actions'

import { setUrlSearch } from './api'
import { getUrlParams } from '../util/query'

export function setActiveItinerary (payload) {
  return function (dispatch, getState) {
    // Trigger change in store.
    dispatch(settingActiveitinerary(payload))
    // Update URL params.
    const urlParams = getUrlParams()
    urlParams.ui_activeItinerary = payload.index
    dispatch(setUrlSearch(urlParams))
  }
}
const settingActiveitinerary = createAction('SET_ACTIVE_ITINERARY')
export const setActiveLeg = createAction('SET_ACTIVE_LEG')
export const setActiveStep = createAction('SET_ACTIVE_STEP')
export const setUseRealtimeResponse = createAction('SET_USE_REALTIME_RESPONSE')
