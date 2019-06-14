import { createAction } from 'redux-actions'
import { push } from 'connected-react-router'

export function routeTo (url, replaceSearch) {
  return function (dispatch, getState) {
    // Get search to preserve when routing to new path.
    const { router } = getState()
    const search = router ? router.location.search : window.location.search
    let path = url
    if (replaceSearch || replaceSearch === '') {
      path = `${path}${replaceSearch}`
    } else {
      path = `${path}${search}`
    }
    dispatch(push(path))
  }
}

export const setMobileScreen = createAction('SET_MOBILE_SCREEN')

export function setMainPanelContent (payload) {
  return function (dispatch, getState) {
    const { otp, router } = getState()
    if (otp.ui.mainPanelContent === payload) {
      console.warn(`Attempt to route from ${otp.ui.mainPanelContent} to ${payload}. Doing nothing`)
      // Do nothing if the panel is already set. This will guard against over
      // enthusiastic routing and overwriting current/nested states.
      return
    }
    dispatch(setPanel(payload))
    switch (payload) {
      case MainPanelContent.ROUTE_VIEWER:
        dispatch(routeTo('/route'))
        break
      case MainPanelContent.STOP_VIEWER:
        dispatch(routeTo('/stop'))
        break
      default:
        // Clear route, stop, and trip viewer focus and route to root
        dispatch(viewRoute(null))
        dispatch(viewStop(null))
        dispatch(setViewedTrip(null))
        if (router.location.pathname !== '/') dispatch(routeTo('/'))
        break
    }
  }
}

const setPanel = createAction('SET_MAIN_PANEL_CONTENT')
export const clearPanel = createAction('CLEAR_MAIN_PANEL')

// Stop/Route/Trip Viewer actions

export function setViewedStop (payload) {
  return function (dispatch, getState) {
    dispatch(viewStop(payload))
    const path = payload && payload.stopId
      ? `/stop/${payload.stopId}`
      : '/stop'
    dispatch(routeTo(path))
  }
}

const viewStop = createAction('SET_VIEWED_STOP')

export const setViewedTrip = createAction('SET_VIEWED_TRIP')

export function setViewedRoute (payload) {
  return function (dispatch, getState) {
    dispatch(viewRoute(payload))
    const path = payload && payload.routeId
      ? `/route/${payload.routeId}`
      : '/route'
    dispatch(routeTo(path))
  }
}

const viewRoute = createAction('SET_VIEWED_ROUTE')

export const toggleAutoRefresh = createAction('TOGGLE_AUTO_REFRESH')

// UI state enums

export const MainPanelContent = {
  ROUTE_VIEWER: 1,
  STOP_VIEWER: 2
}

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
