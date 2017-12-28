import { createAction } from 'redux-actions'

export const setMobileScreen = createAction('SET_MOBILE_SCREEN')

export const setViewedStop = createAction('SET_VIEWED_STOP')

export const clearViewedStop = createAction('CLEAR_VIEWED_STOP')

export const setViewedTrip = createAction('SET_VIEWED_TRIP')

export const clearViewedTrip = createAction('CLEAR_VIEWED_TRIP')

export const MobileScreens = {
  WELCOME_SCREEN: 1,
  SET_INITIAL_LOCATION: 2,
  SEARCH_FORM: 3,
  SET_FROM_LOCATION: 4,
  SET_TO_LOCATION: 5,
  SET_OPTIONS: 6,
  SET_DATETIME: 7,
  RESULTS_SUMMARY: 8
}
