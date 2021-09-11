import moment from 'moment-timezone'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import { FormattedMessage, FormattedNumber } from 'react-intl'
import { connect } from 'react-redux'

import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import NarrativeItinerary from '../narrative-itinerary'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'
import { getTotalFare } from '../../../util/state'

import ItinerarySummary from './itinerary-summary'

const { isBicycle, isMicromobility, isTransit } = coreUtils.itinerary

/**
 * Obtains the description of an itinerary in the given locale.
 */
function ItineraryDescription ({itinerary}) {
  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const {duration, mode, rentedBike, rentedVehicle} = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      // TODO: convert OTP's TRAM mode to the correct wording for Portland
      primaryTransitDuration = duration
      transitMode = <FormattedMessage
        id={`common.otpTransitModes.${mode.toLowerCase()}`}
      />
    }
    if (isBicycle(mode)) accessModeId = 'bike'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle) accessModeId = 'micromobilityRent'
    if (rentedBike) accessModeId = 'bikeshare'
    if (mode === 'CAR') accessModeId = 'drive'
  })

  const mainMode = <FormattedMessage id={`common.accessModes.${accessModeId}`} />
  return transitMode
    ? <FormattedMessage
      id='components.DefaultItinerary.multiModeSummary'
      values={{ accessMode: mainMode, transitMode }}
    />
    : mainMode
}

/**
 * Formats the given duration according to the selected locale.
 */
function FormattedDuration ({duration}) {
  const dur = moment.duration(duration, 'seconds')
  const hours = dur.hours()
  const minutes = dur.minutes()
  if (hours === 0) {
    return (
      <FormattedMessage
        id='components.DefaultItinerary.tripDurationFormatZeroHours'
        values={{ minutes }}
      />
    )
  } else {
    return (
      <FormattedMessage
        id='components.DefaultItinerary.tripDurationFormat'
        values={{ hours, minutes }}
      />
    )
  }
}

function FormattedTime ({endTime, startTime, timeFormat}) {
  return (
    <FormattedMessage
      id='components.DefaultItinerary.departureArrivalTimes'
      values={{
        endTime: moment(endTime).format(timeFormat),
        startTime: moment(startTime).format(timeFormat)
      }}
    />
  )
}

const ITINERARY_ATTRIBUTES = [
  {
    alias: 'best',
    id: 'duration',
    order: 0,
    render: (itinerary, options) => (
      <FormattedDuration duration={itinerary.duration} />
    )
  },
  {
    alias: 'departureTime',
    id: 'arrivalTime',
    order: 1,
    render: (itinerary, options) => {
      if (options.isSelected) {
        if (options.selection === 'ARRIVALTIME') {
          return (
            <FormattedTime
              endTime={itinerary.endTime}
              timeFormat={options.timeFormat}
            />
          )
        } else {
          return (
            <FormattedTime
              startTime={itinerary.startTime}
              timeFormat={options.timeFormat}
            />
          )
        }
      }
      return (
        <FormattedTime
          endTime={itinerary.endTime}
          startTime={itinerary.startTime}
          timeFormat={options.timeFormat}
        />
      )
    }
  },
  {
    id: 'cost',
    order: 2,
    render: (itinerary, options) => {
      return (
        <FormattedNumber
          currency={options.currency}
          currencyDisplay='narrowSymbol'
          style='currency'
          value={getTotalFare(itinerary, options.configCosts) / 100}
        />
      )
    }
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
          <FormattedDuration duration={itinerary.walkTime} />{' '}
          <div style={{
            display: 'inline-block',
            height: '20px',
            paddingBottom: '6px',
            paddingLeft: '2px',
            width: '20px'
          }}>
            <LegIcon leg={leg} size={5} />
          </div>
        </span>
      )
    }
  }
]

class DefaultItinerary extends NarrativeItinerary {
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
      configCosts,
      currency,
      expanded,
      itinerary,
      LegIcon,
      setActiveLeg,
      showRealtimeAnnotation,
      timeFormat,
      use24HourFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }

    return (
      <div
        className={`option default-itin${active ? ' active' : ''}${expanded ? ' expanded' : ''}`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role='presentation'
        // FIXME: Move style to css
        style={{
          backgroundColor: expanded ? 'white' : undefined,
          borderLeft: active && !expanded ? '4px teal solid' : undefined
        }}
      >
        <button
          className='header'
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          <div className='title'>
            <ItineraryDescription itinerary={itinerary} />
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
                options.timeFormat = use24HourFormat ? 'H:mm' : 'h:mm a'
                options.configCosts = configCosts
                options.currency = currency
                return (
                  <li className={`${attribute.id}${isSelected ? ' main' : ''}`} key={attribute.id}>
                    {attribute.render(itinerary, options)}
                  </li>
                )
              })
            }
          </ul>
          <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
          <FieldTripGroupSize itinerary={itinerary} />
          {(active && !expanded) &&
            <small style={{clear: 'both', color: 'grey', display: 'block', textAlign: 'center'}}>
              <FormattedMessage id='components.DefaultItinerary.clickDetails' />
            </small>
          }
        </button>
        {(active && expanded) &&
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody itinerary={itinerary} LegIcon={LegIcon} setActiveLeg={setActiveLeg} timeOptions={timeOptions} />
          </>
        }
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || 'USD',
    use24HourFormat: state.user.loggedInUser?.use24HourFormat ?? false
  }
}

export default connect(mapStateToProps)(DefaultItinerary)
