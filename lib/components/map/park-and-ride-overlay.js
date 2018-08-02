import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import SetFromToButtons from './set-from-to'
import { setLocation } from '../../actions/map'
import { parkAndRideQuery } from '../../actions/api'

class ParkAndRideOverlay extends MapLayer {
  static propTypes = {
    locations: PropTypes.array,
    zipcarLocationsQuery: PropTypes.func,
    setLocation: PropTypes.func
  }

  componentDidMount () {
    this.props.parkAndRideQuery()
  }

  componentWillUnmount () {}

  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { locations } = this.props
    if (!locations || locations.length === 0) return <FeatureGroup />

    const markerIcon = divIcon({
      iconSize: [20, 20],
      popupAnchor: [0, -10],
      html: '<div style="width: 20px; height: 20px; background: #000; color: #fff; border-radius: 10px; font-weight: bold; font-size: 16px; padding-left: 4px; padding-top: 10px; line-height: 0px;">P</div>',
      className: ''
    })

    return (
      <FeatureGroup>
        {locations.map((location, k) => {
          const name = location.name.startsWith('P+R ') ? location.name.substring(4) : location.name
          return (
            <Marker
              icon={markerIcon}
              key={k}
              position={[location.y, location.x]}
            >
              <Popup>
                <div>
                  {/* Popup title */}
                  <div style={{ fontSize: 18, fontWeight: '500', marginBottom: 6 }}>
                    {name}
                  </div>

                  {/* Set as from/to toolbar */}
                  <SetFromToButtons
                    map={this.context.map}
                    location={{
                      lat: location.y,
                      lon: location.x,
                      name
                    }}
                    setLocation={this.props.setLocation}
                  />
                </div>
              </Popup>
            </Marker>
          )
        })}
      </FeatureGroup>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    locations: state.otp.overlay.parkAndRide && state.otp.overlay.parkAndRide.locations
  }
}

const mapDispatchToProps = {
  setLocation,
  parkAndRideQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(ParkAndRideOverlay)
