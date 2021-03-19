import TransitLegSubheader from '@opentripplanner/itinerary-body/lib/otp-react-redux/transit-leg-subheader'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setMainPanelContent, setViewedStop } from '../../../actions/ui'

class ConnectedTransitLegSubheader extends Component {
  onClick = (payload) => {
    const { setMainPanelContent, setViewedStop } = this.props
    setMainPanelContent(null)
    setViewedStop(payload)
  }

  render () {
    const { languageConfig, leg } = this.props
    return (
      <TransitLegSubheader
        languageConfig={languageConfig}
        leg={leg}
        onStopClick={this.onClick}
      />
    )
  }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(null, mapDispatchToProps)(
  ConnectedTransitLegSubheader
)
