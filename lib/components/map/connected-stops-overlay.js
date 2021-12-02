import { connect } from 'react-redux'
import StopsOverlay from '@opentripplanner/stops-overlay'

import { findStopsWithinBBox } from '../../actions/api'

import StopMarker from './connected-stop-marker'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { viewedRoute } = state.otp.ui
  const { routes } = state.otp.transitIndex

  let { stops } = state.otp.overlay.transit
  let minZoom = 15

  // There are a number of cases when stops within route objects should be shown
  // although there are no stops from the stops index active
  if (routes) {
    // All cases of stops being force-shown only apply when a route is being actively viewed
    const route = routes?.[viewedRoute?.routeId]
    if (route?.patterns) {
      // If the pattern viewer is active, stops along that pattern should be shown
      let viewedPattern = viewedRoute?.patternId
      // If a flex route is being shown but the pattern viewer is not active, then the
      // stops of the first pattern of the route should be shown
      // This will ensure that the flex zone stops are shown.
      // TODO: if the time to show flex stops changes, this is where that change
      // should be made.
      if (!viewedPattern && route.v2) {
        viewedPattern = Object.keys(route?.patterns)?.[0]
      }

      // Override the stop index so that only relevant stops are shown
      stops = route.patterns?.[viewedPattern]?.stops
      // Override the minimum zoom so that the stops appear even if zoomed out
      minZoom = 2
    }
  }

  return {
    stops: stops || [],
    symbols: [
      {
        minZoom,
        symbol: StopMarker
      }
    ]
  }
}

const mapDispatchToProps = {
  refreshStops: findStopsWithinBBox
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)
