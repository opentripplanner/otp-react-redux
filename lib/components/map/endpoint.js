import React, {Component} from 'react'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { constructLocation } from '../../util/map'

export default class Endpoint extends Component {
  _onDragEnd = (e) => {
    console.log(e)
    const {setLocation, type} = this.props
    const location = constructLocation(e.target.getLatLng())
    setLocation({type, location, reverseGeocode: true})
  }

  render () {
    const { type, location } = this.props
    const position = location && location.lat && location.lon ? [location.lat, location.lon] : null
    if (!position) return null
    const iconType = type === 'from' ? 'star' : 'map-marker'
    const icon = divIcon({
      html: `<span title="${location.name}" class="fa-stack endpoint-${type}-icon" style="opacity: 1.0; margin-left: -10px; margin-top: -7px;">
              <i class="fa fa-${iconType} fa-stack-1x" style="color: #ffffff; font-size: 32px; width: 32px; height: 32px; padding-top: 1px"></i>
              <i class="fa fa-${iconType} fa-stack-1x" style="color: #000000; font-size: 24px; width: 32px; height: 32px;"></i>
            </span>`,
      className: ''
    })
    return (
      <Marker
        draggable
        icon={icon}
        position={position}
        onDragEnd={this._onDragEnd}
      />
    )
  }
}
