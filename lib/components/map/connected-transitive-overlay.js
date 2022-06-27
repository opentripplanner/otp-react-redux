import { connect } from 'react-redux'
import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'

import { getTransitiveData } from '../../util/state'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}
  const { viewedRoute } = state.otp.ui

  // If the route viewer is active, do not show itinerary on map.
  // mainPanelContent is null whenever the trip planner is active.
  // Some views like the stop viewer can be accessed via the trip planner
  // or the route viewer, so include a route being viewed as a condition
  // for hiding
  if (state.otp.ui.mainPanelContent !== null && viewedRoute) {
    return {}
  }

  return {
    labeledModes,
    styles,
    transitiveData: getTransitiveData(state, ownProps)
  }
}

export default connect(mapStateToProps)(TransitiveCanvasOverlay)
