import React, { Component, PropTypes } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { switchLocations } from '../../actions/map'

class SwitchButton extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    switchLocations: PropTypes.func
  }

  static defaultProps = {
    content: 'Switch'
  }

  _onClick = () => {
    this.props.switchLocations()
  }

  render () {
    const { content } = this.props
    return (
      <Button className='switch-button'
        onClick={this._onClick || this.props.onClick}
      >{content}</Button>
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
