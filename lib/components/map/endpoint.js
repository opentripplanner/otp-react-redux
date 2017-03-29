import React, {Component} from 'react'
import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { constructLocation } from '../../util/map'

export default class Endpoint extends Component {
  _onDragEnd = (e) => {
    const {type} = this.props
    const location = constructLocation(e.target.getLatLng())
    this.props.setLocation({type, location})
  }
  render () {
    const { type, location } = this.props
    const position = location && location.lat && location.lon ? [location.lat, location.lon] : null
    if (!position) return null
    const iconType = type === 'from' ? 'play' : 'stop'
    const icon = divIcon({
      html: `<span title="${location.name}" class="fa-stack endpoint-${type}-icon" style="opacity: 1.0">
              <i class="fa fa-circle fa-stack-2x" style="color: #ffffff"></i>
              <i class="fa fa-${iconType} fa-stack-1x" style="color: #000000"></i>
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
