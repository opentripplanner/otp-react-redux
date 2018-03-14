import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Popup, CircleMarker } from 'react-leaflet'

class StopViewerOverlay extends MapLayer {
  static propTypes = {
    stopData: PropTypes.object,
    viewedStop: PropTypes.object
  }

  componentDidMount () { }

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount () { }

  componentWillReceiveProps (nextProps) {
    if (this.props.stopData === nextProps.stopData || !nextProps.stopData) return
    this.context.map.setView([nextProps.stopData.lat, nextProps.stopData.lon])
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

export default connect(mapStateToProps, mapDispatchToProps)(StopViewerOverlay)
