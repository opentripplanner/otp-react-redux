import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import { Stop } from '@opentripplanner/types'
import React, { Component, ReactElement } from 'react'

import { setMainPanelContent, setViewedStop } from '../../actions/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

type Props = {
  className: string
  forStop: string
  setViewedStop: (stop: Stop) => void
  stop: Stop
  text: ReactElement
}

class ViewStopButton extends Component<Props> {
  _onClick = () => {
    this.props.setViewedStop(this.props.stop)
  }

  render() {
    return (
      <Button
        bsSize="xsmall"
        className={this.props.className || 'view-stop-button'}
        onClick={this._onClick}
        role="link"
      >
        {this.props.text || (
          <FormattedMessage id="components.StopViewer.header" />
        )}
        {this.props.forStop && (
          <InvisibleA11yLabel>
            {' '}
            <FormattedMessage
              id="components.StopViewer.forStop"
              values={{ stopName: this.props.forStop }}
            />
          </InvisibleA11yLabel>
        )}
      </Button>
    )
  }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(null, mapDispatchToProps)(ViewStopButton)
