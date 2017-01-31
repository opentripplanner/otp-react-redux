import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'react-leaflet'

import { setLocation } from '../../actions/map'

class BaseMap extends Component {

  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func
  }

  render () {
    const cfg = this.props.config
    const position = [cfg.map.initLat, cfg.map.initLon]

    return (
      <Map
        className='map'
        center={position}
        zoom={cfg.map.initZoom || 13}
        onClick={evt => {
          const location = constructLocation(evt)
          if (!this.props.isFromSet) this.props.setLocation('from', location)
          else if (!this.props.isToSet) this.props.setLocation('to', location)
        }}
      >
        {this.props.children}
      </Map>
    )
  }
}

function constructLocation (clickEvent) {
  return {
    name: `(${clickEvent.latlng.lat.toFixed(5)}, ${clickEvent.latlng.lng.toFixed(5)})`,
    lat: clickEvent.latlng.lat,
    lon: clickEvent.latlng.lng
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat && state.otp.currentQuery.from.lon,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat && state.otp.currentQuery.to.lon
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocation: (type, location) => {
      dispatch(setLocation({ type, location }))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
