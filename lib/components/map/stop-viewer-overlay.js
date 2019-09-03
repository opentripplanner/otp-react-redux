import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Popup, CircleMarker, withLeaflet } from 'react-leaflet'

class StopViewerOverlay extends MapLayer {
  static propTypes = {
    stopData: PropTypes.object,
    viewedStop: PropTypes.object
  }

  componentDidMount () { }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }

  /**
   * Only reset map view if a new stop is selected. This prevents resetting the
   * bounds if, for example, the arrival times have changed for the same stop
   * in the viewer.
   */
  componentDidUpdate (prevProps) {
    const nextStop = this.props.stopData
    const oldStopId = prevProps.stopData && prevProps.stopData.id
    const hasNewStopId = nextStop && nextStop.id !== oldStopId
    if (hasNewStopId) this.props.leaflet.map.setView([nextStop.lat, nextStop.lon])
  }

  createLeafletElement () { }

  updateLeafletElement () { }

  render () {
    const { viewedStop, stopData } = this.props

    if (!viewedStop || !stopData) return <FeatureGroup />

    return (
      <FeatureGroup>
        <CircleMarker
          key={stopData.id}
          center={[stopData.lat, stopData.lon]}
          radius={9}
          fillOpacity={1}
          fillColor='cyan'
          color='#000'
          weight={3}
        >
          <Popup>
            <div>
              {stopData.name}
            </div>
          </Popup>
        </CircleMarker>
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const viewedStop = state.otp.ui.viewedStop
  return {
    viewedStop: viewedStop,
    stopData: viewedStop
      ? state.otp.transitIndex.stops[viewedStop.stopId]
      : null
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(withLeaflet(StopViewerOverlay))
