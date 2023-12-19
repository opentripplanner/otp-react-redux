import { connect } from 'react-redux'
import { Leg } from '@opentripplanner/types'
import React, { Component } from 'react'
import TransitLegSubheader from '@opentripplanner/itinerary-body/lib/otp-react-redux/transit-leg-subheader'

import { setMainPanelContent, setViewedStop } from '../../../actions/ui'
import { SetViewedStopHandler } from '../../util/types'

interface Props {
  leg: Leg
  setMainPanelContent: (content: number | null) => void
  setViewedStop: SetViewedStopHandler
}

class ConnectedTransitLegSubheader extends Component<Props> {
  onClick: SetViewedStopHandler = (payload) => {
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
