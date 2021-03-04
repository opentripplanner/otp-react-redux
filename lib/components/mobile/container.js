import React, { Component } from 'react'

export default class MobileContainer extends Component {
  render () {
    const { children, className } = this.props
    return (
      <div className={`otp mobile${className ? ` ${className}` : ''}`}>
        {children}
      </div>
    )
  }
}
