import React, { Component } from 'react'
import ReactDOMServer from 'react-dom/server'

import { Button } from 'react-bootstrap'
import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import { constructLocation } from '../../util/map'
import LocationIcon from '../icons/location-icon'

export default class Endpoint extends Component {
  _rememberAsHome = () => {
    const { rememberPlace } = this.props
    const location = Object.assign({}, this.props.location)
    location.id = 'home'
    location.name = `Home (${location.name})`
    location.icon = 'home'
    location.forgettable = true
    location.type = 'home'
    rememberPlace({ type: 'home', location })
  }

  _rememberAsWork = () => {
    const { rememberPlace } = this.props
    const location = Object.assign({}, this.props.location)
    location.id = 'work'
    location.name = `Work (${location.name})`
    location.icon = 'briefcase'
    location.forgettable = true
    location.type = 'work'
    rememberPlace({ type: 'work', location })
  }

  _onDragEnd = (e) => {
    const { setLocation, type } = this.props
    const location = constructLocation(e.target.getLatLng())
    setLocation({ type, location, reverseGeocode: true })
  }

  render () {
    const { type, location } = this.props
    const position = location && location.lat && location.lon ? [location.lat, location.lon] : null
    if (!position) return null
    const fgStyle = { fontSize: 24, width: 32, height: 32 }
    const bgStyle = { fontSize: 32, width: 32, height: 32, paddingTop: 1 }
    const iconHtml = ReactDOMServer.renderToStaticMarkup(
      <span title={location.name} className={`fa-stack endpoint-${type}-icon`} style={{ opacity: 1.0, marginLeft: -10, marginTop: -7 }}>
        {type === 'from'
          // From icon should have white circle background
          ? <i className='fa-stack-1x fa fa-circle' style={{color: '#fff', ...fgStyle}} />
          : <span>
            <LocationIcon type={type} className='fa-stack-1x' style={{color: '#333', ...bgStyle}} />
            <i className='fa-stack-1x fa fa-circle' style={{color: '#fff', ...bgStyle, fontSize: 12, marginTop: -4}} />
          </span>
        }
        <LocationIcon type={type} className='fa-stack-1x' style={fgStyle} />
      </span>
    )

    return (
      <Marker
        draggable
        icon={divIcon({ html: iconHtml, className: '' })}
        position={position}
        onDragEnd={this._onDragEnd}>
        <Popup>
          <div>
            <Button onClick={this._rememberAsHome}>Set as home</Button>
            <Button onClick={this._rememberAsWork}>Set as work</Button>
          </div>
        </Popup>
      </Marker>
    )
  }
}
