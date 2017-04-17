import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { bikeRentalQuery } from '../../actions/api'

class BikeRentalOverlay extends Component {
  static propTypes = {
    stations: PropTypes.array,
    refreshStations: PropTypes.func
  }

  componentDidMount () {
    // ititial station retrieval
    this.props.refreshStations()

    // set up timer to refresh stations periodically
    this._refreshTimer = setInterval(() => {
      this.props.refreshStations()
    }, 30000) // defaults to every 30 sec. TODO: make this configurable?
  }

  componentWillUnmount () {
    clearInterval(this._refreshTimer)
  }

  render () {
    return (
      <div>
        {this.props.stations.map((station) => {
          const icon = station.isFloatingBike
            ? divIcon({
                html: `<i class="fa fa-bicycle fa-stack-2x" style="color: #000000"></i>`,
                className: ''
              })
            : divIcon({
                html: `<i class="fa fa-circle fa-stack-2x" style="color: #000000"></i>`,
                className: ''
              })
          return (
            <Marker
              icon={icon}
              position={[station.y, station.x]}
            >
              <Popup>
                {station.isFloatingBike
                  ? <span>
                      <b>Floating bike: {station.name}</b>
                    </span>
                  : <span>
                      <b>{station.name}</b><br />
                      Available bikes: {station.bikesAvailable}<br />
                      Available docks: {station.spacesAvailable}<br />
                    </span>
                }
              </Popup>
            </Marker>
          )
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    stations: state.otp.overlay.bikeRental.stations
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    refreshStations: () => { dispatch(bikeRentalQuery()) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BikeRentalOverlay)
