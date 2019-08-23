import React, { Component } from 'react'
import ReactDOMServer from 'react-dom/server'

import { Button } from 'react-bootstrap'
import { Marker, Popup } from 'react-leaflet'
import { divIcon } from 'leaflet'

import Icon from '../narrative/icon'
import { constructLocation, matchLatLon } from '../../util/map'
import LocationIcon from '../icons/location-icon'

export default class Endpoint extends Component {
  _rememberAsHome = () => {
    const { rememberPlace } = this.props
    const location = Object.assign({}, this.props.location)
    location.id = 'home'
    location.icon = 'home'
    location.type = 'home'
    rememberPlace({ type: 'home', location })
  }

  _rememberAsWork = () => {
    const { rememberPlace } = this.props
    const location = Object.assign({}, this.props.location)
    location.id = 'work'
    location.icon = 'briefcase'
    location.type = 'work'
    rememberPlace({ type: 'work', location })
  }

  _forgetHome = () => this.props.forgetPlace('home')

  _forgetWork = () => this.props.forgetPlace('work')

  _clearLocation = () => {
    const { clearLocation, type } = this.props
    clearLocation({ type })
  }

  _swapLocation = () => {
    const { location, setLocation, type } = this.props
    this._clearLocation()
    const otherType = type === 'from' ? 'to' : 'from'
    setLocation({ type: otherType, location })
  }

  _onDragEnd = (e) => {
    const { setLocation, type } = this.props
    const location = constructLocation(e.target.getLatLng())
    setLocation({ type, location, reverseGeocode: true })
  }

  render () {
    const { type, location, locations, showPopup } = this.props
    const position = location && location.lat && location.lon ? [location.lat, location.lon] : null
    if (!position) return null
    const fgStyle = { fontSize: 24, width: 32, height: 32 }
    const bgStyle = { fontSize: 32, width: 32, height: 32, paddingTop: 1 }
    const match = locations.find(l => matchLatLon(l, location))
    const isWork = match && match.type === 'work'
    const isHome = match && match.type === 'home'
    const iconHtml = ReactDOMServer.renderToStaticMarkup(
      <span title={location.name} className={`fa-stack endpoint-${type}-icon`} style={{ opacity: 1.0, marginLeft: -10, marginTop: -7 }}>
        {type === 'from'
          // From icon should have white circle background
          ? <i
            className='fa-stack-1x fa fa-circle'
            style={{ color: '#fff', ...fgStyle }} />
          : <span>
            <LocationIcon
              type={type}
              className='fa-stack-1x'
              style={{ color: '#333', ...bgStyle }} />
            <i
              className='fa-stack-1x fa fa-circle'
              style={{ color: '#fff', ...bgStyle, fontSize: 12, marginTop: -4 }} />
          </span>
        }
        <LocationIcon type={type} className='fa-stack-1x' style={fgStyle} />
      </span>
    )
    const otherType = type === 'from' ? 'to' : 'from'
    const icon = isWork
      ? 'briefcase'
      : isHome
        ? 'home'
        : 'map-marker'
    return (
      <Marker
        draggable
        icon={divIcon({ html: iconHtml, className: '' })}
        position={position}
        onDragEnd={this._onDragEnd}>
        {showPopup &&
          <Popup>
            <div>
              <strong>
                <Icon type={icon} /> {location.name}
              </strong>
              <div>
                <Button
                  variant='link'
                  bsSize='small'
                  disabled={isWork}
                  style={{ padding: 0 }}
                  onClick={isHome ? this._forgetHome : this._rememberAsHome}>
                  {isHome
                    ? <span><Icon type='times' /> Forget home</span>
                    : <span><Icon type='home' /> Save as home</span>
                  }
                </Button>
              </div>
              <div>
                <Button
                  variant='link'
                  bsSize='small'
                  disabled={isHome}
                  style={{ padding: 0 }}
                  onClick={isWork ? this._forgetWork : this._rememberAsWork}>
                  {isWork
                    ? <span><Icon type='times' /> Forget work</span>
                    : <span><Icon type='briefcase' /> Save as work</span>
                  }
                </Button>
              </div>
              <div>
                <Button
                  variant='link'
                  bsSize='small'
                  style={{ padding: 0 }}
                  onClick={this._clearLocation}>
                  <Icon type='times' /> Remove as {type} location
                </Button>
              </div>
              <div>
                <Button
                  variant='link'
                  bsSize='small'
                  style={{ padding: 0 }}
                  onClick={this._swapLocation}>
                  <Icon type='refresh' /> Change to {otherType} location
                </Button>
              </div>
            </div>
          </Popup>
        }
      </Marker>
    )
  }
}
