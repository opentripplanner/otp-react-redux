import { connect } from 'react-redux'
import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'

// connect to the redux store

const mapStateToProps = (state) => {
  const { patternId, routeId } = state.otp.ui.viewedRoute || {}
  const { routes } = state.otp.transitIndex
  const routeData = routeId && routes ? routes[routeId] : {}
  const { patterns } = routeData

  const filteredPatterns =
    patternId && patterns
      ? {
          // If a pattern is selected, hide all other patterns
          [patternId]: patterns[patternId]
        }
      : patterns || []

  return {
    clipToPatternStops:
      state.otp.config.routeViewer?.hideRouteShapesWithinFlexZones,
    routeData: { ...routeData, patterns: filteredPatterns }
  }
}

export default connect(mapStateToProps)(RouteViewerOverlay)
