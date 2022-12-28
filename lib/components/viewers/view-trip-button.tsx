import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component } from 'react'

import {
  MainPanelContent,
  setMainPanelContent,
  setViewedTrip
} from '../../actions/ui'

type Props = {
  fromIndex: number
  setMainPanelContent: (panel: number | null) => void
  setViewedTrip({
    fromIndex,
    toIndex,
    tripId
  }: {
    fromIndex: number
    toIndex: number
    tripId: string
  }): void
  text: JSX.Element
  toIndex: number
  tripId: string
}

class ViewTripButton extends Component<Props> {
  _onClick = () => {
    this.props.setMainPanelContent(MainPanelContent.TRIP_VIEWER)
    this.props.setViewedTrip({
      fromIndex: this.props.fromIndex,
      toIndex: this.props.toIndex,
      tripId: this.props.tripId
    })
  }

  render() {
    return (
      <Button
        bsSize="xsmall"
        className="view-trip-button"
        onClick={this._onClick}
      >
        {this.props.text || (
          <FormattedMessage id="components.TripViewer.header" />
        )}
      </Button>
    )
  }
}

const mapStateToProps = () => {
  return {}
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedTrip
}

// @ts-expect-error setMainPanelContent not typescripted yet
export default connect(mapStateToProps, mapDispatchToProps)(ViewTripButton)
