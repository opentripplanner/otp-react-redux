import ll from '@conveyal/lonlat'
import { latLngBounds } from 'leaflet'
import { createAction } from 'redux-actions'

import { updateMapState } from './map'
import { getItineraryBounds } from '../util/map'
import { getActiveItinerary, getActiveSearch } from '../util/state'

export const settingActiveItinerary = createAction('SET_ACTIVE_ITINERARY')
export const settingActiveLeg = createAction('SET_ACTIVE_LEG')
export const settingActiveStep = createAction('SET_ACTIVE_STEP')

export function setActiveItinerary (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveItinerary(payload))

    // Set map to itinerary bounds
    const itinerary = getActiveItinerary(getState().otp)
    const bounds = getItineraryBounds(itinerary)
    dispatch(updateMapState({bounds, focus: true}))
  }
}
export function setActiveLeg (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveLeg(payload))

    // Pan to to itinerary leg if made active
    const itinerary = getActiveItinerary(getState().otp)
    if (payload.index === null) {
      dispatch(updateMapState({bounds: getItineraryBounds(itinerary), focus: true}))
    } else {
      const leg = itinerary.legs[payload.index]
      const bounds = latLngBounds(leg.geojson.coordinates.map(coord => ll.toLeaflet(coord)))
      dispatch(updateMapState({bounds, focus: true}))
    }
  }
}
export function setActiveStep (payload) {
  return function (dispatch, getState) {
    dispatch(settingActiveStep(payload))

    // Pan to to itinerary step if made active
    const itinerary = getActiveItinerary(getState().otp)
    const activeSearch = getActiveSearch(getState().otp)
    const leg = itinerary.legs[activeSearch.activeLeg]
    if (payload.index === null) {
      const bounds = latLngBounds(leg.geojson.coordinates.map(coord => ll.toLeaflet(coord)))
      dispatch(updateMapState({bounds, focus: true}))
    } else {
      const step = leg.steps[payload.index]
      const PADDING = 0.005
      const bounds = latLngBounds([[step.lat + PADDING, step.lon - PADDING], [step.lat - PADDING, step.lon + PADDING]])
      dispatch(updateMapState({bounds, focus: true}))
    }
  }
}
