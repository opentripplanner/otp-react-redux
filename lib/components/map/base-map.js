import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'react-leaflet'

import { setLocation } from '../../actions/map'
import { constructLocation } from '../../util/map'

class BaseMap extends Component {

  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    setLocation: PropTypes.func // TODO: rename from action name to avoid namespace conflict?
  }
  _onClick = (e) => {
    const location = constructLocation(e.latlng)
    if (!this.props.isFromSet) this.props.setLocation('from', location)
    else if (!this.props.isToSet) this.props.setLocation('to', location)
  }
  render () {
    const {
      config,
      children
    } = this.props
    const position = [config.map.initLat, config.map.initLon]

    return (
      <Map
        className='map'
        center={position}
        zoom={config.map.initZoom || 13}
        onClick={this._onClick}
      >
        {children}
      </Map>
    )
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
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
