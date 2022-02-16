// This is a large file being touched by open PRs. It should be typescripted
// in a separate PR.
/* eslint-disable */
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import {
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  injectIntl
} from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
import { AccessibilityRating } from '@opentripplanner/itinerary-body'

import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import NarrativeItinerary from '../narrative-itinerary'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'
import FormattedDuration from '../../util/formatted-duration'
import FormattedMode from '../../util/formatted-mode'
import { getTotalFare } from '../../../util/state'
import {
  getAccessibilityScoreForItinerary,
  itineraryHasAccessibilityScores
} from '../../../util/accessibility-routing'
import Icon from '../../util/icon'

import { FlexIndicator } from './flex-indicator'
import ItinerarySummary from './itinerary-summary'

const { isBicycle, isMicromobility, isTransit, isFlex, isOptional, isContinuousDropoff } = coreUtils.itinerary

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
    margin: 0 ${props => props.noSpace ? '' : '0.125em'};
  }
`

const DetailsHint = styled.div`
  clear: both;
  color: #685c5c;
  font-size: small;
  text-align: center;
`

const ItinerarySummaryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
`

/**
 * Obtains the description of an itinerary in the given locale.
 */
function ItineraryDescription({ itinerary }) {
  let primaryTransitDuration = 0
  let accessModeId = 'walk'
  let transitMode
  itinerary.legs.forEach((leg, i) => {
    const { duration, mode, rentedBike, rentedVehicle } = leg
    if (isTransit(mode) && duration > primaryTransitDuration) {
      // TODO: convert OTP's TRAM mode to the correct wording for Portland
      primaryTransitDuration = duration
      transitMode = <FormattedMode mode={mode.toLowerCase()} />
    }
    if (isBicycle(mode)) accessModeId = 'bicycle'
    if (isMicromobility(mode)) accessModeId = 'micromobility'
    if (rentedVehicle) accessModeId = 'micromobility_rent'
    if (rentedBike) accessModeId = 'bicycle_rent'
    if (mode === 'CAR') accessModeId = 'drive'
  })

  const mainMode = <FormattedMode mode={accessModeId} />
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
      const formattedStartTime = itinerary.startTime + options.offset
      const formattedEndTime = itinerary.endTime + options.offset
      if (options.isSelected) {
        if (options.selection === 'ARRIVALTIME') {
          return <FormattedTime value={formattedStartTime} />
        } else {
          return <FormattedTime value={formattedEndTime} />
        }
      }
      return (
        <FormattedMessage
          id='common.time.departureArrivalTimes'
          values={{
            endTime: formattedEndTime,
            startTime: formattedStartTime
          }}
        />
      )
    }
  },
  {
    id: 'cost',
    order: 2,
    render: (itinerary, options, defaultFareKey = 'regular') => {
      return (
        <FormattedNumber
          currency={options.currency}
          currencyDisplay='narrowSymbol'
          style='currency'
          value={
            getTotalFare(itinerary, options.configCosts, defaultFareKey) / 100
          }
        />
      )
    }
  },
  {
    id: 'walkTime',
    order: 3,
    render: (itinerary, options) => {
      const leg = itinerary.legs[0]
      const { LegIcon } = options
      return (
        // FIXME: For CAR mode, walk time considers driving time.
        <>
          <FormattedDuration duration={itinerary.walkTime} />
          <LegIconWrapper noSpace>
            <LegIcon leg={leg} size={5} />
          </LegIconWrapper>
        </>
      )
    }
  },
  {
    id: 'carbonEmission',
    order: 4,
    render: (itinerary, { co2VsBaseline, hideCo2IfHigher }) => {
      if (!co2VsBaseline) return 
      return (
        <>
          <FormattedNumber
            style="unit"
            unit="percent"
            unitDisplay="narrow"
            value={Math.abs(Math.round(co2VsBaseline * 100))} 
            />{' '} 
            <FormattedMessage 
              id='common.itineraryDescriptions.relativeCo2'
              values={{
                isMore: co2VsBaseline > 0
              }}
            />
            <LegIconWrapper noSpace>
              <Icon type="leaf"/>
            </LegIconWrapper>
        </>
      )
    }
  }
]

class DefaultItinerary extends NarrativeItinerary {
  _onMouseEnter = () => {
    const { active, index, setVisibleItinerary, visibleItinerary } = this.props
    // Set this itinerary as visible if not already visible.
    const visibleNotSet =
      visibleItinerary === null || visibleItinerary === undefined
    const isVisible =
      visibleItinerary === index || (active === index && visibleNotSet)
    if (typeof setVisibleItinerary === 'function' && !isVisible) {
      setVisibleItinerary({ index })
    }
  }

  _onMouseLeave = () => {
    const { index, setVisibleItinerary, visibleItinerary } = this.props
    if (typeof setVisibleItinerary === 'function' && visibleItinerary === index) {
      setVisibleItinerary({ index: null })
    }
  }

  _isSortingOnAttribute = (attribute) => {
    const { sort } = this.props
    if (sort && sort.type) {
      const type = sort.type.toLowerCase()
      return (
        attribute.id.toLowerCase() === type ||
        (attribute.alias && attribute.alias.toLowerCase() === type)
      )
    }
    return false
  }

  render() {
    const {
      accessibilityScoreGradationMap,
      active,
      configCosts,
      co2Config,
      currency,
      defaultFareKey,
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
    const isCallAhead = itinerary.legs.some(coreUtils.itinerary.isReservationRequired)
    const isContinuousDropoff = itinerary.legs.some(coreUtils.itinerary.isContinuousDropoff)

    // Use first leg's agency as a fallback
    const agency = itinerary.legs.map(leg => leg?.agencyName).filter(name => !!name)[0]
    let phone = `contact ${agency}`

    if (isCallAhead) {
    // Picking 0 ensures that if multiple flex legs with
    // different phone numbers, the first leg is prioritized
      phone = itinerary.legs
        .map((leg) => leg.pickupBookingInfo?.contactInfo?.phoneNumber)
        .filter((number) => !!number)[0]
    }
    const {co2VsBaseline} = itinerary

    return (
      <div
        className={`option default-itin${active ? ' active' : ''}${
          expanded ? ' expanded' : ''
        }`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role='presentation'
      >
        <button
          className='header'
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          {/* FIXME: semantics - replace the divs with span (we are inside a button) */}
          <ItinerarySummaryWrapper>
            <div className='title'>
              <ItineraryDescription itinerary={itinerary} />
              <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
              {itineraryHasAccessibilityScores(itinerary) && (
                <AccessibilityRating
                  gradationMap={accessibilityScoreGradationMap}
                  large
                  score={getAccessibilityScoreForItinerary(itinerary)}
                />
              )}
            </div>
            {isFlexItinerary && (
              <FlexIndicator
                isCallAhead={isCallAhead}
                isContinuousDropoff={isContinuousDropoff}
                phoneNumber={phone}
              />
            )}
            <ul className='list-unstyled itinerary-attributes'>
              {ITINERARY_ATTRIBUTES.sort((a, b) => {
                const aSelected = this._isSortingOnAttribute(a)
                const bSelected = this._isSortingOnAttribute(b)
                if (aSelected) return -1
                if (bSelected) return 1
                return a.order - b.order
              }).map((attribute) => {
                const isSelected = this._isSortingOnAttribute(attribute)
                const options = attribute.id === 'arrivalTime' ? timeOptions : {}
                if (isSelected) {
                  options.isSelected = true
                  options.selection = this.props.sort.type
                }
                if(co2Config?.showCo2IfHigher || co2VsBaseline < 0) {
                  options.co2VsBaseline = co2VsBaseline
                }
                options.LegIcon = LegIcon
                options.configCosts = configCosts
                options.currency = currency
                return (
                  <li
                    className={`${attribute.id}${isSelected ? ' main' : ''}`}
                    key={attribute.id}
                  >
                    {attribute.render(itinerary, options, defaultFareKey)}
                  </li>
                )
              })}
            </ul>
            <FieldTripGroupSize itinerary={itinerary} />
          </ItinerarySummaryWrapper>
          {active && !expanded && (
            <DetailsHint>
              <FormattedMessage id='components.DefaultItinerary.clickDetails' />
            </DetailsHint>
          )}
        </button>
        {active && expanded && (
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody
              accessibilityScoreGradationMap={accessibilityScoreGradationMap}
              itinerary={itinerary}
              LegIcon={LegIcon}
              setActiveLeg={setActiveLeg}
              timeOptions={timeOptions}
            />
          </>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { intl } = ownProps
  const gradationMap = state.otp.config.accessibilityScore?.gradationMap
  const co2Config = state.otp.config.co2
  // Generate icons based on fa icon keys in config
  // Override text fields if translation set
  gradationMap &&
    Object.keys(gradationMap).forEach((key) => {
      const { icon } = gradationMap[key]
      if (icon && typeof icon === 'string') {
        gradationMap[key].icon = <Icon type={icon} />
      }

      // As these localization keys are in the config, rather than
      // standard language files, the message ids must be dynamically generated
      const localizationId = `config.acessibilityScore.gradationMap.${key}`
      const localizedText = intl.formatMessage({ id: localizationId })
      // Override the config label if a localized label exists
      if (localizationId !== localizedText) {
        gradationMap[key].text = localizedText
      }
    })

  return {
    accessibilityScoreGradationMap: gradationMap,
    co2Config,
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || 'USD',
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey
  }
}

export default injectIntl(connect(mapStateToProps)(DefaultItinerary))
