import coreUtils from '@opentripplanner/core-utils'

import { MainPanelContent } from '../actions/ui'
import { getActiveSearch } from './state'

// Set default title to the original document title (on load) set in index.html
const DEFAULT_TITLE = document.title

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
        title += ` | ${coreUtils.query.summarizeQuery(activeSearch.query, user.locations)}`
      }
      break
  }
  // if (printView) title += ' | Print'
  return title
}
