import React, { Component } from 'react'
import { ButtonGroup, Button } from 'react-bootstrap'

export default class SetFromToButtons extends Component {

  _setLocation = (type) => {
    this.props.setLocation({
      type,
      location: this.props.location,
      reverseGeocode: false
    })
    this.props.map.closePopup()
  }

  _setFromClicked = () => { this._setLocation('from') }

  _setToClicked = () => { this._setLocation('to') }

  render () {
    return (
      <div style={{ display: 'inline-block' }}>
        <span>Set as: </span>
        <Button bsSize='xsmall' className='set-from-button'
          onClick={this._setFromClicked}
        >
          <i className='fa fa-star' /> Start
        </Button>
        <Button bsSize='xsmall' className='set-to-button'
          onClick={this._setToClicked}
        >
          <i className='fa fa-map-marker' /> End
        </Button>
      </div>
    )
  }
}
