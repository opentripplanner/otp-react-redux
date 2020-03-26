import { MainPanelContent } from '../actions/ui'
import { summarizeQuery } from './query'
import { getActiveSearch } from './state'

// Set default title to the original document title (on load) set in index.html
const DEFAULT_TITLE = document.title

export function isMobile () {
  // TODO: consider using 3rd-party library?
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Enables scrolling for a specified selector, while disabling scrolling for all
 * other targets. This is adapted from https://stackoverflow.com/a/41601290/915811
 * and intended to fix issues with iOS elastic scrolling, e.g.,
 * https://github.com/conveyal/trimet-mod-otp/issues/92.
 */
export function enableScrollForSelector (selector) {
  const _overlay = document.querySelector(selector)
  let _clientY = null // remember Y position on touch start

  _overlay.addEventListener('touchstart', function (event) {
    if (event.targetTouches.length === 1) {
      // detect single touch
      _clientY = event.targetTouches[0].clientY
    }
  }, false)

  _overlay.addEventListener('touchmove', function (event) {
    if (event.targetTouches.length === 1) {
      // detect single touch
      disableRubberBand(event)
    }
  }, false)

  function disableRubberBand (event) {
    const clientY = event.targetTouches[0].clientY - _clientY

    if (_overlay.scrollTop === 0 && clientY > 0) {
      // element is at the top of its scroll
      event.preventDefault()
    }

    if (isOverlayTotallyScrolled() && clientY < 0) {
      // element is at the top of its scroll
      event.preventDefault()
    }
  }

  function isOverlayTotallyScrolled () {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/scrollHeight#Problems_and_solutions
    return _overlay.scrollHeight - _overlay.scrollTop <= _overlay.clientHeight
  }
}

export function getTitle (state) {
  // Override title can optionally be provided in config.yml
  const { config, ui, user } = state.otp
  let title = config.title || DEFAULT_TITLE
  const { mainPanelContent, viewedRoute, viewedStop } = ui
  switch (mainPanelContent) {
    case MainPanelContent.ROUTE_VIEWER:
      title += ' | Route'
      if (viewedRoute && viewedRoute.routeId) title += ` ${viewedRoute.routeId}`
      break
    case MainPanelContent.STOP_VIEWER:
      title += ' | Stop'
      if (viewedStop && viewedStop.stopId) title += ` ${viewedStop.stopId}`
      break
    default:
      const activeSearch = getActiveSearch(state.otp)
      if (activeSearch) {
        title += ` | ${summarizeQuery(activeSearch.query, user.locations)}`
      }
      break
  }
  // if (printView) title += ' | Print'
  return title
}
