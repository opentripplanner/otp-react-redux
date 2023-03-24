import { connect } from 'react-redux'
import memoize from 'lodash.memoize'
import RouteViewerOverlay from '@opentripplanner/route-viewer-overlay'

/**
 * Helper function to extract the desired route object from the state.
 */
const extractRoute = (state: any) => {
  const { routeId } = state.otp.ui.viewedRoute || {}
  const { routes } = state.otp.transitIndex
  return routeId && routes ? routes[routeId] : {}
}

/**
 * Helper to compute the displayed route data.
 */
const getRouteData = (state: any) => {
  const { patternId } = state.otp.ui.viewedRoute || {}
  // Discard the vehicles field. Vehicles are not needed for rendering the route shape,
  // and returning that field in mapStateToProps would cause unnecessary map bounds fitting,
  // especially when a user is zoomed in to an area.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { patterns, vehicles, ...otherRouteData } = extractRoute(state)

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

const mapStateToProps = (state: any) => {
  const { patterns = {}, pending } = extractRoute(state)
  // If the state is not pending and filtered patterns contains at least one key,
  // memoize the route data (based on route id and pattern id)
  // to avoid unnecessary rerendering/refitting of the map.
  // (Memoizing has no purpose if the route or pattern info have not been fetched.)
  // Assumption: we don't expect route shapes to change during a browsing session.
  const shouldMemoize = !pending && Object.keys(patterns).length !== 0
  return {
    clipToPatternStops:
      state.otp.config.routeViewer?.hideRouteShapesWithinFlexZones,
    routeData: shouldMemoize ? getMemoizedRouteData(state) : getRouteData(state)
  }
}

export default connect(mapStateToProps)(RouteViewerOverlay)
