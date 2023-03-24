import { connect } from 'react-redux'
import memoize from 'lodash.memoize'
import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'

/**
 * Helper to compute the displayed route data.
 */
const getRouteData = (state) => {
  const { patternId, routeId } = state.otp.ui.viewedRoute || {}
  const { routes } = state.otp.transitIndex
  const routeData = routeId && routes ? routes[routeId] : {}
  // Discard the vehicles field. Vehicles are not needed for rendering the route shape,
  // and returning that field in mapStateToProps would cause unnecessary map bounds fitting,
  // especially when a user is zoomed in to an area.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { patterns, vehicles, ...otherRouteData } = routeData

  const filteredPatterns =
    patternId && patterns
      ? {
          // If a pattern is selected, hide all other patterns
          [patternId]: patterns[patternId]
        }
      : patterns || []

  return { ...otherRouteData, patterns: filteredPatterns }
}

/**
 * Memoize route data when the necessary info as been fetched,
 * to avoid unnecessary rerendering and map bounds fitting.
 */
const getMemoizedRouteData = memoize(
  getRouteData,
  // Determine the cache key, based on route and pattern ids.
  (state) => {
    const { patternId, routeId } = state.otp.ui.viewedRoute || {}
    return `${routeId}-${patternId || ''}`
  }
)

// connect to the redux store

const mapStateToProps = (state) => {
  const routeData = getRouteData(state)

  // If the state is not pending and filtered patterns contains at least one key,
  // memoize the route data (based on route id and pattern id)
  // to avoid unnecessary rerendering/refitting of the map.
  // (Memoizing has no purpose if the route or pattern info have not been fetched.)
  // Assumption: we don't expect route shapes to change during a browsing session.
  // (Refresh the browser to get updated route shapes.)
  const shouldMemoize =
    !routeData.pending && Object.keys(routeData.patterns).length !== 0

  return {
    clipToPatternStops:
      state.otp.config.routeViewer?.hideRouteShapesWithinFlexZones,
    routeData: shouldMemoize ? getMemoizedRouteData(state) : routeData
  }
}

export default connect(mapStateToProps)(RouteViewerOverlay)
