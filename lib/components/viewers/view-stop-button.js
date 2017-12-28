import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setViewedStop } from '../../actions/ui'

class ViewStopButton extends Component {
  static propTypes = {
    stopId: PropTypes.string,
    text: PropTypes.string
  }

  _onClick = () => {
    this.props.setViewedStop({stopId: this.props.stopId})
  }

  render () {
    return (
      <Button
        bsSize='xsmall'
        className='view-stop-button'
        onClick={this._onClick}
      >{this.props.text || 'Stop Viewer'}</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = {
  setViewedStop
}

export default connect(mapStateToProps, mapDispatchToProps)(ViewStopButton)
