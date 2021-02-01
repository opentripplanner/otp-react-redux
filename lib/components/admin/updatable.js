import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

import { Val } from './styled'

export default class Updatable extends Component {
  // static defaultProps = {
  //   onUpdate: (val) => console.log(val)
  // }

  _onClick = () => {
    const {fieldName, onUpdate, value} = this.props
    const newValue = window.prompt(
      `Please input new value for ${fieldName}:`,
      value
    )
    if (newValue !== null) onUpdate(newValue)
  }

  render () {
    const {fieldName, value} = this.props
    return (
      <>
        {fieldName}:{' '}
        <Val>{value}</Val>
        <Button bsSize='xsmall' bsStyle='link' onClick={this._onClick}>
          Update
        </Button>
      </>
    )
  }
}
