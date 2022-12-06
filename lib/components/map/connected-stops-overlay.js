import { connect } from 'react-redux'
import StopsOverlay from '@opentripplanner/stops-overlay'

import { findStopsWithinBBox } from '../../actions/api'
import { MainPanelContent, setViewedStop } from '../../actions/ui'
import { setLocation } from '../../actions/map'

// connect to the redux store

const mapStateToProps = (state) => {
  const { mainPanelContent, viewedRoute } = state.otp.ui
  const { routes } = state.otp.transitIndex
  const route = routes?.[viewedRoute?.routeId]
  const visible = mainPanelContent !== MainPanelContent.STOP_VIEWER

  let minZoom = 15
  let stops = []

  if (
    mainPanelContent === MainPanelContent.ROUTE_VIEWER &&
    viewedRoute?.routeId &&
    route?.patterns
  ) {
    // Display stops for a pattern or all patterns for a route.
    let viewedPattern = viewedRoute?.patternId

    // If a flex route is being shown but the pattern viewer is not active, then the
    // stops of the first pattern of the route should be shown
    // This will ensure that the flex zone stops are shown.

    // Preferably, the flex stops would be rendered in a separate layer.
    // However, without changes to GraphQL, getting this data is very expensive
    if (!viewedPattern && route.v2) {
      viewedPattern = Object.keys(route?.patterns)?.[0]
    }

    // Discard duplicates from pattern stops.
    stops = (route.patterns?.[viewedPattern]?.stops || []).reduce(
      (prev, cur) => {
        if (!prev.find((stop) => stop.id === cur.id)) {
          prev.push(cur)
        }
        return prev
      },
      []
    )
    minZoom = 2
  } else if (visible) {
    // Display all stops if no route is shown.
    stops = state.otp.overlay.transit.stops
  }

  return {
    minZoom,
    stops,
    visible
  }
}

const mapDispatchToProps = {
  refreshStops: findStopsWithinBBox,
  setLocation,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)
