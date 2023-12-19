import { connect } from 'react-redux'
import { Stop } from '@opentripplanner/types'
import StopsOverlay from '@opentripplanner/stops-overlay'

import * as apiActions from '../../actions/api'
import * as mapActions from '../../actions/map'
import * as uiActions from '../../actions/ui'
import { AppReduxState } from '../../util/state-types'
import { MainPanelContent } from '../../actions/ui-constants'

// connect to the redux store

const mapStateToProps = (state: AppReduxState) => {
  const { highlightedStop, mainPanelContent, viewedRoute } = state.otp.ui
  const { patternId, routeId } = viewedRoute || {}
  // FIXME: What type to use here? We don't have one that matches for Pattern.
  const { patterns, v2 }: { patterns: Record<string, any>; v2: boolean } =
    state.otp.transitIndex.routes?.[routeId] || {}

  let minZoom = 15
  let stops = []

  if (
    (mainPanelContent === MainPanelContent.ROUTE_VIEWER ||
      mainPanelContent === MainPanelContent.PATTERN_VIEWER) &&
    patterns
  ) {
    // Avoid duplicates.
    const stopsById: Record<string, Stop> = {}
    // Display stops for the selected pattern for a route.
    if (v2 && !patternId) {
      // If a flex route is being shown, show flex zones from all patterns
      // using the stops overlay, whether the pattern viewer is active or not.

      // Preferably, the flex zones would be rendered in a separate layer.
      // However, without changes to GraphQL, getting this data is very expensive
      Object.values(patterns).forEach((p) => {
        p?.stops
          ?.filter((s: Stop) => s.geometries?.geoJson?.type === 'Polygon')
          ?.forEach((s: Stop) => (stopsById[s.id] = s))
      })
    } else if (patternId) {
      patterns?.[patternId]?.stops?.forEach((s: Stop) => (stopsById[s.id] = s))
    }

    stops = Object.values(stopsById)

    // Override the minimum zoom so that the stops appear even if zoomed out
    minZoom = 2
  } else {
    // Display all stops if no route is shown.
    stops = state.otp.overlay.transit.stops
  }

  const highlightedStopColor = getComputedStyle(
    document.documentElement
  ).getPropertyValue('--main-base-color')

  return {
    highlightedStop,
    highlightedStopColor,
    minZoom,
    stops
  }
}

const mapDispatchToProps = {
  refreshStops: apiActions.findStopsWithinBBox,
  setLocation: mapActions.setLocation,
  setViewedStop: uiActions.setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)
