import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { TileLayer } from 'react-leaflet'

class RoutesOverlay extends Component {
  static propTypes = {
  }

  render () {
    return (
      <TileLayer
        url='https://d2dyq00q2cz8yt.cloudfront.net/{z}_{x}_{y}@2x.png'
      />
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  // TODO: pass in tileset via config
  return { }
}

const mapDispatchToProps = { }

export default connect(mapStateToProps, mapDispatchToProps)(RoutesOverlay)
