import StopsOverlay from '@opentripplanner/stops-overlay'
import StopMarker from './connected-stop-marker'
import { connect } from 'react-redux'

import { findStopsWithinBBox } from '../../actions/api'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    stops: state.otp.overlay.transit.stops,
    symbols: [
      {
        minZoom: 15,
        symbol: StopMarker
      }
    ]
  }
}

const mapDispatchToProps = {
  refreshStops: findStopsWithinBBox
}

export default connect(mapStateToProps, mapDispatchToProps)(StopsOverlay)
