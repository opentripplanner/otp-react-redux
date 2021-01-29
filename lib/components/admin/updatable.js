import React, { Component } from 'react'
import { Button } from 'react-bootstrap'

import { Val } from './styled'

export default class Updatable extends Component {
  _onClick = () => {
    const {field, value} = this.props
    const newValue = window.prompt(`Please input new value for ${field}`, value)
    console.log(newValue)
    // FIXME: UPDATE request
  }

  render () {
    const {value} = this.props
    return (
      <>
        <Val>{value}</Val>
        <Button bsSize='xsmall' bsStyle='link' onClick={this._onClick}>
          Update
        </Button>
      </>
    )
  }
}
