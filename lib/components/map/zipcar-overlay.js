import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import SetFromToButtons from './set-from-to'
import { setLocation } from '../../actions/map'
import { zipcarLocationsQuery } from '../../actions/zipcar'

class ZipcarOverlay extends MapLayer {
  static propTypes = {
    locations: PropTypes.array,
    zipcarLocationsQuery: PropTypes.func,
    setLocation: PropTypes.func
  }

  _startRefreshing () {
    // ititial station retrieval
    this.props.zipcarLocationsQuery()

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      this.props.zipcarLocationsQuery()
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?*/
  }

  _stopRefreshing () {
    if (this._refreshTimer) clearInterval(this._refreshTimer)
  }

  componentDidMount () {
    if (this.props.visible) this._startRefreshing()
  }

  componentWillUnmount () {
    this._stopRefreshing()
  }

  componentWillReceiveProps (nextProps) {
    if (!this.props.visible && nextProps.visible) {
      this._startRefreshing()
    } else if (this.props.visible && !nextProps.visible) {
      this._stopRefreshing()
    }
  }

  createLeafletElement () {}

  updateLeafletElement () {}

  render () {
    const { locations } = this.props
    if (!locations || locations.length === 0) return <FeatureGroup />


    const markerIcon = divIcon({
      iconSize: [24, 24],
      popupAnchor: [0, -12],
      html: `<i class='fa fa-car' style='font-size: 20px;' />`,
      className: ''
    })

    const bulletIconStyle = {
      color: 'gray',
      fontSize: 12,
      width: 15
    }

    return (
      <FeatureGroup>
        {locations.map((location) => {
          return (
            <Marker
              icon={markerIcon}
              key={location.location_id}
              position={[location.coordinates.lat, location.coordinates.lng]}
            >
              <Popup>
                <div>
                  {/* Popup title */}
                  <div style={{ fontSize: 18, fontWeight: '500', marginBottom: 6 }}>
                    Zipcar Location
                  </div>

                  {/* Location info bullet */}
                  <div style={{ marginBottom: 2 }}>
                    <i className='fa fa-map-marker' style={bulletIconStyle} /> {location.display_name}
                  </div>

                  {/* Vehicle-count bullet */}
                  <div style={{ marginBottom: 8 }}>
                    <i className='fa fa-car' style={bulletIconStyle} /> {location.num_vehicles} Vehicles
                  </div>

                  {/* Set as from/to toolbar */}
                  <SetFromToButtons
                    map={this.context.map}
                    location={{
                      lat: location.coordinates.lat,
                      lon: location.coordinates.lng,
                      name: location.display_name
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
    locations: state.otp.overlay.zipcar && state.otp.overlay.zipcar.locations
  }
}

const mapDispatchToProps = {
  setLocation,
  zipcarLocationsQuery
}

export default connect(mapStateToProps, mapDispatchToProps)(ZipcarOverlay)
