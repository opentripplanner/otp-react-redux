import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setMainPanelContent, setViewedTrip } from '../../actions/ui'

class ViewTripButton extends Component {
  static propTypes = {
    fromIndex: PropTypes.number,
    text: PropTypes.string,
    toIndex: PropTypes.number,
    tripId: PropTypes.string
  }

  _onClick = () => {
    this.props.setMainPanelContent(null)
    this.props.setViewedTrip({
      fromIndex: this.props.fromIndex,
      toIndex: this.props.toIndex,
      tripId: this.props.tripId
    })
  }

  render () {
    return (
      <Button
        bsSize='xsmall'
        className='view-trip-button'
        onClick={this._onClick}
      >{this.props.text || (this.props.languageConfig.tripViewer || 'Trip Viewer')}</Button>
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
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewTripButton)
