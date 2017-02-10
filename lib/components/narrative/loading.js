import React, {Component} from 'react'
import {Icon} from '@conveyal/woonerf'

export default class Loading extends Component {
  render () {
    return (
      <p className='text-center'><Icon className='fa-5x fa-spin' type='refresh' /></p>
    )
  }
}
