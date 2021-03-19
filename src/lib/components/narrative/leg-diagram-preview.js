import LegDiagramPreviewLayout from '@opentripplanner/itinerary-body/lib/AccessLegBody/leg-diagram-preview'
import { connect } from 'react-redux'

import { setLegDiagram } from '../../actions/map'

// Connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    diagramVisible: state.otp.ui.diagramLeg,
    showElevationProfile: Boolean(state.otp.config.elevationProfile)
  }
}

const mapDispatchToProps = {
  setLegDiagram
}

export default connect(mapStateToProps, mapDispatchToProps)(LegDiagramPreviewLayout)
