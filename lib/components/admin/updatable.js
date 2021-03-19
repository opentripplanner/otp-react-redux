import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

import { Val } from './styled'

export default class Updatable extends Component {
  _onClick = () => {
    const {fieldName, onUpdate, value} = this.props
    const newValue = window.prompt(
      `Please input new value for ${fieldName}:`,
      value
    )
    if (newValue !== null) onUpdate(newValue)
  }

  render () {
    const {fieldName, label, value} = this.props
    return (
      <>
        {label || fieldName}:{' '}
        <Val>{value}</Val>
        <Button bsSize='xsmall' bsStyle='link' onClick={this._onClick}>
          Update
        </Button>
      </>
    )
  }
}
