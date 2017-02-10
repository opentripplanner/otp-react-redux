import React, {Component, PropTypes} from 'react'
import { GeoJSON } from 'react-leaflet'
import polyline from '@mapbox/polyline'

import { isTransit } from '../../util/itinerary'

export default class ItineraryLegs extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }
  render () {
    const { itinerary, activeLeg, activeStep } = this.props
    return (
      <div>
        {itinerary.legs.map((leg, index) => {
          const geojson = polyline.toGeoJSON(leg.legGeometry.points)
          const active = activeLeg === index
          const color = active
            ? 'yellow'
            : isTransit(leg.mode)
            ? 'blue'
            : 'black'
          return (
            <GeoJSON
              key={Math.random()}
              color={color}
              data={geojson} />
          )
        })}
      </div>
    )
  }
}
