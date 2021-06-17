import coreUtils from '@opentripplanner/core-utils'
import React from 'react'

import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import NarrativeItinerary from '../narrative-itinerary'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'
import { getTotalFareAsString } from '../../../util/state'

import ItinerarySummary from './itinerary-summary'

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
      // TODO: convert OTP's TRAM mode to the correct wording for Portland
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
    alias: 'best',
    id: 'duration',
    order: 0,
    render: (itinerary, options) => formatDuration(itinerary.duration)
  },
  {
    alias: 'departureTime',
    id: 'arrivalTime',
    order: 1,
    render: (itinerary, options) => {
      if (options.isSelected) {
        if (options.selection === 'ARRIVALTIME') return formatTime(itinerary.endTime, options)
        else return formatTime(itinerary.startTime, options)
      }
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
    order: 2,
    render: (itinerary, options) => getTotalFareAsString(itinerary)
  },
  {
    id: 'walkTime',
    order: 3,
    render: (itinerary, options) => {
      const leg = itinerary.legs[0]
      const {LegIcon} = options
      return (
        // FIXME: For CAR mode, walk time considers driving time.
        <span>
          {formatDuration(itinerary.walkTime)}{' '}
          <div style={{
            width: '20px',
            height: '20px',
            display: 'inline-block',
            paddingLeft: '2px',
            paddingBottom: '6px'
          }}>
            <LegIcon leg={leg} size={5} />
          </div>
        </span>
      )
    }
  }
]

export default class DefaultItinerary extends NarrativeItinerary {
  _onMouseEnter = () => {
    const {active, index, setVisibleItinerary, visibleItinerary} = this.props
    // Set this itinerary as visible if not already visible.
    const visibleNotSet = visibleItinerary === null || visibleItinerary === undefined
    const isVisible = visibleItinerary === index ||
      (active === index && visibleNotSet)
    if (typeof setVisibleItinerary === 'function' && !isVisible) {
      setVisibleItinerary({index})
    }
  }

  _onMouseLeave = () => {
    const {index, setVisibleItinerary, visibleItinerary} = this.props
    if (typeof setVisibleItinerary === 'function' && visibleItinerary === index) {
      setVisibleItinerary({index: null})
    }
  }

  _isSortingOnAttribute = (attribute) => {
    const {sort} = this.props
    if (sort && sort.type) {
      const type = sort.type.toLowerCase()
      return attribute.id.toLowerCase() === type ||
        (attribute.alias && attribute.alias.toLowerCase() === type)
    }
    return false
  }

  render () {
    const {
      active,
      expanded,
      itinerary,
      LegIcon,
      setActiveLeg,
      showRealtimeAnnotation,
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
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
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
              .sort((a, b) => {
                const aSelected = this._isSortingOnAttribute(a)
                const bSelected = this._isSortingOnAttribute(b)
                if (aSelected) return -1
                if (bSelected) return 1
                else return a.order - b.order
              })
              .map(attribute => {
                const isSelected = this._isSortingOnAttribute(attribute)
                const options = attribute.id === 'arrivalTime' ? timeOptions : {}
                if (isSelected) {
                  options.isSelected = true
                  options.selection = this.props.sort.type
                }
                options.LegIcon = LegIcon
                return (
                  <li key={attribute.id} className={`${attribute.id}${isSelected ? ' main' : ''}`}>
                    {attribute.render(itinerary, options)}
                  </li>
                )
              })
            }
          </ul>
          <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
          <FieldTripGroupSize itinerary={itinerary} />
          {(active && !expanded) &&
            <small style={{clear: 'both', textAlign: 'center', display: 'block', color: 'grey'}}>
              click to view details
            </small>
          }
        </button>
        {(active && expanded) &&
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody timeOptions={timeOptions} itinerary={itinerary} LegIcon={LegIcon} setActiveLeg={setActiveLeg} />
          </>
        }
      </div>
    )
  }
}
