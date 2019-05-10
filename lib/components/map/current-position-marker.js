import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, CircleMarker } from 'react-leaflet'

/* A small circular marker showing the user's current position. Intended
 * primarily for use in mobile mode.
 */

class CurrentPositionMarker extends MapLayer {
  static propTypes = {
    currentPosition: PropTypes.object
  }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }
  componentDidMount () { }

  createLeafletElement () {
  }

  updateLeafletElement () {
  }

  render () {
    const { currentPosition } = this.props

    if (!currentPosition || !currentPosition.coords) return <FeatureGroup />

    return (
      <FeatureGroup>
        <CircleMarker
          center={[currentPosition.coords.latitude, currentPosition.coords.longitude]}
          radius={3}
          fillOpacity={0.5}
          fillColor='#f44'
          color='#f00'
          weight={1}
        />
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    currentPosition: state.otp.location.currentPosition
  }
}

export default connect(mapStateToProps)(CurrentPositionMarker)
