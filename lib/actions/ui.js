import { createAction } from 'redux-actions'
import { matchPath } from 'react-router'
import { push } from 'connected-react-router'
import coreUtils from '@opentripplanner/core-utils'

import {
  getConfigLocales,
  getDefaultLocale,
  getMatchingLocaleString,
  loadLocaleData
} from '../util/i18n'
import {
  getItineraryView,
  getMapToggleNewItineraryView,
  getPathFromParts,
  isDefinedAndNotEqual,
  ItineraryView
} from '../util/ui'
import { getModesForActiveAgencyFilter, getUiUrlParams } from '../util/state'

import {
  clearActiveSearch,
  clearLocation,
  parseUrlQueryString,
  setActiveSearch
} from './form'
import { createOrUpdateUser } from './user'
import { fetchNearbyFromStopId } from './apiV2'
import { findRouteIfNeeded, findRoutesIfNeeded, setUrlSearch } from './api'
import { MainPanelContent, MobileScreens } from './ui-constants'
import { setActiveItinerary } from './narrative'
import { setMapCenter } from './map'
import { setRouterId } from './config'

const updateLocale = createAction('UPDATE_LOCALE')

const setPanel = createAction('SET_MAIN_PANEL_CONTENT')
export const setMobileScreen = createAction('SET_MOBILE_SCREEN')
export const clearPanel = createAction('CLEAR_MAIN_PANEL')
const viewStop = createAction('SET_VIEWED_STOP')
export const viewNearby = createAction('SET_NEARBY_COORDS')
export const setHoveredStop = createAction('SET_HOVERED_STOP')
export const setHighlightedLocation = createAction('SET_HIGHLIGHTED_LOCATION')
const viewTrip = createAction('SET_VIEWED_TRIP')
const viewRoute = createAction('SET_VIEWED_ROUTE')
export const toggleAutoRefresh = createAction('TOGGLE_AUTO_REFRESH')
const settingItineraryView = createAction('SET_ITINERARY_VIEW')
export const setPopupContent = createAction('SET_POPUP_CONTENT')

// This code-less action calls the reducer code
// and thus resets the session timeout.
export const resetSessionTimeout = createAction('RESET_SESSION_TIMEOUT')

/**
 * Wrapper function for history#push (or, if specified, replace, etc.)
 * that preserves the current search or, if
 * replaceSearch is provided (including an empty string), replaces the search
 * when routing to a new URL path.
 * @param  {string} url path to route to
 * @param  {string} [replaceSearch] optional search string to replace current one
 * @param  {func}   [routingMethod] the connected-react-router method to execute (defaults to push).
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

export function setViewedRoute(payload) {
  return function (dispatch, getState) {
    const { otp } = getState()
    const { viewedRoute } = otp.ui
    if (
      viewedRoute &&
      payload?.routeId === viewedRoute.routeId &&
      (payload?.patternId === viewedRoute.patternId ||
        (!payload?.patternId && !viewedRoute.patternId))
    ) {
      return
    }

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

export function setViewedTrip(payload) {
  return function (dispatch, getState) {
    const { otp } = getState()
    const { viewedTrip } = otp.ui

    dispatch(viewTrip({ ...viewedTrip, ...payload }))

    if (payload?.tripId) {
      const path = getPathFromParts('trip', payload.tripId)
      dispatch(routeTo(path))
    }
  }
}

/**
 * Sets the main panel content according to the payload (one of the enum values
 * of MainPanelContent) and routes the application to the correct path.
 * @param {number|null} payload MainPanelContent value
 */
export function setMainPanelContent(payload) {
  return function (dispatch, getState) {
    const { otp, router } = getState()
    if (
      otp.ui.mainPanelContent === payload &&
      (payload || router.location.pathname === '/')
    ) {
      // Do nothing if the panel is already set (but do something if changing to main panel
      // and the router path is not at the root (/#/?ui_activeSearch=...).
      // This will guard against over-enthusiastic routing and overwriting current/nested states.
      console.warn(
        `Attempt to route from ${otp.ui.mainPanelContent} to ${payload}. Doing nothing`
      )
      return
    }
    dispatch(setPanel(payload))
    switch (payload) {
      case MainPanelContent.ROUTE_VIEWER:
        dispatch(routeTo('/route'))
        break
      case MainPanelContent.NEARBY_VIEW:
        dispatch(routeTo('/nearby'))
        dispatch(viewNearby(null))
        break
      case MainPanelContent.STOP_VIEWER:
        dispatch(routeTo('/stop'))
        break
      case MainPanelContent.TRIP_VIEWER:
      case MainPanelContent.PATTERN_VIEWER:
        break
      default:
        // Clear route, stop, and trip viewer focus and route to root
        dispatch(viewRoute(null))
        dispatch(viewStop(null))
        dispatch(viewTrip(null))
        if (router.location.pathname !== '/') dispatch(routeTo('/'))
        break
    }
  }
}

export function setViewedNearbyCoords(payload) {
  return function (dispatch, getState) {
    const { router } = getState()
    const { search } = router.location
    if (!payload) return
    dispatch(viewNearby(payload))
    const path = getPathFromParts(
      'nearby',
      [payload.lat, payload.lon].join(',')
    )
    const searchPath =
      search !== ''
        ? `${search}&entityId=${payload.gtfsId || payload.id}`
        : `?entityId=${payload.gtfsId || payload.id}`
    dispatch(
      routeTo(path, payload.gtfsId || payload.id ? searchPath : undefined)
    )
  }
}

// Stop/Route/Trip Viewer actions
export function setViewedStop(payload, viewer = 'nearby') {
  return function (dispatch, getState) {
    // payload.stopId may be undefined, which is ok as will be ignored by getPathFromParts
    // redirect to the nearby view if we want to view this stop in the nearby view
    if (payload) {
      if (viewer === 'nearby') {
        if (payload?.lat && payload?.lon) {
          dispatch(setViewedNearbyCoords(payload))
        } else {
          dispatch(fetchNearbyFromStopId(payload?.stopId))
        }
      } else {
        dispatch(viewStop(payload))
        const path = getPathFromParts('schedule', payload?.stopId)
        dispatch(routeTo(path))
      }
    }
  }
}

/**
 * Split the path id into its parts (according to specified delimiter). Parse
 * numbers if detected.
 */
function idToParams(id, delimiter = ',') {
  return id.split(delimiter).map((s) => (isNaN(s) ? s : Number(s)))
}

/**
 * Checks URL and redirects app to appropriate content (e.g., viewed
 * route or stop).
 */
export function matchContentToUrl(map, location) {
  // eslint-disable-next-line complexity
  return async function (dispatch, getState) {
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
    const [lat, lon] = root === 'nearby' && id ? idToParams(id) : []
    switch (root) {
      case 'route':
        dispatch(setViewedStop(null))
        if (id) {
          await dispatch(findRoutesIfNeeded())
          dispatch(findRouteIfNeeded({ routeId: id }))

          // Check for pattern "submatch"
          const subMatch = matchPath(location.pathname, {
            exact: true,
            path: `/${root}/:id/pattern/:patternId`,
            strict: false
          })
          const patternId = subMatch?.params?.patternId
          // patternId may be undefined, which is OK as the route will still be routed
          dispatch(setViewedRoute({ patternId, routeId: id }))
          dispatch(
            setMainPanelContent(
              patternId
                ? MainPanelContent.PATTERN_VIEWER
                : MainPanelContent.ROUTE_VIEWER
            )
          )
        } else {
          dispatch(setViewedRoute(null))
          dispatch(setMainPanelContent(MainPanelContent.ROUTE_VIEWER))
        }
        break
      case 'schedule':
        if (id) {
          dispatch(setViewedStop({ stopId: id }, 'stop'))
        } else {
          dispatch(setViewedStop(null))
          dispatch(setMainPanelContent(MainPanelContent.STOP_VIEWER))
        }
        break
      case 'stop':
        if (id) {
          // this will cause nearby view to look up the stop lat and lon
          dispatch(fetchNearbyFromStopId(id))
          dispatch(setMainPanelContent(MainPanelContent.NEARBY_VIEW))
        }
        break
      case 'nearby':
        if (lat && lon) {
          dispatch(setViewedNearbyCoords({ lat, lon }))
        } else {
          const { from, to } = getState().otp.currentQuery
          if (from) {
            dispatch(setViewedNearbyCoords(from))
          } else if (to) {
            dispatch(setViewedNearbyCoords(to))
          }

          dispatch(setMainPanelContent(MainPanelContent.NEARBY_VIEW))
        }
        break
      case 'trip':
        dispatch(setViewedStop(null))
        if (id) {
          dispatch(setViewedTrip({ tripId: id }))
          dispatch(setMainPanelContent(MainPanelContent.TRIP_VIEWER))
        } else {
          dispatch(setViewedTrip(null))
          dispatch(setMainPanelContent(null))
        }
        break
      case 'start':
      case '@': {
        // Parse comma separated params (ensuring numbers are parsed correctly).
        let [lat, lon, zoom, routerId] = id ? idToParams(id) : []
        if (!lat || !lon) {
          // Attempt to parse path if lat/lon not found. (Legacy UI otp.js used
          // slashes in the pathname to specify lat, lon, etc.)
          // prettier-ignore
          [, , lat, lon, zoom, routerId] = idToParams(location.pathname, '/')
        }
        console.log(lat, lon, zoom, routerId)
        // Update map location/zoom and optionally override router ID.
        if (+lat && +lon) dispatch(setMapCenter(map, { lat, lon }))
        // If router ID is provided, override the default routerId.
        if (routerId) dispatch(setRouterId(routerId))
        dispatch(setMainPanelContent(null))
        break
      }
      // For any other route path, just revert to default panel.
      default:
        dispatch(setMainPanelContent(null))
        break
    }
  }
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
      if (activeSearchId && activeSearchId !== previousSearchId) {
        dispatch(setActiveSearch(previousSearchId))
      } else if (
        isDefinedAndNotEqual(uiUrlParams.ui_activeItinerary, previousItinIndex)
      ) {
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

/**
 * Sets the itinerary view state (see values above) in the URL params
 * (currently only used in batch results).
 */
export function setItineraryView(value) {
  return function (dispatch, getState) {
    if (coreUtils.ui.isMobile()) {
      const urlParams = coreUtils.query.getUrlParams()

      // If the itinerary value is changed,
      // set the desired ui query param (even if LIST, so it replaces the current value)
      // and store the current view as previousItineraryView.
      if (value !== getItineraryView(urlParams)) {
        urlParams.ui_itineraryView = value

        dispatch(setUrlSearch(urlParams))
        dispatch(settingItineraryView(value))
      }
    } else {
      // Don't set/use the ui_itineraryView in desktop mode.
      dispatch(settingItineraryView(value))
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
    const itineraryView = getItineraryView(urlParams)

    const newView = getMapToggleNewItineraryView(itineraryView)
    dispatch(setItineraryView(newView))
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
    const { otp, user } = getState()
    const { config, ui } = otp
    const { loggedInUser } = user
    const { language: customMessages } = config
    const configLocales = getConfigLocales(customMessages)
    const matchedLocale = getMatchingLocaleString(
      locale || getDefaultLocale(config, loggedInUser),
      'en-US',
      configLocales
    )
    if (matchedLocale !== ui.locale) {
      const messages = await loadLocaleData(
        matchedLocale,
        customMessages,
        configLocales
      )

      // Update the redux state, only with a matched locale
      dispatch(updateLocale({ locale: matchedLocale, messages }))

      // Update the lang attribute in the root <html> element.
      // (The lang is the first portion of the locale.)
      const lang = matchedLocale.split('-')[0]
      document.documentElement.lang = lang

      window.localStorage.setItem('lang', matchedLocale)

      if (loggedInUser) {
        loggedInUser.preferredLocale = matchedLocale
        dispatch(createOrUpdateUser(loggedInUser))
      }
    }
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

/**
 * Start over by setting the initial URL and resetting (reloading) the page.
 * Note: This code is slightly different from the code behind the "Start Over" menu/button
 * in the sense that it preserves the initial URL with original query parameters.
 */
export function startOverFromInitialUrl() {
  return function (dispatch, getState) {
    const { initialUrl } = getState().otp
    window.location.href = initialUrl
  }
}
