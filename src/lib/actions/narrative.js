import coreUtils from '@opentripplanner/core-utils'
import { createAction } from 'redux-actions'

import { setUrlSearch } from './api'

export function setActiveItinerary (payload) {
  return function (dispatch, getState) {
    // Trigger change in store.
    dispatch(settingActiveitinerary(payload))
    // Update URL params.
    const urlParams = coreUtils.query.getUrlParams()
    urlParams.ui_activeItinerary = payload.index
    dispatch(setUrlSearch(urlParams))
  }
}
const settingActiveitinerary = createAction('SET_ACTIVE_ITINERARY')
export const setActiveLeg = createAction('SET_ACTIVE_LEG')
export const setActiveStep = createAction('SET_ACTIVE_STEP')
export const setUseRealtimeResponse = createAction('SET_USE_REALTIME_RESPONSE')
// Set itinerary visible on map. This is used for mouse over effects with
// itineraries in the list.
export const setVisibleItinerary = createAction('SET_VISIBLE_ITINERARY')
export const updateItineraryFilter = createAction('UPDATE_ITINERARY_FILTER')
