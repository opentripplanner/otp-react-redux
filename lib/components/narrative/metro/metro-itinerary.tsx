import { AccessibilityRating } from '@opentripplanner/itinerary-body'
import { connect } from 'react-redux'
import {
  FormattedMessage,
  FormattedNumber,
  injectIntl,
  IntlShape
} from 'react-intl'
import { Itinerary, Leg } from '@opentripplanner/types'
import React from 'react'
import styled from 'styled-components'

import * as narriativeActions from '../../../actions/narrative'
import * as uiActions from '../../../actions/ui'
import { FlexIndicator } from '../default/flex-indicator'
import {
  getAccessibilityScoreForItinerary,
  itineraryHasAccessibilityScores
} from '../../../util/accessibility-routing'
import { getActiveSearch, getFare } from '../../../util/state'
import { ItineraryDescription } from '../default/itinerary-description'
import FormattedDuration, {
  formatDuration
} from '../../util/formatted-duration'
import Icon from '../../util/icon'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import NarrativeItinerary from '../narrative-itinerary'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import {
  departureTimes,
  getFirstTransitLegStop,
  getFlexAttirbutes,
  getItineraryRoutes,
  removeInsignifigantWalkLegs
} from './attribute-utils'
import RouteBlock from './route-block'

const { ItineraryView } = uiActions

// Styled components
const ItineraryWrapper = styled.div.attrs((props) => {
  return { 'aria-label': props['aria-label'] }
})`
  border-bottom: 0.1ch solid #33333333;
  color: #333;
  display: grid; /* We don't use grid here, but "block" and "inline" cause problems with Firefox */
  padding: 0;
`

const DepartureTimes = styled.span`
  color: #0909098f;
  font-size: 14px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: pre;
  width: 100%;

  .active {
    color: #090909ee;
    cursor: auto;
  }

  button:not(.active) {
    text-decoration: underline;
  }
  button:not(.active):hover {
    color: #090909ef;
  }

  button {
    background: none;
    transition: all 0.05s ease-out;
    border: none;
    padding: 0;
    margin: 0;
    display: inline;
  }
`

const PrimaryInfo = styled.span`
  color: #000000cc;
  font-size: 22px;
  font-weight: 600;
  text-align: right;
`

const SecondaryInfo = styled.span`
  color: #090909cc;
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
`

const Spacer = styled.span``

const Routes = styled.section<{ enableDot?: boolean }>`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;

  ${(props) =>
    !props?.enableDot &&
    `
    .route-block-wrapper {
      background: rgba(0,0,0,0.05);
      border-radius: 10px;
      padding: 6px;
    }
    /* Slight margin adjustments for "bubble" */
    .route-block-wrapper svg:first-of-type {
      margin-left: 5px;
    }
    .route-block-wrapper section:first-of-type {
      margin-left: -4px;
    }
  `}
`

const ItineraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: minmax(8px, fit-content);
  padding: 10px 1em;

  ${DepartureTimes} {
    grid-column: 1 / 8;
  }

  ${Routes} {
    grid-column: 1 / 8;
    grid-row: 1 / 8;
  }

  ${PrimaryInfo} {
    grid-column: 8 / 11;
    grid-row: 1 / span 3;
  }

  ${Spacer} {
    grid-column: 8 / 11;
    grid-row: span 1;
  }

  ${SecondaryInfo} {
    grid-column: 8 / 11;
    grid-row: span 2;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.flex {
      color: orangered;
      white-space: normal;
      text-overflow: inherit;
      grid-row: span 4;
    }
  }

  svg {
    /* Fix for safari, where svg needs explicit width to render */
    width: 28px;
    /* Fix for our svg icons, which tend to be slightly off-center */
    &:not(.no-centering-fix) {
      margin-left: 0px;
    }
  }
`

const ItineraryGridSmall = styled.div`
  border-radius: 10px;
  display: grid;
  gap: 0 2px;
  grid-template-columns: 1fr 3fr;
  grid-template-rows: repeat(10, 8px);
  padding: 10px 1em;

  ${PrimaryInfo} {
    font-size: 100%;
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

class MetroItinerary extends NarrativeItinerary {
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
      activeItineraryTimeIndex,
      currency,
      defaultFareKey,
      enableDot,
      expanded,
      intl,
      itinerary,
      LegIcon,
      mini,
      setActiveItinerary,
      setActiveLeg,
      setItineraryTimeIndex,
      setItineraryView,
      showLegDurations,
      showRealtimeAnnotation
    } = this.props

    const { isCallAhead, isContinuousDropoff, isFlexItinerary, phone } =
      getFlexAttirbutes(itinerary)

    const { fareCurrency, transitFare } = getFare(
      itinerary,
      defaultFareKey,
      currency
    )

    const firstTransitStop = getFirstTransitLegStop(itinerary)

    const renderRouteBlocks = (legs: Leg[], firstOnly = false) => {
      const routeBlocks = legs
        .filter(removeInsignifigantWalkLegs)
        // If firstOnly is set to true, sort to ensure non-walk leg is first
        .sort((a, b) => (firstOnly ? b.distance - a.distance : 0))
        .map((leg: Leg, index: number, filteredLegs: Leg[]) => {
          const previousLegMode =
            (index > 0 && filteredLegs[index - 1].mode) || undefined
          return (
            <RouteBlock
              footer={
                showLegDurations && (
                  <FormattedDuration duration={leg.duration} />
                )
              }
              hideLongName
              key={index}
              leg={leg}
              LegIcon={LegIcon}
              previousLegMode={previousLegMode}
              showDivider={enableDot}
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
            // Reset the scroll. Refs would be the more
            // appropriate way to do this, but they don't work
            setTimeout(
              () => document.querySelector('.metro-itin')?.scrollIntoView(),
              10
            )
          }}
        >
          <ItineraryWrapper
            aria-label={intl.formatMessage(
              {
                id: 'components.MetroUI.itineraryDescription'
              },
              {
                routes: getItineraryRoutes(itinerary, intl),
                time: formatDuration(itinerary.duration, intl)
              }
            )}
            className={`itin-wrapper${mini ? '-small' : ''}`}
          >
            {itineraryHasAccessibilityScores(itinerary) && (
              <AccessibilityRating
                gradationMap={accessibilityScoreGradationMap}
                score={getAccessibilityScoreForItinerary(itinerary)}
              />
            )}
            {!mini && (
              <ItineraryGrid className="itin-grid">
                <Routes enableDot={enableDot}>
                  {renderRouteBlocks(itinerary.legs)}
                </Routes>
                <PrimaryInfo>
                  <FormattedDuration duration={itinerary.duration} />
                </PrimaryInfo>
                <Spacer />
                <SecondaryInfo className={isFlexItinerary ? 'flex' : ''}>
                  {isFlexItinerary ? (
                    <FlexIndicator
                      isCallAhead={isCallAhead}
                      isContinuousDropoff={isContinuousDropoff}
                      phoneNumber={phone}
                      shrink={false}
                      textOnly
                    />
                  ) : (
                    firstTransitStop && (
                      <FormattedMessage
                        id="components.MetroUI.fromStop"
                        values={{ stop: firstTransitStop }}
                      />
                    )
                  )}
                </SecondaryInfo>
                <SecondaryInfo>
                  {transitFare === null || transitFare < 0 ? (
                    <FormattedMessage id="common.itineraryDescriptions.noTransitFareProvided" />
                  ) : (
                    <FormattedMessage
                      id="components.ItinerarySummary.fareCost"
                      values={{
                        // TODO: re-implement TNC fares for metro UI?
                        maxTotalFare: null,
                        minTotalFare: (
                          <FormattedNumber
                            currency={fareCurrency}
                            currencyDisplay="narrowSymbol"
                            // This isn't a "real" style prop
                            // eslint-disable-next-line react/style-prop-object
                            style="currency"
                            value={transitFare / 100}
                          />
                        ),
                        useMaxFare: false
                      }}
                    />
                  )}
                </SecondaryInfo>
                <SecondaryInfo>
                  <FormattedMessage
                    id="components.MetroUI.timeWalking"
                    values={{
                      time: <FormattedDuration duration={itinerary.walkTime} />
                    }}
                  />
                </SecondaryInfo>
                <DepartureTimes>
                  <FormattedMessage id="components.MetroUI.leaveAt" />{' '}
                  {departureTimes(
                    itinerary,
                    setItineraryTimeIndex,
                    intl,
                    activeItineraryTimeIndex
                  )}
                </DepartureTimes>
              </ItineraryGrid>
            )}
            {mini && (
              <ItineraryGridSmall>
                <PrimaryInfo>
                  <FormattedDuration duration={itinerary.duration} />
                </PrimaryInfo>
                <SecondaryInfo>
                  <ItineraryDescription itinerary={itinerary} />
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

  const activeSearch = getActiveSearch(state)
  const activeItineraryTimeIndex =
    // @ts-expect-error state is not yet typed
    activeSearch && activeSearch.activeItineraryTimeIndex

  return {
    accessibilityScoreGradationMap: gradationMap,
    activeItineraryTimeIndex,
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || 'USD',

    defaultFareKey: state.otp.config.itinerary?.defaultFareKey,
    enableDot: !state.otp.config.itinerary?.disableMetroSeperatorDot,
    showLegDurations: state.otp.config.itinerary?.showLegDurations
  }
}

// TS TODO: correct redux types
const mapDispatchToProps = (dispatch: any) => {
  return {
    setItineraryTimeIndex: (payload: number) =>
      dispatch(narriativeActions.setActiveItineraryTime(payload)),
    setItineraryView: (payload: any) =>
      dispatch(uiActions.setItineraryView(payload))
  }
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(MetroItinerary)
)
