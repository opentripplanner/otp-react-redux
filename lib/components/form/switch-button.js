import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { switchLocations } from '../../actions/map'

class SwitchButton extends Component {
  static propTypes = {
    onClick: PropTypes.func
  }
  _onClick = () => {
    this.props.switchLocations()
  }
  render () {
    return (
      <Button
        onClick={this._onClick || this.props.onClick}
        >Switch</Button>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {}
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    switchLocations: () => { dispatch(switchLocations()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(SwitchButton)
