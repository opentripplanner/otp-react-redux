import { connect } from 'react-redux'
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

/** Used to avoid unnecessary rerenderings */
const cache: {
  id?: string | null
  routeData: any
} = {
  id: null,
  routeData: null
}

// connect to the redux store

const mapStateToProps = (state: any) => {
  const { patterns = {}, pending } = extractRoute(state)
  // If the state is not pending and filtered patterns contains at least one key,
  // cache the route data (based on route id and pattern id)
  // to avoid unnecessary rerendering/refitting of the map.
  // For simplicity, if the route or pattern id change, the previous cached route data are lost.
  // Assumption: we don't expect route shapes to change during a browsing session.
  let routeData
  const shouldCache = !pending && Object.keys(patterns).length !== 0
  if (shouldCache) {
    const { patternId, routeId } = state.otp.ui.viewedRoute || {}
    const id = `${routeId}-${patternId || ''}`
    if (id !== cache.id) {
      cache.id = id
      cache.routeData = getRouteData(state)
    }
    routeData = cache.routeData
  } else {
    routeData = getRouteData(state)
  }

  return {
    clipToPatternStops:
      state.otp.config.routeViewer?.hideRouteShapesWithinFlexZones,
    routeData
  }
}

export default connect(mapStateToProps)(RouteViewerOverlay)
