import { connect } from 'react-redux'
import { withLeaflet } from 'react-leaflet'
import TripViewerOverlay from '@opentripplanner/trip-viewer-overlay'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedTrip = state.otp.ui.viewedTrip
  return {
    tripData: viewedTrip
      ? state.otp.transitIndex.trips[viewedTrip.tripId]
      : null
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(TripViewerOverlay))
