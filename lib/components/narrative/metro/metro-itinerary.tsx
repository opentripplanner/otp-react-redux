import { AccessibilityRating } from '@opentripplanner/itinerary-body'
import { connect } from 'react-redux'
import { FareProductSelector, Itinerary, Leg } from '@opentripplanner/types'
import {
  FormattedMessage,
  FormattedNumber,
  injectIntl,
  IntlShape
} from 'react-intl'
import { Leaf } from '@styled-icons/fa-solid/Leaf'
import React from 'react'
import styled, { keyframes } from 'styled-components'

import * as uiActions from '../../../actions/ui'
import { AppReduxState } from '../../../util/state-types'
import { ComponentContext } from '../../../util/contexts'
import { FlexIndicator } from '../default/flex-indicator'
import { getActiveSearch } from '../../../util/state'
import { getFare } from '../../../util/itinerary'
import { IconWithText } from '../../util/styledIcon'
import { ItineraryDescription } from '../default/itinerary-description'
import { itineraryHasAccessibilityScore } from '../../../util/accessibility-routing'
import { ItineraryView } from '../../../util/ui'
import { localizeGradationMap } from '../utils'
import FormattedDuration from '../../util/formatted-duration'
import ItineraryBody from '../line-itin/connected-itinerary-body'
import NarrativeItinerary from '../narrative-itinerary'
import SimpleRealtimeAnnotation from '../simple-realtime-annotation'

import { getFlexAttributes } from './attribute-utils'
import DepartureTimesList, {
  SetActiveItineraryHandler
} from './departure-times-list'
import MetroItineraryRoutes from './metro-itinerary-routes'
import RouteBlock from './route-block'

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
  align-self: flex-end;
  color: #0909098f;
  font-size: 14px;
  text-overflow: ellipsis;
  width: 100%;

  .active {
    color: #090909ee;
    cursor: auto;
  }

  div.header {
    background: none;
    border: none;
    display: inline;
    margin: 0;
    padding: 0;
    transition: all 0.1s ease-out;
  }
`

const ItineraryDetails = styled.ul`
  grid-column-start: -1;
  grid-row: 1 / span 2;
  justify-self: right;
  list-style: none;
  margin: 0;
  overflow: hidden;
  padding: 0;
`
const PrimaryInfo = styled.li`
  color: #000000cc;
  font-size: 22px;
  font-weight: 600;
  text-align: right;
`

const SecondaryInfo = styled.li`
  color: #090909cc;
  font-size: 12px;
  opacity: 0.7;
  text-align: right;
`

const ItineraryNote = styled.div`
  background: mediumseagreen;
  color: white;
  padding: 4px 8px;
  text-align: right;
`

const ItineraryGrid = styled.div`
  display: grid;
  gap: 7px;
  grid-template-columns: repeat(auto-fit, minmax(50%, 1fr));
  padding: 10px 1em;

  ${ItineraryDetails} {
    ${SecondaryInfo} {
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
  }

  ${SecondaryInfo} {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &.flex {
      color: orangered;
      white-space: normal;
      text-overflow: inherit;
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

const ItineraryGridSmall = styled.button`
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

const BLUR_AMOUNT = 3
const blurAnimation = keyframes`
 0% { filter: blur(${BLUR_AMOUNT}px); }
 50% { filter: blur(${BLUR_AMOUNT + 1}px) }
`

const LoadingBlurred = styled.span<{ loading: boolean }>`
  ${(props) => props.loading && `filter: blur(${BLUR_AMOUNT}px)`};
  animation-name: ${(props) => (props.loading ? blurAnimation : '')};
  animation-duration: 1s;
  animation-iteration-count: infinite;
  transition: all 0.2s ease-in-out;
`

type Props = {
  LegIcon: React.ReactNode
  accessibilityScoreGradationMap: { [value: number]: string }
  active: boolean
  defaultFareType: FareProductSelector
  /** This is true when there is only one itinerary being shown and the itinerary-body is visible */
  expanded: boolean
  intl: IntlShape
  itinerary: Itinerary
  mini?: boolean
  setActiveItinerary: SetActiveItineraryHandler
  setActiveLeg: (leg: Leg) => void
  setItineraryView: (view: string) => void
  showRealtimeAnnotation: () => void
}

class MetroItinerary extends NarrativeItinerary {
  static contextType = ComponentContext

  static ModesAndRoutes = MetroItineraryRoutes

  _onMouseEnter = () => {
    const { active, index, setVisibleItinerary, visible } = this.props
    // Set this itinerary as visible if not already visible.
    const isVisible = visible || active
    if (typeof setVisibleItinerary === 'function' && !isVisible) {
      setVisibleItinerary({ index })
    }
  }

  _onMouseLeave = () => {
    const { setVisibleItinerary, visible } = this.props
    if (typeof setVisibleItinerary === 'function' && visible) {
      setVisibleItinerary({ index: null })
    }
  }

  _renderMainRouteBlock = (legs: Leg[]) => {
    const { enableDot, LegIcon, showLegDurations } = this.props
    const mainLeg = legs
      // Sort to ensure non-walk leg is first
      .sort((a: Leg, b: Leg) => b.distance - a.distance)[0]
    return (
      <RouteBlock
        aria-hidden
        footer={
          showLegDurations &&
          mainLeg?.duration && <FormattedDuration duration={mainLeg.duration} />
        }
        hideLongName
        leg={mainLeg}
        LegIcon={LegIcon}
        showDivider={enableDot}
      />
    )
  }

  // eslint-disable-next-line complexity
  render() {
    const {
      accessibilityScoreGradationMap,
      active,
      arrivesAt,
      co2Config,
      defaultFareType,
      expanded,
      intl,
      itinerary,
      LegIcon,
      mini,
      pending,
      setActiveItinerary,
      setActiveLeg,
      setItineraryView,
      showLegDurations,
      showRealtimeAnnotation
    } = this.props
    const { SvgIcon } = this.context

    const { isCallAhead, isContinuousDropoff, isFlexItinerary, phone } =
      getFlexAttributes(itinerary)

    const { fareCurrency, transitFare } = getFare(itinerary, defaultFareType)

    const roundedCo2VsBaseline = Math.round(itinerary.co2VsBaseline * 100)
    const emissionsNote = !mini &&
      Math.abs(roundedCo2VsBaseline) >= (co2Config?.cutoffPercentage || 0) &&
      (roundedCo2VsBaseline < 0 || co2Config?.showIfHigher) &&
      co2Config?.enabled && (
        <IconWithText Icon={Leaf}>
          <FormattedMessage
            id="common.itineraryDescriptions.relativeCo2"
            values={{
              co2: (
                <LoadingBlurred loading={pending}>
                  <FormattedNumber
                    // FormattedNumber style prop is not about CSS.
                    // eslint-disable-next-line react/style-prop-object
                    style="unit"
                    unit="percent"
                    unitDisplay="narrow"
                    value={Math.abs(roundedCo2VsBaseline)}
                  />
                </LoadingBlurred>
              ),
              isMore: roundedCo2VsBaseline > 0
            }}
          />
        </IconWithText>
      )
    const localizedGradationMapWithIcons = localizeGradationMap(
      intl,
      SvgIcon,
      accessibilityScoreGradationMap
    )

    const handleClick = () => {
      setActiveItinerary(itinerary)
      setActiveLeg(null, null)
      setItineraryView(ItineraryView.FULL)
      // Reset the scroll. Refs would be the more
      // appropriate way to do this, but they don't work
      setTimeout(
        () => document.querySelector('.itin-wrapper')?.scrollIntoView(),
        10
      )
    }

    // Use first leg's agency as a fallback
    return (
      <div
        className={`option metro-itin${active ? ' active' : ''}${
          expanded ? ' expanded' : ''
        }`}
      >
        <div
          className="header"
          onClick={expanded ? undefined : handleClick}
          // TODO: once this can be tabbed to, this behavior needs to be improved. Maybe it focuses the
          // first time?
          // eslint-disable-next-line @typescript-eslint/no-empty-function
          onKeyDown={() => {}}
          onMouseEnter={expanded ? undefined : this._onMouseEnter}
          onMouseLeave={expanded ? undefined : this._onMouseLeave}
          // TODO: use _onHeaderClick for tap only -- this will require disabling
          // this onClick handler after a touchStart
          // TODO: CORRECT THIS ARIA ROLE
          role="presentation"
          // TODO test this with a screen reader
          // tabIndex={expanded ? 1 : 0}
        >
          <ItineraryWrapper className={`itin-wrapper${mini ? '-small' : ''}`}>
            {emissionsNote && <ItineraryNote>{emissionsNote}</ItineraryNote>}
            {itineraryHasAccessibilityScore(itinerary) && (
              <AccessibilityRating
                gradationMap={localizedGradationMapWithIcons}
                score={itinerary.accessibilityScore}
              />
            )}
            {!mini && (
              <ItineraryGrid className="itin-grid" role="group">
                {/* TODO: a11y: add aria-label to parent element */}
                <MetroItineraryRoutes
                  expanded={expanded}
                  itinerary={itinerary}
                  LegIcon={LegIcon}
                  showLegDurations={showLegDurations}
                />
                <ItineraryDetails
                  aria-label={intl.formatMessage({
                    id: 'components.ItinerarySummary.itineraryDetails'
                  })}
                >
                  <PrimaryInfo>
                    <FormattedDuration
                      duration={itinerary.duration}
                      includeSeconds={false}
                    />
                  </PrimaryInfo>
                  {isFlexItinerary && (
                    <SecondaryInfo className={isFlexItinerary ? 'flex' : ''}>
                      <FlexIndicator
                        isCallAhead={isCallAhead}
                        isContinuousDropoff={isContinuousDropoff}
                        phoneNumber={phone}
                        shrink={false}
                        textOnly
                      />
                    </SecondaryInfo>
                  )}
                  {
                    // Hide the fare information entirely if the defaultFareType isn't specified.
                    <SecondaryInfo>
                      {transitFare === null ||
                      transitFare === undefined ||
                      transitFare < 0 ? (
                        <FormattedMessage id="common.itineraryDescriptions.fareUnknown" />
                      ) : (
                        // TODO: re-implement TNC fares for metro UI?
                        <FormattedNumber
                          currency={fareCurrency}
                          currencyDisplay="narrowSymbol"
                          // This isn't a "real" style prop
                          // eslint-disable-next-line react/style-prop-object
                          style="currency"
                          value={transitFare}
                        />
                      )}
                    </SecondaryInfo>
                  }
                  <SecondaryInfo>
                    <FormattedMessage
                      id="components.MetroUI.timeWalking"
                      values={{
                        time: (
                          <FormattedDuration
                            duration={itinerary.walkTime}
                            includeSeconds={false}
                          />
                        )
                      }}
                    />
                  </SecondaryInfo>
                </ItineraryDetails>
                <DepartureTimes>
                  {arrivesAt ? (
                    <FormattedMessage id="components.MetroUI.arriveAt" />
                  ) : (
                    <FormattedMessage id="components.MetroUI.leaveAt" />
                  )}{' '}
                  <DepartureTimesList
                    expanded={expanded}
                    itinerary={itinerary}
                    setActiveItinerary={setActiveItinerary}
                    showArrivals={arrivesAt}
                  />
                </DepartureTimes>
              </ItineraryGrid>
            )}
            {mini && (
              <ItineraryGridSmall className="other-itin">
                <PrimaryInfo as="span">
                  <FormattedDuration
                    duration={itinerary.duration}
                    includeSeconds={false}
                  />
                </PrimaryInfo>
                <SecondaryInfo as="span">
                  <ItineraryDescription itinerary={itinerary} />
                </SecondaryInfo>
                {this._renderMainRouteBlock(itinerary.legs)}
              </ItineraryGridSmall>
            )}
          </ItineraryWrapper>
        </div>
        {active && expanded && (
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

const mapStateToProps = (state: AppReduxState, ownProps: Props) => {
  const activeSearch = getActiveSearch(state)

  return {
    accessibilityScoreGradationMap:
      state.otp.config.accessibilityScore?.gradationMap,
    arrivesAt: state.otp.filter.sort.type === 'ARRIVALTIME',
    co2Config: state.otp.config.co2,
    configCosts: state.otp.config.itinerary?.costs,
    defaultFareType: state.otp.config.itinerary?.defaultFareType,
    enableDot: !state.otp.config.itinerary?.disableMetroSeperatorDot,
    // @ts-expect-error TODO: type activeSearch
    pending: activeSearch ? Boolean(activeSearch.pending) : false,
    showLegDurations: state.otp.config.itinerary?.showLegDurations
  }
}

// TS TODO: correct redux types
const mapDispatchToProps = {
  setItineraryView: uiActions.setItineraryView
}

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(MetroItinerary)
)
