import lonlat from '@conveyal/lonlat'
import React, { Component, PropTypes } from 'react'
import { FormGroup } from 'react-bootstrap'
import { connect } from 'react-redux'
import Geocoder from 'react-select-geocoder'

import { setLocation, clearLocation } from '../../actions/map'

class LocationField extends Component {
  static propTypes = {
    location: PropTypes.object,
    label: PropTypes.string,
    setLocation: PropTypes.func,
    type: PropTypes.string // replace with locationType?
  }
  constructor (props) {
    super(props)
    this.state = {}
  }
  _onChange = (value, option) => {
    console.log(value, option)
    if (value && value.geometry) {
      const location = lonlat.fromCoordinates(value.geometry.coordinates)
      location.name = value.properties.label
      this.props.setLocation(this.props.type, location)
    } else if (value.feature) {
      // TODO: remove temp fix required for handling r-s-g geolocated option
      const location = lonlat.fromCoordinates(value.feature.geometry.coordinates)
      location.name = value.feature.properties.label
      this.props.setLocation(this.props.type, location)
    } else {
      this.props.clearLocation(this.props.type)
    }
  }
  _toValue = (location) => {
    return location && {
      value: `${location.lon},${location.lat}`,
      label: location.name
    }
  }
  render () {
    const { config, location } = this.props
    // TODO: add geolocation (in react-select-geocoder?)
    return (
      <form>
        <FormGroup>
          <Geocoder
            apiKey={config.geocoder.MAPZEN_KEY}
            boundary={config.geocoder.boundary}
            placeholder={this.props.label || this.props.type}
            focusPoint={[config.map.initLon, config.map.initLat]}
            value={this._toValue(location)}
            onChange={this._onChange}
            geolocate
            // optionRenderer={location === null ? (option) => <span><Icon type={option.icon} /> {option.label}</span> : undefined}
            />
        </FormGroup>
      </form>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    location: state.otp.currentQuery[ownProps.type]
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) },
    clearLocation: (type) => { dispatch(clearLocation({ type })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(LocationField)
