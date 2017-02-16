import { createAction } from 'redux-actions'

import { updateMapState } from './map'

export const settingActiveItinerary = createAction('SET_ACTIVE_ITINERARY')
export const settingActiveLeg = createAction('SET_ACTIVE_LEG')
export const settingActiveStep = createAction('SET_ACTIVE_STEP')

// TODO: handle setting bounds in actions...

export function setActiveItinerary (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveItinerary(payload))
    // const bounds = getItineraryBounds(payload.itinerary)
    // dispatch(updateMapState())
  }
}
export function setActiveLeg (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveLeg(payload))
    // dispatch(updateMapState())
  }
}
export function setActiveStep (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveStep(payload))
    dispatch(updateMapState())
  }
}
