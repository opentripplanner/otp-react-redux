import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setMainPanelContent, setViewedStop } from '../../actions/ui'

class ViewStopButton extends Component {
  static propTypes = {
    childStop: PropTypes.bool,
    stopId: PropTypes.string,
    text: PropTypes.string
  }

  _onClick = () => {
    this.props.setMainPanelContent(null)
    this.props.setViewedStop({stopId: this.props.stopId})
  }

  render () {
    return (
      <Button
        bsSize='xsmall'
        className={this.props.childStop ? 'view-child-stop-button' : 'view-stop-button'}
        onClick={this._onClick}
      >{this.props.text || (this.props.languageConfig.stopViewer || 'Stop Viewer')}</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    languageConfig: state.otp.config.language
  }
}

const mapDispatchToProps = {
  setMainPanelContent,
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewStopButton)
