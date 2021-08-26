import StopsOverlay from '@opentripplanner/stops-overlay'
import { connect } from 'react-redux'

import { findStopsWithinBBox } from '../../actions/api'

import StopMarker from './connected-stop-marker'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedRoute = state.otp.ui.viewedRoute

  let { stops } = state.otp.overlay.transit
  let minZoom = 15

  // If a pattern is being shown, show only the pattern's stops and show them large
  if (viewedRoute?.patternId) {
    stops = state.otp.transitIndex.routes[viewedRoute.routeId].patterns[viewedRoute.patternId].stops
    minZoom = 2
  }

  return {
    stops,
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
