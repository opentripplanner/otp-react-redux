import { connect } from 'react-redux'
import { Leg } from '@opentripplanner/types'
import React, { Component } from 'react'
import TransitLegSubheader from '@opentripplanner/itinerary-body/lib/otp-react-redux/transit-leg-subheader'

import { setMainPanelContent, setViewedStop } from '../../../actions/ui'

interface Props {
  leg: Leg
  setMainPanelContent: (content: number | null) => void
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

// @ts-expect-error TODO: type setMainPanelContent
export default connect(null, mapDispatchToProps)(ConnectedTransitLegSubheader)
