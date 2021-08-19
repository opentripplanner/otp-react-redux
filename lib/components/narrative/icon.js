import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'

// FIXME: Replace with <IconWithSpace> where applicable.
export default class Icon extends Component {
  static propTypes = {
    // type: PropTypes.string.required
  }
  render () {
    return (
      <FontAwesome
        fixedWidth
        name={this.props.type}
        {...this.props}
      />)
  }
}
