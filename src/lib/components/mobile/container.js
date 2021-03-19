import React, { Component } from 'react'

export default class MobileContainer extends Component {
  render () {
    return (
      <div className='otp mobile'>
        {this.props.children}
      </div>
    )
  }
}
