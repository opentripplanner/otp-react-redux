import React, { Component } from 'react'

import Icon from './icon'

export default class Loading extends Component {
  render () {
    const { small } = this.props
    return (
      <p
        className='text-center'
        style={{ marginTop: '15px' }}>
        <Icon
          className={`${small ? 'fa-3x' : 'fa-5x'} fa-spin`}
          type='refresh' />
      </p>
    )
  }
}
