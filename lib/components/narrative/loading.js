import React, {Component} from 'react'
import Icon from './icon'

export default class Loading extends Component {
  render () {
    return (
      <p style={this.props.style} className='text-center'>
        <Icon className='fa-5x fa-spin' type='refresh' />
      </p>
    )
  }
}
