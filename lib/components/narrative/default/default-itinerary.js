import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import { FormattedMessage, FormattedNumber, FormattedTime } from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'

import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import NarrativeItinerary from '../narrative-itinerary'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'
import FormattedDuration from '../../util/formatted-duration'
import FormattedTimeRange from '../../util/formatted-time-range'
import { getTotalFare } from '../../../util/state'

import ItinerarySummary from './itinerary-summary'
import { FlexIndicator } from './flex-indicator'

const { isBicycle, isMicromobility, isTransit } = coreUtils.itinerary

// Styled components
const LegIconWrapper = styled.div`
  display: inline-block;
  height: 20px;
  padding-bottom: 6px;
  padding-left: 2px;
  width: 20px;

  /* Equivalent of a single space before the leg icon. */
  &::before {
    content: "";
    margin: 0 0.125em;
  }
`

const DetailsHint = styled.div`
  clear: both;
  color: #685C5C;
  font-size: small;
  text-align: center;
`

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
          return <FormattedTime value={itinerary.endTime} />
        } else {
          return <FormattedTime value={itinerary.startTime} />
        }
      }
      return (
        <FormattedTimeRange
          endTime={itinerary.endTime}
          startTime={itinerary.startTime}
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
        <>
          <FormattedDuration duration={itinerary.walkTime} />
          <LegIconWrapper>
            <LegIcon leg={leg} size={5} />
          </LegIconWrapper>
        </>
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
      timeFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }
    const isFlexItinerary = itinerary.legs.some(coreUtils.itinerary.isFlex)

    return (
      <div
        className={`option default-itin${active ? ' active' : ''}${expanded ? ' expanded' : ''}`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role='presentation'
      >
        <button
          className='header'
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          <div className='title'>
            <ItineraryDescription itinerary={itinerary} />
            <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
          </div>
          {isFlexItinerary && <FlexIndicator >FIXME: Flex Notice</FlexIndicator>}
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
          <FieldTripGroupSize itinerary={itinerary} />
          {(active && !expanded) &&
            <DetailsHint>
              <FormattedMessage id='components.DefaultItinerary.clickDetails' />
            </DetailsHint>
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
    currency: state.otp.config.localization?.currency || 'USD'
  }
}

export default connect(mapStateToProps)(DefaultItinerary)
