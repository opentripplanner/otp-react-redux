import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'
import { connect } from 'react-redux'

import { getTransitiveData } from '../../util/state'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}
  const { viewedRoute } = state.otp.ui

  // If trip viewer is not active, do not show trip on map
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
