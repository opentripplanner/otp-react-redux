import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { TileLayer } from 'react-leaflet'

class RoutesOverlay extends Component {
  static propTypes = {
    tileUrl: PropTypes.string
  }

  render () {
    return this.props.tileUrl
      ? <TileLayer url={this.props.tileUrl} />
      : null
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  // TODO: pass in tileset via config
  return {
    tileUrl:
      state.otp.config.map &&
      state.otp.config.map.routesOverlay &&
      state.otp.config.map.routesOverlay.tileUrl
        ? state.otp.config.map.routesOverlay.tileUrl
        : null
  }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(RoutesOverlay)
