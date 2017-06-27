import React, { Component } from 'react'
import { LayersControl, TileLayer } from 'react-leaflet'
import { connect } from 'react-redux'

class BaseLayers extends Component {
  render () {
    const { baseLayers, overlays } = this.props.config.map
    const { BaseLayer, Overlay } = LayersControl
    return (
      <LayersControl>
        {baseLayers && baseLayers.map((l, i) => (
          <BaseLayer
            name={l.name}
            checked={i === 0}
            key={i}>
            <TileLayer
              url={l.url}
              attribution={l.attribution}
              detectRetina />
          </BaseLayer>
        ))}
        {overlays && overlays.map((l, i) => (
          <Overlay
            name={l.name}
            key={i}>
            <TileLayer
              url={l.url}
              attribution={l.attribution}
              detectRetina />
          </Overlay>
        ))}
      </LayersControl>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config
  }
}

export default connect(mapStateToProps)(BaseLayers)
