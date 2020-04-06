import TriMetModeIcon from '@opentripplanner/icons/lib/trimet-mode-icon'
import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { calculateFares, calculatePhysicalActivity, isTransit } from '../../../util/itinerary'
import { formatDuration, formatTime } from '../../../util/time'

// TODO: make this a prop
const defaultRouteColor = '#008'

export default class ItinerarySummary extends Component {
  static propTypes = {
    itinerary: PropTypes.object
  }

  getIcon = (iconId, customIcons) => {
    // Check if there is a custom icon
    if (customIcons && iconId in customIcons) {
      return customIcons[iconId]
    }

    // Custom icon not available for the given iconId. Use the ModeIcon component
    // to show the icon based on the iconId, but always use the default car icon
    // for any car-based modes that didn't have custom icon
    if (iconId && iconId.startsWith('CAR')) iconId = 'CAR'
    return <TriMetModeIcon label={iconId} />
  }

  _onSummaryClicked = () => {
    if (typeof this.props.onClick === 'function') this.props.onClick()
  }

  render () {
    const { customIcons, itinerary, timeOptions } = this.props
    const {
      centsToString,
      maxTNCFare,
      minTNCFare,
      transitFare
    } = calculateFares(itinerary)
    // TODO: support non-USD
    const minTotalFare = minTNCFare * 100 + transitFare
    const maxTotalFare = maxTNCFare * 100 + transitFare

    const { caloriesBurned } = calculatePhysicalActivity(itinerary)

    return (
      <div className='itin-summary' onClick={this._onSummaryClicked}>
        <div className='details'>
          {/* Travel time in hrs/mins */}
          <div className='header'>{formatDuration(itinerary.duration)}</div>

          {/* Duration as time range */}
          <div className='detail'>
            {formatTime(itinerary.startTime, timeOptions)} - {formatTime(itinerary.endTime, timeOptions)}
          </div>

          {/* Fare / Calories */}
          <div className='detail'>
            {minTotalFare > 0 && <span>
              {centsToString(minTotalFare)}
              {minTotalFare !== maxTotalFare && <span> - {centsToString(maxTotalFare)}</span>}
              <span> &bull; </span>
            </span>}
            {Math.round(caloriesBurned)} Cals
          </div>

          {/* Number of transfers, if applicable */}
          {itinerary.transfers > 0 && (
            <div className='detail'>
              {itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
            </div>
          )}

        </div>
        <div className='routes'>
          {itinerary.legs.filter(leg => {
            return !(leg.mode === 'WALK' && itinerary.transitTime > 0)
          }).map((leg, k) => {
            return <div className='route-preview' key={k}>
              <div className='mode-icon'>{this.getIcon(leg.mode, customIcons)}</div>
              {isTransit(leg.mode)
                ? (
                  <div className='short-name' style={{ backgroundColor: getRouteColorForBadge(leg) }}>
                    {getRouteNameForBadge(leg)}
                  </div>
                )
                : (<div style={{ height: 30, overflow: 'hidden' }} />)
              }
            </div>
          })}
        </div>
      </div>
    )
  }
}

// Helper functions

function getRouteLongName (leg) {
  return leg.routes && leg.routes.length > 0
    ? leg.routes[0].longName
    : leg.routeLongName
}

function getRouteNameForBadge (leg) {
  const shortName = leg.routes && leg.routes.length > 0
    ? leg.routes[0].shortName : leg.routeShortName

  const longName = getRouteLongName(leg)

  // check for max
  if (longName && longName.toLowerCase().startsWith('max')) return null

  // check for streetcar
  if (longName && longName.startsWith('Portland Streetcar')) return longName.split('-')[1].trim().split(' ')[0]

  return shortName || longName
}

function getRouteColorForBadge (leg) {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
}
