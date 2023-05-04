import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { setMainPanelContent, setViewedStop } from '../../actions/ui'
import InvisibleA11yLabel from '../util/invisible-a11y-label'

class ViewStopButton extends Component {
  static propTypes = {
    className: PropTypes.string,
    forStop: PropTypes.string,
    setViewedStop: PropTypes.func,
    stopId: PropTypes.string,
    text: PropTypes.element
  }

  _onClick = () => {
    this.props.setViewedStop({ stopId: this.props.stopId })
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

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewStopButton)
