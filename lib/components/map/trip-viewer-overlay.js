import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Polyline } from 'react-leaflet'

import polyline from '@mapbox/polyline'

class TripViewerOverlay extends MapLayer {
  static propTypes = {
    tripData: PropTypes.object,
    viewedTrip: PropTypes.object
  }

  componentDidMount () { }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }

  componentWillReceiveProps (nextProps) {
    const oldGeometry = this.props.tripData && this.props.tripData.geometry
    const newGeometry = nextProps.tripData && nextProps.tripData.geometry
    if (oldGeometry === newGeometry || !newGeometry) return
    const pts = polyline.decode(newGeometry.points)
    this.context.map.fitBounds(pts)
  }

  createLeafletElement () { }

  updateLeafletElement () { }

  render () {
    const { tripData } = this.props

    if (!tripData || !tripData.geometry) return <FeatureGroup />

    const pts = polyline.decode(tripData.geometry.points)
    return (
      <FeatureGroup>
        <Polyline positions={pts} weight={8} color='#00bfff' opacity={0.6} />
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedTrip = state.otp.ui.viewedTrip
  return {
    viewedTrip,
    tripData: viewedTrip
      ? state.otp.transitIndex.trips[viewedTrip.tripId]
      : null
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TripViewerOverlay)
