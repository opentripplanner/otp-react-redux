import { AccessibilityRating } from '@opentripplanner/itinerary-body'
import { connect } from 'react-redux'
import {
  FormattedMessage,
  FormattedNumber,
  injectIntl,
  IntlShape
} from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
// @ts-expect-error no typescript yet
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import styled from 'styled-components'

import * as uiActions from '../../../actions/ui'
import { FlexIndicator } from '../default/flex-indicator'
import {
  getAccessibilityScoreForItinerary,
  itineraryHasAccessibilityScores
} from '../../../util/accessibility-routing'
import { getFare } from '../../../util/state'
import { ItineraryDescription } from '../default/itinerary-description'
import FormattedDuration from '../../util/formatted-duration'
import Icon from '../../util/icon'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import NarrativeItinerary from '../narrative-itinerary'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import {
  departureTimes,
  getFirstTransitLegStop,
  getFlexAttirbutes,
  removeInsignifigantWalkLegs
} from './attribute-utils'
import RouteBlock from './route-block'

const { ItineraryView } = uiActions

// Styled components
const ItineraryWrapper = styled.div`
  color: #333;
  padding: 0;

  border-bottom: 0.1ch solid #33333333;
  display: grid; /* We don't use grid here, but "block" and "inline" cause problems with Firefox */
`

const DepartureTimes = styled.span`
  font-size: 14px;
  width: 100%;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: pre;
  color: #0909098f;

  .first {
    color: #090909ee;
  }
`

const PrimaryInfo = styled.span`
  font-weight: 600;
  font-size: 22px;
  color: #000000cc;
  text-align: right;
`

const SecondaryInfo = styled.span`
  font-size: 12px;
  color: #090909cc;
  opacity: 0.7;
  text-align: right;
`

const Spacer = styled.span``

const Routes = styled.section`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  span {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  span:first-child {
    margin-right: -5px;
  }
  span:not(:first-child)::before {
    content: '•';
    opacity: 0.4;
    width: 5px;
    height: 20px;
  }
`

const ItineraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 8px);

  padding: 10px 1em;

  ${DepartureTimes} {
    grid-row: 9 / 11;
    grid-column: 1 / 8;
  }

  ${Routes} {
    grid-row: 1 / 8;
    grid-column: 1 / 8;
  }

  ${PrimaryInfo} {
    grid-row: 1 / span 3;
    grid-column: 8 / 11;
  }

  ${Spacer} {
    grid-row: span 1;
    grid-column: 8 / 11;
  }

  ${SecondaryInfo} {
    grid-column: 8 / 11;
    grid-row: span 2;

    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
  }

  svg {
    /* Fix for safari, where svg needs explicit width to render */
    width: 28px;
  }
`

const ItineraryGridSmall = styled.div`
  display: grid;
  grid-template-columns: 1fr 3fr;
  gap: 0 2px;
  grid-template-rows: repeat(10, 8px);

  padding: 10px 1em;

  border-radius: 10px;

  ${PrimaryInfo} {
    grid-column: 2;
    grid-row: 2 / 5;
    line-height: 1;
  }

  ${SecondaryInfo} {
    grid-column: 2;
    grid-row: 8;
  }

  span.route-block-wrapper {
    grid-row: 2 / 5;
  }
`

type Props = {
  LegIcon: React.ReactNode
  accessibilityScoreGradationMap: { [value: number]: string }
  active: boolean
  expanded: boolean
  intl: IntlShape
  itinerary: Itinerary
  mini?: boolean
  setActiveItinerary: () => void
  setActiveLeg: (leg: Leg) => void
  setItineraryView: (view: string) => void
  showRealtimeAnnotation: () => void
}

class MetroItinerary<Props> extends NarrativeItinerary {
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

  // eslint-disable-next-line complexity
  render() {
    const {
      accessibilityScoreGradationMap,
      active,
      currency,
      defaultFareKey,
      expanded,
      intl,
      itinerary,
      LegIcon,
      mini,
      setActiveItinerary,
      setActiveLeg,
      setItineraryView,
      showRealtimeAnnotation,
      timeFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }
    const { isCallAhead, isContinuousDropoff, isFlexItinerary, phone } =
      getFlexAttirbutes(itinerary)

    const { fareCurrency, maxTNCFare, minTNCFare, transitFare } = getFare(
      itinerary,
      defaultFareKey,
      currency
    )
    const minTotalFare = minTNCFare * 100 + transitFare
    const maxTotalFare = maxTNCFare * 100 + transitFare

    const firstTransitStop = getFirstTransitLegStop(itinerary)

    const renderRouteBlocks = (legs: Leg[], firstOnly = false) => {
      const routeBlocks = legs
        .filter(removeInsignifigantWalkLegs)
        .map((leg: Leg, index: number, filteredLegs: Leg[]) => {
          const previousLegMode =
            (index > 0 && filteredLegs[index - 1].mode) || undefined
          return (
            <RouteBlock
              hideLongName
              key={index}
              leg={leg}
              LegIcon={LegIcon}
              previousLegMode={previousLegMode}
            />
          )
        })
      if (firstOnly) return routeBlocks[0]
      return routeBlocks
    }

    // Use first leg's agency as a fallback
    return (
      <div
        className={`option metro-itin${active ? ' active' : ''}${
          expanded ? ' expanded' : ''
        }`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role="presentation"
      >
        <button
          className="header"
          // TODO: use _onHeaderClick for tap only -- this will require disabling
          // this onClick handler after a touchStart
          onClick={() => {
            setActiveItinerary(itinerary)
            setActiveLeg(null, null)
            setItineraryView(ItineraryView.FULL)
          }}
        >
          <ItineraryWrapper className={`itin-wrapper${mini ? '-small' : ''}`}>
            {!mini && (
              <ItineraryGrid className="itin-grid">
                <DepartureTimes>
                  <FormattedMessage id="components.MetroUI.leaveAt" />{' '}
                  {departureTimes(itinerary)}
                </DepartureTimes>
                <Routes>{renderRouteBlocks(itinerary.legs)}</Routes>
                <PrimaryInfo>
                  <FormattedDuration duration={itinerary.duration} />
                </PrimaryInfo>
                <Spacer />
                <SecondaryInfo>
                  {firstTransitStop && (
                    <FormattedMessage
                      id="components.MetroUI.fromStop"
                      values={{ stop: firstTransitStop }}
                    />
                  )}
                </SecondaryInfo>
                <SecondaryInfo>
                  <FormattedMessage
                    id="components.ItinerarySummary.fareCost"
                    values={{
                      maxTotalFare: (
                        <FormattedNumber
                          currency={fareCurrency}
                          currencyDisplay="narrowSymbol"
                          // This isn't a "real" style prop
                          // eslint-disable-next-line react/style-prop-object
                          style="currency"
                          value={maxTotalFare / 100}
                        />
                      ),
                      minTotalFare: (
                        <FormattedNumber
                          currency={fareCurrency}
                          currencyDisplay="narrowSymbol"
                          // This isn't a "real" style prop
                          // eslint-disable-next-line react/style-prop-object
                          style="currency"
                          value={minTotalFare / 100}
                        />
                      ),
                      useMaxFare: minTotalFare !== maxTotalFare
                    }}
                  />
                </SecondaryInfo>
                <SecondaryInfo>
                  <FormattedMessage
                    id="components.MetroUI.timeWalking"
                    values={{
                      time: <FormattedDuration duration={itinerary.walkTime} />
                    }}
                  />
                </SecondaryInfo>
                {itineraryHasAccessibilityScores(itinerary) && (
                  <AccessibilityRating
                    gradationMap={accessibilityScoreGradationMap}
                    large
                    score={getAccessibilityScoreForItinerary(itinerary)}
                  />
                )}
                {isFlexItinerary && (
                  <FlexIndicator
                    isCallAhead={isCallAhead}
                    isContinuousDropoff={isContinuousDropoff}
                    phoneNumber={phone}
                    shrink={false}
                  />
                )}
              </ItineraryGrid>
            )}
            {mini && (
              <ItineraryGridSmall>
                <PrimaryInfo>
                  <FormattedDuration duration={itinerary.duration} />
                </PrimaryInfo>
                <SecondaryInfo>
                  {ItineraryDescription({ intl, itinerary })}
                </SecondaryInfo>
                {renderRouteBlocks(itinerary.legs, true)}
              </ItineraryGridSmall>
            )}
          </ItineraryWrapper>
        </button>
        {active && expanded && (
          <>
            {showRealtimeAnnotation && <SimpleRealtimeAnnotation />}
            <ItineraryBody
              accessibilityScoreGradationMap={accessibilityScoreGradationMap}
              itinerary={itinerary}
              LegIcon={LegIcon}
              RouteDescriptionOverride={RouteBlock}
              setActiveLeg={setActiveLeg}
              timeOptions={timeOptions}
            />
          </>
        )}
      </div>
    )
  }
}

// TODO: state type
const mapStateToProps = (state: any, ownProps: Props) => {
  const { intl } = ownProps
  const gradationMap = state.otp.config.accessibilityScore?.gradationMap

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
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || 'USD',
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey
  }
}

// TS TODO: correct redux types
const mapDispatchToProps = (dispatch: any) => {
  return {
    setItineraryView: (payload: any) =>
      dispatch(uiActions.setItineraryView(payload))
  }
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(MetroItinerary)
)
