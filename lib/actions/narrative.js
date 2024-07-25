import { createAction } from 'redux-actions'
import coreUtils from '@opentripplanner/core-utils'

import { setUrlSearch } from './api'

const settingActiveitinerary = createAction('SET_ACTIVE_ITINERARY')

export function setActiveItinerary(payload) {
  return function (dispatch, getState) {
    // Trigger change in store.
    dispatch(settingActiveitinerary(payload))
    // Update URL params.
    const urlParams = coreUtils.query.getUrlParams()
    urlParams.ui_activeItinerary = payload.index
    if (payload.index === -1 || payload.index === '-1') {
      // Remove the ui_itineraryView param if changing to another itinerary.
      // Note: set to undefined instead of deleting so that it merges with the other search params.
      urlParams.ui_itineraryView = undefined
    }

    dispatch(setUrlSearch(urlParams))
  }
}

export const setActiveLeg = createAction('SET_ACTIVE_LEG')
export const setActiveStep = createAction('SET_ACTIVE_STEP')
// Set itinerary visible on map. This is used for mouse over effects with
// itineraries in the list.
export const setVisibleItinerary = createAction('SET_VISIBLE_ITINERARY')
export const updateItineraryFilter = createAction('UPDATE_ITINERARY_FILTER')
