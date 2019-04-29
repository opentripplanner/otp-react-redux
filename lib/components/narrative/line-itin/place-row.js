import React, { Component } from 'react'

import LocationIcon from '../../icons/location-icon'
import ViewStopButton from '../../viewers/view-stop-button'
import { getLegMode, getPlaceName } from '../../../util/itinerary'
import { formatTime } from '../../../util/time'

import TransitLegBody from './transit-leg-body'
import AccessLegBody from './access-leg-body'

// TODO: make this a prop
const defaultRouteColor = '#008'

export default class PlaceRow extends Component {

  _createLegLine (leg) {
    switch (leg.mode) {
      case 'WALK': return <div className='leg-line leg-line-walk' />
      case 'BICYCLE':
      case 'BICYCLE_RENT':
        return <div className='leg-line leg-line-bicycle' />
      case 'CAR': return <div className='leg-line leg-line-car' />
      default:
        return <div className='leg-line leg-line-transit' style={{
          backgroundColor: leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
        }} />
    }
  }

  render () {
    const { customIcons, leg, legIndex, place, time, timeOptions, followsTransit } = this.props

    const stackIcon = (name, color, size) => <i className={`fa fa-${name} fa-stack-1x`} style={{ color, fontSize: size + 'px' }} />

    let icon
    if (!leg) { // This is the itinerary destination
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='to' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else if (legIndex === 0) { // The is the origin
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 26)}
          <LocationIcon type='from' className='fa-stack-1x' style={{ fontSize: 20 }} />
        </span>
      )
    } else { // This is an intermediate place
      icon = (
        <span className='fa-stack place-icon-group'>
          {stackIcon('circle', 'white', 22)}
          {stackIcon('circle-o', 'black', 22)}
        </span>
      )
    }

    const interline = leg && leg.interlineWithPreviousLeg

    return (
      <div className='place-row' key={this.rowKey++}>
        <div className='time'>
          {time && formatTime(time, timeOptions)}
        </div>
        <div className='line-container'>
          {leg && this._createLegLine(leg) }
          <div>{!interline && icon}</div>
        </div>
        <div className='place-details'>
          {/* Dot separating interlined segments, if applicable */}
          {interline && <div className='interline-dot'>&bull;</div>}

          {/* The place name */}
          <div className='place-name'>
            {interline
              ? <div className='interline-name'>Stay on Board at <b>{place.name}</b></div>
              : <div>{getPlaceName(place)}</div>
            }
          </div>

          {/* Place subheading: Transit stop */}
          {place.stopId && !interline && (
            <div className='place-subheader'>
              <span>Stop ID {place.stopId.split(':')[1]}</span>
              <ViewStopButton stopId={place.stopId} />
            </div>
          )}

          {/* Place subheading: rented bike pickup */}
          {leg && leg.rentedBike && (
            <div className='place-subheader'>
              Pick up shared bike
            </div>
          )}

          {/* Place subheading: rented car pickup */}
          {leg && leg.rentedCar && (
            <div className='place-subheader'>
              Pick up {leg.from.networks ? leg.from.networks.join('/') : 'rented car'} {leg.from.name}
            </div>
          )}

          {/* Show the leg, if present */}
          {leg && (
            leg.transitLeg
              ? (/* This is a transit leg */
                <TransitLegBody
                  leg={leg}
                  legIndex={legIndex}
                  setActiveLeg={this.props.setActiveLeg}
                  customIcons={customIcons}
                />
              )
              : (/* This is an access (e.g. walk/bike/etc.) leg */
                <AccessLegBody
                  leg={leg}
                  legIndex={legIndex}
                  legMode={getLegMode(this.props.companies, leg).legMode}
                  routingType={this.props.routingType}
                  setActiveLeg={this.props.setActiveLeg}
                  timeOptions={timeOptions}
                  followsTransit={followsTransit}
                  customIcons={customIcons}
                />
              )
          )}
        </div>
      </div>
    )
  }
}
