import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'
import { connect } from 'react-redux'

import { getTransitiveData } from '../../util/state'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const { labeledModes, styles } = state.otp.config.map.transitive || {}

  // If trip viewer is not active, do not show trip on map
  if (state.otp.ui.mainPanelContent !== null) {
    return {tripData: null}
  }

  return {
    labeledModes,
    styles,
    transitiveData: getTransitiveData(state, ownProps)
  }
}

export default connect(mapStateToProps)(TransitiveCanvasOverlay)
