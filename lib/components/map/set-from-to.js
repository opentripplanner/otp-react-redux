import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import LocationIcon from '../icons/location-icon'

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
        <span><b>Plan a trip: </b></span>
        <Button bsSize='xsmall' className='set-from-button'
          onClick={this._setFromClicked}
        >
          <LocationIcon type='from' /> From here
        </Button>
        <Button bsSize='xsmall' className='set-to-button'
          onClick={this._setToClicked}
        >
          <LocationIcon type='to' /> To here
        </Button>
      </div>
    )
  }
}
