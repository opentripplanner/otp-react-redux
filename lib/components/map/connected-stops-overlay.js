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

    // Preferably, the flex zones would be rendered in a separate layer.
    // However, without changes to GraphQL, getting this data is very expensive
    if (v2) {
      // If a flex route is being shown, show flex zones from all patterns
      // using the stops overlay, whether the pattern viewer is active or not.
      Object.values(patterns).forEach((p) => {
        stops = stops.concat(
          p?.stops?.filter((s) => s.geometries?.geoJson?.type === 'Polygon')
        )
      })
    }

    // Discard duplicates from pattern stops and flex zones.
    stops = stops
      .concat(patterns?.[patternId]?.stops || [])
      .reduce((prev, cur) => {
        if (!prev.find((stop) => stop.id === cur.id)) {
          prev.push(cur)
        }
        return prev
      }, [])

    // Override the minimum zoom so that the stops appear even if zoomed out
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
