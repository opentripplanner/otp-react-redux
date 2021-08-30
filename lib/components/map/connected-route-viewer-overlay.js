import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'
import { connect } from 'react-redux'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute

  const routeData =
    viewedRoute && state.otp.transitIndex.routes
      ? state.otp.transitIndex.routes[viewedRoute.routeId]
      : null
  let filteredPatterns = routeData?.patterns

  // If a pattern is selected, hide all other patterns
  if (viewedRoute?.patternId && routeData?.patterns) {
    filteredPatterns = {[viewedRoute.patternId]: routeData.patterns[viewedRoute.patternId]}
  }

  return {
    routeData: { ...routeData, patterns: filteredPatterns }
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(RouteViewerOverlay)
