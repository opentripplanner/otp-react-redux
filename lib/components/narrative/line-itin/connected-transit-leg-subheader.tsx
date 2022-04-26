import { connect } from 'react-redux'
import { Leg } from '@opentripplanner/types'
import React, { Component } from 'react'
import TransitLegSubheader from '@opentripplanner/itinerary-body/lib/otp-react-redux/transit-leg-subheader'

import { setMainPanelContent, setViewedStop } from '../../../actions/ui'

interface Props {
  leg: Leg
  setMainPanelContent: (content: any) => void
  setViewedStop: (payload: { stopId: string }) => void
}

class ConnectedTransitLegSubheader extends Component<Props> {
  onClick = (payload: { stopId: string }) => {
    const { setMainPanelContent, setViewedStop } = this.props
    setMainPanelContent(null)
    setViewedStop(payload)
  }

  render() {
    const { leg } = this.props
    return <TransitLegSubheader leg={leg} onStopClick={this.onClick} />
  }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(null, mapDispatchToProps)(ConnectedTransitLegSubheader)
