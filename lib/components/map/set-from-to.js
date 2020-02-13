import React, { Component } from 'react'

import FromToLocationPicker from '@opentripplanner/from-to-location-picker'


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
      <FromToLocationPicker onFromClick={this._setFromClicked} onToClick={this._setToClicked} />
    )
  }
}
