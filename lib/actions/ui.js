import { push } from 'connected-react-router'
import coreUtils from '@opentripplanner/core-utils'
import { createAction } from 'redux-actions'
import { matchPath } from 'react-router'

import { findRoute, setUrlSearch } from './api'
import { setMapCenter, setMapZoom, setRouterId } from './config'
import {
  clearActiveSearch,
  parseUrlQueryString,
  setActiveSearch
} from './form'
import { clearLocation } from './map'
import { setActiveItinerary } from './narrative'
import { getUiUrlParams } from '../util/state'

/**
 * Wrapper function for history#push (or, if specified, replace, etc.)
 * that preserves the current search or, if
 * replaceSearch is provided (including an empty string), replaces the search
 * when routing to a new URL path.
 * @param  {[type]} url           path to route to
 * @param  {string} replaceSearch optional search string to replace current one
 * @param  {func}   routingMethod the connected-react-router method to execute (defaults to push).
 */
export function routeTo (url, replaceSearch, routingMethod = push) {
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
    dispatch(routingMethod(path))
  }
}

/**
 * Checks URL and redirects app to appropriate content (e.g., viewed
 * route or stop).
 */
export function matchContentToUrl (location) {
  return function (dispatch, getState) {
    // This is a bit of a hack to make up for the fact that react-router does
    // not always provide the match params as expected.
    // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
    const root = location.pathname.split('/')[1]
    const match = matchPath(location.pathname, {
      path: `/${root}/:id`,
      exact: true,
      strict: false
    })
    const id = match && match.params && match.params.id
    switch (root) {
      case 'route':
        if (id) {
          dispatch(findRoute({ routeId: id }))
          dispatch(setViewedRoute({ routeId: id }))
        } else {
          dispatch(setViewedRoute(null))
          dispatch(setMainPanelContent(MainPanelContent.ROUTE_VIEWER))
        }
        break
      case 'stop':
        if (id) {
          dispatch(setViewedStop({ stopId: id }))
        } else {
          dispatch(setViewedStop(null))
          dispatch(setMainPanelContent(MainPanelContent.STOP_VIEWER))
        }
        break
      case 'start':
      case '@':
        // Parse comma separated params (ensuring numbers are parsed correctly).
        let [lat, lon, zoom, routerId] = id ? idToParams(id) : []
        if (!lat || !lon) {
          // Attempt to parse path if lat/lon not found. (Legacy UI otp.js used
          // slashes in the pathname to specify lat, lon, etc.)
          [,, lat, lon, zoom, routerId] = idToParams(location.pathname, '/')
        }
        console.log(lat, lon, zoom, routerId)
        // Update map location/zoom and optionally override router ID.
        if (+lat && +lon) dispatch(setMapCenter({ lat, lon }))
        if (+zoom) dispatch(setMapZoom({ zoom }))
        // If router ID is provided, override the default routerId.
        if (routerId) dispatch(setRouterId(routerId))
        dispatch(setMainPanelContent(null))
        break
      // For any other route path, just revert to default panel.
      default:
        dispatch(setMainPanelContent(null))
        break
    }
  }
}

/**
 * Split the path id into its parts (according to specified delimiter). Parse
 * numbers if detected.
 */
function idToParams (id, delimiter = ',') {
  return id.split(delimiter).map(s => isNaN(s) ? s : +s)
}

/**
 * Event listener for responsive webapp that handles a back button press and
 * sets the active search and itinerary according to the URL query params.
 */
export function handleBackButtonPress (e) {
  return function (dispatch, getState) {
    const otpState = getState().otp
    const { activeSearchId } = otpState
    const uiUrlParams = getUiUrlParams(otpState)
    // Get new search ID from URL after back button pressed.
    // console.log('back button pressed', e)
    const urlParams = coreUtils.query.getUrlParams()
    const previousSearchId = urlParams.ui_activeSearch
    const previousItinIndex = +urlParams.ui_activeItinerary || 0
    const previousSearch = otpState.searches[previousSearchId]
    if (previousSearch) {
      // If back button pressed and active search has changed, set search to
      // previous search ID.
      if (activeSearchId !== previousSearchId) {
        dispatch(setActiveSearch(previousSearchId))
      } else if (uiUrlParams.ui_activeItinerary !== previousItinIndex) {
        // Active itinerary index has changed.
        dispatch(setActiveItinerary({ index: previousItinIndex }))
      }
    } else {
      // The back button was pressed, but there was no corresponding search
      // found for the previous search ID. Derive search from URL params.
      if (!previousSearchId && activeSearchId) {
        // There is no search ID. Clear active search and from/to
        dispatch(clearActiveSearch())
        dispatch(clearLocation({ type: 'from' }))
        dispatch(clearLocation({ type: 'to' }))
      } else if (previousSearchId) {
        console.warn(`No search found in state history for search ID: ${previousSearchId}. Replanning...`)
        // Set query to the params found in the URL and perform routing query
        // for search ID.
        // Also, we don't want to update the URL here because that will funk with
        // the browser history.
        dispatch(parseUrlQueryString(urlParams))
      }
    }
  }
}

export const setMobileScreen = createAction('SET_MOBILE_SCREEN')

/**
 * Sets the main panel content according to the payload (one of the enum values
 * of MainPanelContent) and routes the application to the correct path.
 * @param {number} payload MainPanelContent value
 */
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

/**
 * Enum to describe the layout of the itinerary view
 * (currently only used in batch results).
 */
export const ItineraryView = {
  FULL: 'full',
  HIDDEN: 'hidden',
  SPLIT: 'split'
}
const DEFAULT_ITINERARY_VIEW = ItineraryView.SPLIT

/**
 * Sets the itinerary view state (see values above) in the URL params
 * (currently only used in batch results).
 */
export function setItineraryView (value) {
  return function (dispatch, getState) {
    const urlParams = coreUtils.query.getUrlParams()

    // If the itinerary value is changed,
    // set the desired ui query param, or remove it if same as default.
    if (value !== urlParams.ui_itineraryView) {
      if (value !== DEFAULT_ITINERARY_VIEW) {
        urlParams.ui_itineraryView = value
      } else if (urlParams.ui_itineraryView) {
        delete urlParams.ui_itineraryView
      }

      dispatch(setUrlSearch(urlParams))
    }
  }
}
