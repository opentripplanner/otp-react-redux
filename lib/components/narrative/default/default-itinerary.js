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
import { Leaf } from '@styled-icons/fa-solid/Leaf'
import clone from 'clone'
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import { ComponentContext } from '../../../util/contexts'
import { getFare, getFirstLegStartTime } from '../../../util/itinerary'
import { Icon, StyledIconWrapperTextAlign } from '../../util/styledIcon'
import { itineraryHasAccessibilityScore } from '../../../util/accessibility-routing'
import { localizeGradationMap } from '../utils'
import FieldTripGroupSize from '../../admin/field-trip-itinerary-group-size'
import FormattedDuration from '../../util/formatted-duration'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import NarrativeItinerary from '../narrative-itinerary'
import RouteBlock from '../metro/route-block'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import { FlexIndicator } from './flex-indicator'
import { ItineraryDescription } from './itinerary-description'
import ItinerarySummary from './itinerary-summary'

const {
  getItineraryCost,
  isAdvanceBookingRequired,
  isCoordinationRequired,
  isFlex,
  isTransit
} = coreUtils.itinerary

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
    margin: 0 ${(props) => (props.noSpace ? '' : '0.125em')};
  }
`

const DetailsHintButton = styled.button`
  &.visible {
    display: contents;
  }

  /* the width/height/overflow trick still renders a tiny button, 
  so make it invisible and out of the way, but still visible to 
  screen readers */

  background: transparent;
  border: none;
  height: 0;
  overflow: hidden;
  position: absolute;
  width: 0;
`
const DetailsHint = styled.div`
  clear: both;
  color: #685c5c;
  cursor: pointer;
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
          (a, b) => getFirstLegStartTime(a.legs) - getFirstLegStartTime(b.legs)
        )
        return (
          <FormattedList
            type="conjunction"
            value={allStartTimes.map(({ legs }, index) => (
              <FormattedTime key={index} value={getFirstLegStartTime(legs)} />
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
    render: (itinerary, options, defaultFareType) => {
      const fare = getFare(itinerary, defaultFareType)
      const currency = getItineraryCost(
        itinerary.legs,
        defaultFareType.mediumId,
        defaultFareType.riderCategoryId
      )?.currency

      if (
        fare === null ||
        fare === undefined ||
        fare < 0 ||
        currency === undefined
      ) {
        return (
          <FormattedMessage id="common.itineraryDescriptions.fareUnknown" />
        )
      }

      return (
        <FormattedNumber
          // Currency from itinerary fare or from config.
          currency={fare.fareCurrency}
          currencyDisplay="narrowSymbol"
          // eslint-disable-next-line react/style-prop-object
          style="currency"
          value={fare.transitFare + fare.maxTNCFare}
        />
      )
    }
  },
  {
    id: 'walkTime',
    order: 3,
    render: (itinerary, options) => {
      const leg = clone(itinerary.legs[0])
      if (isTransit(leg.mode)) {
        leg.mode = 'WALK'
      }

      const { LegIcon } = options
      return (
        // FIXME: For CAR mode, walk time considers driving time.
        <>
          <FormattedDuration
            duration={itinerary.walkTime}
            includeSeconds={false}
          />
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
    render: (itinerary, { co2Config }) => {
      if (!co2Config?.enabled) return
      const { cutoffPercentage, showIfHigher } = co2Config
      const { co2VsBaseline } = itinerary
      if (!showIfHigher && co2VsBaseline > 0) return
      const ROUND_TO_NEAREST = 5
      const co2VsBaselineRounded =
        Math.round((co2VsBaseline * 100) / ROUND_TO_NEAREST) * ROUND_TO_NEAREST
      if (Math.abs(co2VsBaseline * 100) <= cutoffPercentage) return // Only show greater than the cutoff
      return (
        <>
          <FormattedMessage
            id="common.itineraryDescriptions.relativeCo2"
            values={{
              co2: (
                <FormattedNumber
                  style="unit"
                  unit="percent"
                  unitDisplay="narrow"
                  value={Math.abs(co2VsBaselineRounded)}
                />
              ),
              isMore: co2VsBaselineRounded > 0
            }}
          />
          <StyledIconWrapperTextAlign>
            <Icon Icon={Leaf} />
          </StyledIconWrapperTextAlign>
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

  // eslint-disable-next-line complexity
  render() {
    const {
      accessibilityScoreGradationMap,
      co2Config,
      configCosts,
      defaultFareType,
      expanded,
      intl,
      itinerary,
      LegIcon,
      setActiveLeg,
      showRealtimeAnnotation,
      showResultHeaders,
      visible
    } = this.props
    const isFlexItinerary = itinerary.legs.some(isFlex)
    const isCallAhead = itinerary.legs.some(isAdvanceBookingRequired)
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

    const itineraryAttributeOptions = {
      co2Config,
      configCosts,
      LegIcon
    }

    const renderItineraryAttributes = (attribute) => {
      return attribute.render(
        itinerary,
        itineraryAttributeOptions,
        defaultFareType
      )
    }

    return (
      <div
        className={`option default-itin${visible ? ' active' : ''}${
          expanded ? ' expanded' : ''
        }`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        // TODO: CORRECT THIS ARIA ROLE
        role="presentation"
        // TODO test this with a screen reader
        // tabIndex={expanded ? 1 : 0}
      >
        <ItinerarySummaryWrapper
          className="header"
          // _onHeaderClick comes from super component (NarrativeItinerary).
          onClick={this._onHeaderClick}
        >
          <div className="title">
            {showResultHeaders && (
              <h3>
                <ItineraryDescription intl={intl} itinerary={itinerary} />
              </h3>
            )}
            <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} />
            {itineraryHasAccessibilityScore(itinerary) && (
              <AccessibilityRating
                gradationMap={localizedGradationMapWithIcons}
                large
                score={itinerary.accessibilityScore}
              />
            )}
          </div>
          {isFlexItinerary && (
            <FlexIndicator
              isCallAhead={isCallAhead}
              isContinuousDropoff={isCoordinationRequired}
              phoneNumber={phone}
            />
          )}
          <ul
            aria-label={intl.formatMessage({
              id: 'components.ItinerarySummary.itineraryDetails'
            })}
            className="list-unstyled itinerary-attributes"
          >
            <FieldTripGroupSize itinerary={itinerary} />
            {ITINERARY_ATTRIBUTES.sort((a, b) => {
              const aSelected = this._isSortingOnAttribute(a)
              const bSelected = this._isSortingOnAttribute(b)
              if (aSelected) return -1
              if (bSelected) return 1
              return a.order - b.order
            })
              .filter((x) => renderItineraryAttributes(x) !== undefined)
              .map((attribute) => {
                const isSelected = this._isSortingOnAttribute(attribute)
                if (isSelected) {
                  itineraryAttributeOptions.isSelected = true
                  itineraryAttributeOptions.selection = this.props.sort.type
                }
                return (
                  <li
                    className={`${attribute.id}${isSelected ? ' main' : ''}`}
                    key={attribute.id}
                  >
                    {renderItineraryAttributes(attribute)}
                  </li>
                )
              })}
          </ul>
        </ItinerarySummaryWrapper>
        {!expanded && (
          <DetailsHintButton
            className={visible && !expanded && 'visible'}
            onClick={this._onDirectClick}
          >
            <DetailsHint>
              <FormattedMessage id="components.DefaultItinerary.clickDetails" />
            </DetailsHint>
          </DetailsHintButton>
        )}
        {visible && expanded && (
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody
              accessibilityScoreGradationMap={localizedGradationMapWithIcons}
              itinerary={itinerary}
              LegIcon={LegIcon}
              RouteDescriptionOverride={RouteBlock}
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
    co2Config: state.otp.config.co2,
    configCosts: state.otp.config.itinerary?.costs,
    defaultFareType: state.otp.config.itinerary?.defaultFareType || {
      mediumId: null,
      riderCategoryId: null
    },
    showResultHeaders:
      state.otp.config.itinerary?.showBatchUiItineraryHeaders !== false
  }
}

DefaultItinerary.ModesAndRoutes = ItinerarySummary

export default injectIntl(connect(mapStateToProps)(DefaultItinerary))
