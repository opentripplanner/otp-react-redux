import { connect } from 'react-redux'
import StopsOverlay from '@opentripplanner/stops-overlay'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'

// connect to the redux store

const mapStateToProps = (state) => {
  const { mainPanelContent, viewedRoute } = state.otp.ui
  const { patternId, routeId } = viewedRoute || {}
  const { patterns, v2 } = state.otp.transitIndex.routes?.[routeId] || {}
  const visible = mainPanelContent !== uiActions.MainPanelContent.STOP_VIEWER

  let minZoom = 15
  let stops = []

  if (
    mainPanelContent === uiActions.MainPanelContent.ROUTE_VIEWER &&
    patterns
  ) {
    // Display stops for a pattern or all patterns for a route.
    let viewedPattern = patternId

    // If a flex route is being shown but the pattern viewer is not active, then the
    // stops of the first pattern of the route should be shown
    // This will ensure that the flex zone stops are shown.

    // Preferably, the flex stops would be rendered in a separate layer.
    // However, without changes to GraphQL, getting this data is very expensive
    if (!viewedPattern && v2) {
      viewedPattern = Object.keys(patterns)?.[0]
    }

    // Discard duplicates from pattern stops.
    stops = (patterns?.[viewedPattern]?.stops || []).reduce((prev, cur) => {
      if (!prev.find((stop) => stop.id === cur.id)) {
        prev.push(cur)
      }
      return prev
    }, [])
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
  refreshStops: apiActions.findStopsWithinBBox,
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)
