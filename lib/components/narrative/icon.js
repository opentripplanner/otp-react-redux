import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'

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
