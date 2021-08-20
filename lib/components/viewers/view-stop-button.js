import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import { setMainPanelContent, setViewedStop } from '../../actions/ui'

class ViewStopButton extends Component {
  static propTypes = {
    stopId: PropTypes.string,
    text: PropTypes.element
  }

  _onClick = () => {
    this.props.setMainPanelContent(null)
    this.props.setViewedStop({stopId: this.props.stopId})
  }

  render () {
    return (
      <Button
        bsSize='xsmall'
        className='view-stop-button'
        onClick={this._onClick}
      >
        {this.props.text || <FormattedMessage id='components.StopViewer.header' />}
      </Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return { }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewStopButton)
