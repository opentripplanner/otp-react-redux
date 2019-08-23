import { divIcon } from 'leaflet'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Marker } from 'react-leaflet'
// import polyline from '@mapbox/polyline'

// import { isTransit } from '../../util/itinerary'

export default class ItineraryStops extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }
  addItineraryStop (array, item) {
    if (item.stopId && array.indexOf(item.stopId) === -1) {
      array.push(item)
    }
  }
  render () {
    const { itinerary } = this.props
    const stops = []
    itinerary.legs.map(l => {
      this.addItineraryStop(stops, l.from)
      this.addItineraryStop(stops, l.to)
    })
    return (
      <div>
        {stops.map((stop, index) => {
          const icon = divIcon({
            html: `<span title="${stop.name}" class="fa-stack stop-icon" style="opacity: 1.0">
                    <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
                    <i class="fa fa-bus fa-stack-1x" style="color: #000000"></i>
                  </span>`,
            className: ''
          })
          return (
            <Marker
              icon={icon}
              position={[stop.lat, stop.lon]}
              key={index}
            />
          )
        })}
      </div>
    )
  }
}
