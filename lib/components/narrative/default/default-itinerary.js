import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import NarrativeItinerary from '../narrative-itinerary'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import ItinerarySummary from './itinerary-summary'
import { getTotalFareAsString } from '../../../util/state'

const { isBicycle, isTransit } = coreUtils.itinerary
const { formatDuration, formatTime } = coreUtils.time

// FIXME move to core utils
function getItineraryDescription (itinerary) {
  let primaryTransitDuration = 0
  let mainMode = 'Walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const {duration, mode, rentedBike} = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      primaryTransitDuration = duration
      transitMode = mode.toLowerCase()
    }
    if (isBicycle(mode)) mainMode = 'Bike'
    if (rentedBike) mainMode = 'Bikeshare'
    if (mode === 'CAR') mainMode = 'Drive'
  })
  let description = mainMode
  if (transitMode) description += ` to ${transitMode}`
  return description
}

const ITINERARY_ATTRIBUTES = [
  {
    alias: 'BEST',
    id: 'duration',
    render: (itinerary, options) => formatDuration(itinerary.duration)
  },
  {
    id: 'arrivalTime',
    render: (itinerary, options) => {
      if (options.isSelected) return formatTime(itinerary.endTime, options)
      return (
        <span>
          {formatTime(itinerary.startTime, options)}
          —
          {formatTime(itinerary.endTime, options)}
        </span>
      )
    }
  },
  {
    id: 'cost',
    render: (itinerary, options) => getTotalFareAsString(itinerary)
  },
  {
    id: 'walkTime',
    render: (itinerary, options) => `${formatDuration(itinerary.walkTime)} walk`
  }
]

export default class DefaultItinerary extends NarrativeItinerary {
  _onMouseOver = () => {
    const {index} = this.props
    // FIXME: Need to add focus call with ref?
    this.props.setVisibleItinerary({index})
  }

  _onMouseOut = () => {
    this.props.setVisibleItinerary({index: null})
  }

  _isSortingOnAttribute = (attribute) => {
    return attribute.id.toLowerCase() === this.props.sort.type.toLowerCase() ||
      attribute.alias === this.props.sort.type
  }

  render () {
    const {
      active,
      expanded,
      itinerary,
      LegIcon,
      sort,
      timeFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }
    return (
      <div
        className={`option default-itin${active ? ' active' : ''}${expanded ? ' expanded' : ''}`}
        role='presentation'
        // FIXME: Move style to css
        style={{
          borderLeft: active && !expanded ? '4px teal solid' : undefined,
          backgroundColor: expanded ? 'white' : undefined
        }}
        // TODO: Somehow set first itinerary as visible initially.
        // autoFocus={index === 0}
        onBlur={this._onMouseOut}
        onFocus={this._onMouseOver}
        onMouseOut={this._onMouseOut}
        onMouseOver={this._onMouseOver}
      >
        <button
          className='header'
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          <div
            className='title'>
            {getItineraryDescription(itinerary)}
          </div>
          <ul className='list-unstyled itinerary-attributes'>
            {ITINERARY_ATTRIBUTES
              .sort((a, b) => this._isSortingOnAttribute(a) ? -1 : 1)
              .map(attribute => {
                const isSelected = this._isSortingOnAttribute(attribute)
                const options = attribute.id === 'arrivalTime' ? timeOptions : {}
                if (isSelected) options.isSelected = true
                return (
                  <li key={attribute.id} className={`${attribute.id}${isSelected ? ' main' : ''}`}>
                    {attribute.render(itinerary, options)}
                  </li>
                )
              })
            }
          </ul>
          <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
          {(active && !expanded) &&
            <small style={{clear: 'both', textAlign: 'center', display: 'block', color: 'grey'}}>
              click to view details
            </small>
          }
        </button>
        {(active && expanded) &&
          <ItineraryBody itinerary={itinerary} LegIcon={LegIcon} />
        }
      </div>
    )
  }
}
