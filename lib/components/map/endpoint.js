import React, {Component} from 'react'
import ReactDOMServer from 'react-dom/server'

import { Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { constructLocation } from '../../util/map'
import LocationIcon from '../icons/location-icon'


export default class Endpoint extends Component {
  _onDragEnd = (e) => {
    const {setLocation, type} = this.props
    const location = constructLocation(e.target.getLatLng())
    setLocation({type, location, reverseGeocode: true})
  }

  render () {
    const { type, location } = this.props
    const position = location && location.lat && location.lon ? [location.lat, location.lon] : null
    if (!position) return null

    const iconHtml = ReactDOMServer.renderToStaticMarkup(
      <span title={location.name} className={`fa-stack endpoint-${type}-icon`} style={{ opacity: 1.0, marginLeft: -10, marginTop: -7 }}>
        <LocationIcon type={type} className='fa-stack-1x' style={{ color: '#fff', fontSize: 32, width: 32, height: 32, paddingTop: 1 }} />
        <LocationIcon type={type} className='fa-stack-1x' style={{ fontSize: 24, width: 32, height: 32 }} />
      </span>
    )

    return (
      <Marker
        draggable
        icon={divIcon({ html: iconHtml, className: '' })}
        position={position}
        onDragEnd={this._onDragEnd}
      />
    )
  }
}
