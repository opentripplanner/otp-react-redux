import StopViewerOverlay from '@opentripplanner/stop-viewer-overlay'
import DefaultStopMarker from '@opentripplanner/stop-viewer-overlay/lib/default-stop-marker'
import { connect } from 'react-redux'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedStop = state.otp.ui.viewedStop
  return {
    stopData: viewedStop
      ? state.otp.transitIndex.stops[viewedStop.stopId]
      : null,
    StopMarker: DefaultStopMarker
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(StopViewerOverlay)
