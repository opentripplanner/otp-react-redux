import DefaultStopMarker from '@opentripplanner/stops-overlay/lib/stop-marker'
import { connect } from 'react-redux'

import { setLocation } from '../../actions/map'
import { setViewedStop } from '../../actions/ui'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setLocation,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(DefaultStopMarker)
