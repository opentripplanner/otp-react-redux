import React, { Component } from 'react'
import Icon from './icon'

export default class Loading extends Component {
  render () {
    const { small } = this.props
    return (
      <p
        style={{ marginTop: '15px' }}
        className='text-center'>
        <Icon
          className={`${small ? 'fa-3x' : 'fa-5x'} fa-spin`}
          type='refresh' />
      </p>
    )
  }
}
