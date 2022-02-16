/* eslint-disable no-case-declarations */
/* eslint-disable @typescript-eslint/no-use-before-define */
import { createAction } from 'redux-actions'
import { matchPath } from 'react-router'
import { push } from 'connected-react-router'
import coreUtils from '@opentripplanner/core-utils'

import { getDefaultLocale, loadLocaleData } from '../util/i18n'
import { getModesForActiveAgencyFilter, getUiUrlParams } from '../util/state'
import { getPathFromParts } from '../util/ui'

import { clearActiveSearch, parseUrlQueryString, setActiveSearch } from './form'
import { clearLocation } from './map'
import { findRoute, setUrlSearch } from './api'
import { setActiveItinerary } from './narrative'
import { setMapCenter, setMapZoom, setRouterId } from './config'

const updateLocale = createAction('UPDATE_LOCALE')

/**
 * Wrapper function for history#push (or, if specified, replace, etc.)
 * that preserves the current search or, if
 * replaceSearch is provided (including an empty string), replaces the search
 * when routing to a new URL path.
 * @param  {[type]} url           path to route to
 * @param  {string} replaceSearch optional search string to replace current one
 * @param  {func}   routingMethod the connected-react-router method to execute (defaults to push).
 */
export function routeTo(url, replaceSearch, routingMethod = push) {
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
export function matchContentToUrl(location) {
  // eslint-disable-next-line complexity
  return function (dispatch, getState) {
    // This is a bit of a hack to make up for the fact that react-router does
    // not always provide the match params as expected.
    // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
    const root = location.pathname.split('/')[1]
    const match = matchPath(location.pathname, {
      exact: false,
      path: `/${root}/:id`,
      strict: false
    })
    const id = match?.params?.id
    switch (root) {
      case 'route':
        if (id) {
          dispatch(findRoute({ routeId: id }))
          // Check for pattern "submatch"
          const subMatch = matchPath(location.pathname, {
            exact: true,
            path: `/${root}/:id/pattern/:patternId`,
            strict: false
          })
          const patternId = subMatch?.params?.patternId
          // patternId may be undefined, which is OK as the route will still be routed
          dispatch(setViewedRoute({ patternId, routeId: id }))
        } else {
          dispatch(setViewedRoute(null))
        }
        dispatch(setMainPanelContent(MainPanelContent.ROUTE_VIEWER))
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
          // eslint-disable-next-line prettier/prettier
          [, , lat, lon, zoom, routerId] = idToParams(location.pathname, '/')
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
function idToParams(id, delimiter = ',') {
  return id.split(delimiter).map((s) => (isNaN(s) ? s : +s))
}

/**
 * Event listener for responsive webapp that handles a back button press and
 * sets the active search and itinerary according to the URL query params.
 */
export function handleBackButtonPress(e) {
  return function (dispatch, getState) {
    const state = getState()
    const { activeSearchId } = state.otp
    const uiUrlParams = getUiUrlParams(state)
    // Get new search ID from URL after back button pressed.
    // console.log('back button pressed', e)
    const urlParams = coreUtils.query.getUrlParams()
    const previousSearchId = urlParams.ui_activeSearch
    const previousItinIndex = +urlParams.ui_activeItinerary || 0
    const previousSearch = state.otp.searches[previousSearchId]
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
        console.warn(
          `No search found in state history for search ID: ${previousSearchId}. Replanning...`
        )
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
export function setMainPanelContent(payload) {
  return function (dispatch, getState) {
    const { otp, router } = getState()
    if (otp.ui.mainPanelContent === payload) {
      console.warn(
        `Attempt to route from ${otp.ui.mainPanelContent} to ${payload}. Doing nothing`
      )
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

export function setViewedStop(payload) {
  return function (dispatch, getState) {
    dispatch(viewStop(payload))

    if (!payload?.stopId) return

    const path = getPathFromParts('stop', payload?.stopId)
    dispatch(routeTo(path))
  }
}

const viewStop = createAction('SET_VIEWED_STOP')

export const setHoveredStop = createAction('SET_HOVERED_STOP')

export const setViewedTrip = createAction('SET_VIEWED_TRIP')

export function setViewedRoute(payload) {
  return function (dispatch, getState) {
    dispatch(viewRoute(payload))

    const path = getPathFromParts(
      'route',
      payload?.routeId,
      // If a pattern is supplied, include pattern in path
      payload?.patternId && 'pattern',
      payload?.patternId
    )
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
  // eslint-disable-next-line sort-keys
  RESULTS_SUMMARY: 8,

  // eslint-disable-next-line sort-keys
  SEARCH_FORM: 3,

  // eslint-disable-next-line sort-keys
  SET_DATETIME: 7,

  SET_FROM_LOCATION: 4,

  // eslint-disable-next-line sort-keys
  SET_INITIAL_LOCATION: 2,

  // eslint-disable-next-line sort-keys
  SET_OPTIONS: 6,

  SET_TO_LOCATION: 5,

  WELCOME_SCREEN: 1
}

/**
 * Enum to describe the layout of the itinerary view
 * (currently only used in batch results).
 */
export const ItineraryView = {
  /** One itinerary is shown. (In mobile view, the map is hidden.) */
  FULL: 'full',
  /** One itinerary is shown, itinerary and map are focused on a leg. (The mobile view is split.) */
  LEG: 'leg',
  /** One itinerary leg is hidden. (In mobile view, the map is expanded.) */
  LEG_HIDDEN: 'leg-hidden',
  /** The list of itineraries is shown. (The mobile view is split.) */
  LIST: 'list',
  /** The list of itineraries is hidden. (In mobile view, the map is expanded.) */
  LIST_HIDDEN: 'list-hidden'
}

const setPreviousItineraryView = createAction('SET_PREVIOUS_ITINERARY_VIEW')

/**
 * Sets the itinerary view state (see values above) in the URL params
 * (currently only used in batch results).
 */
export function setItineraryView(value) {
  return function (dispatch, getState) {
    const urlParams = coreUtils.query.getUrlParams()
    const prevItineraryView = urlParams.ui_itineraryView || ItineraryView.LIST

    // If the itinerary value is changed,
    // set the desired ui query param, or remove it if same as default,
    // and store the current view as previousItineraryView.
    if (value !== urlParams.ui_itineraryView) {
      if (value !== ItineraryView.LIST) {
        urlParams.ui_itineraryView = value
      } else if (urlParams.ui_itineraryView) {
        delete urlParams.ui_itineraryView
      }

      dispatch(setUrlSearch(urlParams))
      dispatch(setPreviousItineraryView(prevItineraryView))
    }
  }
}

/**
 * Switch the mobile batch results view between full map view and the split state
 * (itinerary list or itinerary leg view) that was in place prior.
 */
export function toggleBatchResultsMap() {
  return function (dispatch, getState) {
    const urlParams = coreUtils.query.getUrlParams()
    const itineraryView = urlParams.ui_itineraryView || ItineraryView.LIST

    if (itineraryView === ItineraryView.LEG) {
      dispatch(setItineraryView(ItineraryView.LEG_HIDDEN))
    } else if (itineraryView === ItineraryView.LIST) {
      dispatch(setItineraryView(ItineraryView.LIST_HIDDEN))
    } else {
      const { previousItineraryView } = getState().otp.ui
      dispatch(setItineraryView(previousItineraryView))
    }
  }
}

/**
 * Takes the user back to the mobile search screen in mobile views.
 */
export function showMobileSearchScreen() {
  return function (dispatch, getState) {
    // Reset itinerary view state to show the list of results *before* clearing the search.
    // (Otherwise, if the map is expanded, the search is not cleared.)
    dispatch(setItineraryView(ItineraryView.LIST))
    dispatch(clearActiveSearch())
    dispatch(setMobileScreen(MobileScreens.SEARCH_FORM))
  }
}

/**
 * Sets the locale to the specified value and loads the corresponding messages.
 * If the specified locale is null, fall back to the defaultLocale
 * set in the configuration.
 * Also update the lang attribute on the root <html> element for accessibility.
 */
export function setLocale(locale) {
  return async function (dispatch, getState) {
    const { config } = getState().otp
    const { language: customMessages } = config
    const effectiveLocale = locale || getDefaultLocale(config)
    const messages = await loadLocaleData(effectiveLocale, customMessages)

    // Update the redux state
    dispatch(updateLocale({ locale: effectiveLocale, messages }))

    // Update the lang attribute in the root <html> element.
    // (The lang is the first portion of the locale.)
    const lang = effectiveLocale.split('-')[0]
    document.documentElement.lang = lang
  }
}

const updateRouteViewerFilter = createAction('UPDATE_ROUTE_VIEWER_FILTER')
/**
 * Updates the route viewer filter
 * @param {*} filter Object which includes either agency, mode, and/or search
 */
export function setRouteViewerFilter(filter) {
  return async function (dispatch, getState) {
    dispatch(updateRouteViewerFilter(filter))

    // If we're changing agency, and have a mode selected,
    // ensure that the mode filter doesn't select non-existent modes!
    const activeModeFilter = getState().otp.ui.routeViewer.filter.mode
    if (
      filter.agency &&
      activeModeFilter &&
      !getModesForActiveAgencyFilter(getState()).includes(
        activeModeFilter.toUpperCase()
      )
    ) {
      // If invalid mode is selected, reset mode
      dispatch(updateRouteViewerFilter({ mode: null }))
    }
  }
}
