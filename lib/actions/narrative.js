import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'

import { setUrlSearch } from './api'

const settingActiveitinerary = createAction('SET_ACTIVE_ITINERARY')
// TODO: in future, this should also set URL params. However, this is due to be refactored soon anyway
export const setActiveItineraryTime = createAction('SET_ACTIVE_ITINERARY_TIME')

export function setActiveItinerary(payload) {
  return function (dispatch, getState) {
    // Trigger change in store.
    dispatch(settingActiveitinerary(payload))
    // Update URL params.
    const urlParams = coreUtils.query.getUrlParams()
    urlParams.ui_activeItinerary = payload.index
    dispatch(setUrlSearch(urlParams))

    // If the itinerary is reset, do not select any time
    if (payload?.index === -1) dispatch(setActiveItineraryTime(null))
  }
}

export const setActiveLeg = createAction('SET_ACTIVE_LEG')
export const setActiveStep = createAction('SET_ACTIVE_STEP')
// Set itinerary visible on map. This is used for mouse over effects with
// itineraries in the list.
export const setVisibleItinerary = createAction('SET_VISIBLE_ITINERARY')
export const updateItineraryFilter = createAction('UPDATE_ITINERARY_FILTER')
