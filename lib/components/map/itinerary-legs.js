import React, {Component, PropTypes} from 'react'
import { FeatureGroup, GeoJSON } from 'react-leaflet'

import { isTransit } from '../../util/itinerary'

export default class ItineraryLegs extends Component {
  static propTypes = {
    itinerary: PropTypes.object,
    activeLeg: PropTypes.number,
    setActiveLeg: PropTypes.func
  }
  _onLegClick = (e) => {
    const index = e.layer.feature.geometry.index
    const leg = this.props.itinerary.legs[index]
    if (index === this.props.activeLeg) {
      this.props.setActiveLeg(null)
    } else {
      this.props.setActiveLeg(index, leg)
    }
  }
  render () {
    const { itinerary, activeLeg } = this.props
    return (
      <FeatureGroup>
        {itinerary.legs.map((leg, index) => {
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
              onClick={this._onLegClick}
              data={leg.geojson} />
          )
        })}
      </FeatureGroup>
    )
  }
}
