import React, { Component } from 'react'

export default class MobileContainer extends Component {
  render () {
    const { className, style } = this.props
    return (
      <div className={`otp mobile${className ? ` ${className}` : ''}`} style={style}>
        {this.props.children}
      </div>
    )
  }
}
