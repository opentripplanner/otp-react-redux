import { connect } from 'react-redux'
import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'

import { MainPanelContent } from '../../actions/ui'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute

  const routeData =
    viewedRoute && state.otp.transitIndex.routes
      ? state.otp.transitIndex.routes[viewedRoute.routeId]
      : null
  let filteredPatterns = routeData?.patterns || []

  // If a pattern is selected, hide all other patterns
  if (viewedRoute?.patternId && routeData?.patterns) {
    filteredPatterns = {
      [viewedRoute.patternId]: routeData.patterns[viewedRoute.patternId]
    }
  }

  return {
    allowMapCentering:
      // TODO: allow panning of the map after initial click, but before pattern
      // viewer open
      state.otp.ui?.mainPanelContent === MainPanelContent.ROUTE_VIEWER,
    clipToPatternStops:
      state.otp.config?.routeViewer?.hideRouteShapesWithinFlexZones,
    routeData: { ...routeData, patterns: filteredPatterns }
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewerOverlay)
