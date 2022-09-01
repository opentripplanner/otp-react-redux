// This is a large file being touched by open PRs. It should be typescripted
// in a separate PR.
import { AccessibilityRating } from '@opentripplanner/itinerary-body'
import { connect } from 'react-redux'
import {
  FormattedList,
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  injectIntl
} from 'react-intl'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import {
  getAccessibilityScoreForItinerary,
  itineraryHasAccessibilityScores
} from '../../../util/accessibility-routing'
import { getTotalFare } from '../../../util/state'
import { localizeGradationMap } from '../utils'
import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import FormattedDuration from '../../util/formatted-duration'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import NarrativeItinerary from '../narrative-itinerary'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import { FlexIndicator } from './flex-indicator'
import { ItineraryDescription } from './itinerary-description'
import ItinerarySummary from './itinerary-summary'

const { isContinuousDropoff, isFlex, isReservationRequired } =
  coreUtils.itinerary

// Styled components
const LegIconWrapper = styled.div`
  display: inline-block;
  height: 20px;
  padding-bottom: 6px;
  padding-left: 2px;
  width: 20px;

  /* Equivalent of a single space before the leg icon. */
  &::before {
    content: '';
    margin: 0 0.125em;
  }

  &::before {
    content: '';
    margin: 0 0.125em;
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

const ITINERARY_ATTRIBUTES = [
  {
    alias: 'best',
    id: 'duration',
    order: 0,
    render: (itinerary) => <FormattedDuration duration={itinerary.duration} />
  },
  {
    alias: 'departureTime',
    id: 'arrivalTime',
    order: 1,
    render: (itinerary, options) => {
      if (options.selection === 'ARRIVALTIME') {
        return <FormattedTime value={itinerary.endTime} />
      }
      if (options.selection !== 'DEPARTURETIME' && itinerary.allStartTimes) {
        const allStartTimes = itinerary.allStartTimes.sort(
          (a, b) => a.time - b.time
        )
        return (
          <FormattedList
            type="conjunction"
            value={allStartTimes.map(({ time }, index) => (
              <FormattedTime key={index} value={time} />
            ))}
          />
        )
      }
      return <FormattedTime value={itinerary.startTime} />
    }
  },
  {
    id: 'cost',
    order: 2,
    render: (itinerary, options, defaultFareKey = 'regular') => {
      const fareInCents = getTotalFare(
        itinerary,
        options.configCosts,
        defaultFareKey
      )
      const fareCurrency = itinerary.fare?.fare?.regular?.currency?.currencyCode
      const fare = fareInCents === null ? null : fareInCents / 100
      if (fare === null || fare < 0)
        return (
          <FormattedMessage id="common.itineraryDescriptions.noTransitFareProvided" />
        )
      return (
        <FormattedNumber
          // Currency from itinerary fare or from config.
          currency={fareCurrency || options.currency}
          currencyDisplay="narrowSymbol"
          // eslint-disable-next-line react/style-prop-object
          style="currency"
          value={fare}
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
          <LegIconWrapper>
            <LegIcon leg={leg} size={5} />
          </LegIconWrapper>
        </>
      )
    }
  }
]

class DefaultItinerary extends NarrativeItinerary {
  static contextType = ComponentContext

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
    if (
      typeof setVisibleItinerary === 'function' &&
      visibleItinerary === index
    ) {
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
      currency,
      defaultFareKey,
      expanded,
      intl,
      itinerary,
      LegIcon,
      setActiveLeg,
      showRealtimeAnnotation
    } = this.props
    const isFlexItinerary = itinerary.legs.some(isFlex)
    const isCallAhead = itinerary.legs.some(isReservationRequired)
    const isContDropoff = itinerary.legs.some(isContinuousDropoff)
    const { SvgIcon } = this.context

    const localizedGradationMapWithIcons = localizeGradationMap(
      intl,
      SvgIcon,
      accessibilityScoreGradationMap
    )

    // Use first leg's agency as a fallback
    const agency = itinerary.legs
      .map((leg) => leg?.agencyName)
      .filter((name) => !!name)[0]
    let phone = `contact ${agency}`

    if (isCallAhead) {
      // Picking 0 ensures that if multiple flex legs with
      // different phone numbers, the first leg is prioritized
      phone = itinerary.legs
        .map((leg) => leg.pickupBookingInfo?.contactInfo?.phoneNumber)
        .filter((number) => !!number)[0]
    }

    return (
      <div
        className={`option default-itin${active ? ' active' : ''}${
          expanded ? ' expanded' : ''
        }`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role="presentation"
      >
        <button
          className="header"
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          {/* FIXME: semantics - replace the divs with span (we are inside a button) */}
          <ItinerarySummaryWrapper>
            <div className="title">
              <ItineraryDescription intl={intl} itinerary={itinerary} />
              <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
              {itineraryHasAccessibilityScores(itinerary) && (
                <AccessibilityRating
                  gradationMap={localizedGradationMapWithIcons}
                  large
                  score={getAccessibilityScoreForItinerary(itinerary)}
                />
              )}
            </div>
            {isFlexItinerary && (
              <FlexIndicator
                isCallAhead={isCallAhead}
                isContinuousDropoff={isContDropoff}
                phoneNumber={phone}
              />
            )}
            <ul className="list-unstyled itinerary-attributes">
              {ITINERARY_ATTRIBUTES.sort((a, b) => {
                const aSelected = this._isSortingOnAttribute(a)
                const bSelected = this._isSortingOnAttribute(b)
                if (aSelected) return -1
                if (bSelected) return 1
                return a.order - b.order
              }).map((attribute) => {
                const isSelected = this._isSortingOnAttribute(attribute)
                const options = {
                  configCosts,
                  currency,
                  LegIcon
                }
                if (isSelected) {
                  options.isSelected = true
                  options.selection = this.props.sort.type
                }
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
              <FormattedMessage id="components.DefaultItinerary.clickDetails" />
            </DetailsHint>
          )}
        </button>
        {active && expanded && (
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody
              accessibilityScoreGradationMap={localizedGradationMapWithIcons}
              itinerary={itinerary}
              LegIcon={LegIcon}
              setActiveLeg={setActiveLeg}
            />
          </>
        )}
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  return {
    accessibilityScoreGradationMap:
      state.otp.config.accessibilityScore?.gradationMap,
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || 'USD',
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey
  }
}

export default injectIntl(connect(mapStateToProps)(DefaultItinerary))
