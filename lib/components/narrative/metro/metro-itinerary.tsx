// This is a large file being touched by open PRs. It should be typescripted
// in a separate PR.
/* eslint-disable */
// @ts-expect-error not typescripted yet
import coreUtils from '@opentripplanner/core-utils'
import React from 'react'
import {
  FormattedList,
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  injectIntl,
  IntlShape
} from 'react-intl'
import { connect } from 'react-redux'
import styled from 'styled-components'
// @ts-expect-error not typescripted yet
import { AccessibilityRating } from '@opentripplanner/itinerary-body'

import * as uiActions from '../../../actions/ui'
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

import { FlexIndicator } from '../default/flex-indicator'
import ItinerarySummary from '../default/itinerary-summary'
import { Itinerary, Leg } from '@opentripplanner/types'

const { ItineraryView } = uiActions
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
    margin: 0 0.125em;
  }

  &::before {
    content: "";
    margin: 0 0.125em;
  }
`

const DetailsHint = styled.div`
  clear: both;
  color: #685c5c;
  font-size: small;
  text-align: center;
`

const ItineraryWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  background: #fffffffb;
  color: #333;
  padding: 1em;
`



type Props = {
  accessibilityScoreGradationMap: { [value: number]: string }
  active: boolean,
  expanded: boolean,
  itinerary: Itinerary,
  mini?: boolean,
  intl: IntlShape,
  LegIcon: React.ReactNode,
  setActiveLeg: (leg: Leg) => void,
  setActiveItinerary: ()=>void,
  setItineraryView: (view: string) => void,
  showRealtimeAnnotation: () => void,
  timeFormat: any // TODO
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
    if (typeof setVisibleItinerary === 'function' && visibleItinerary === index) {
      setVisibleItinerary({ index: null })
    }
  }

  render() {
    const {
      accessibilityScoreGradationMap,
      active,
      configCosts,
      currency,
      defaultFareKey,
      expanded,
      itinerary,
      LegIcon,
      setActiveItinerary,
      setActiveLeg,
      mini,
      setItineraryView,
      showRealtimeAnnotation,
      timeFormat
    } = this.props
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary)
    }
    const isFlexItinerary = itinerary.legs?.some(coreUtils.itinerary.isFlex)
    const isCallAhead = itinerary.legs?.some(coreUtils.itinerary.isReservationRequired)
    const isContinuousDropoff = itinerary.legs?.some(coreUtils.itinerary.isContinuousDropoff)

    // Use first leg's agency as a fallback
    let phone = itinerary.legs?.map((leg: Leg) => leg?.agencyName).filter((name: string) => !!name)[0]

    if (isCallAhead) {
      // Picking 0 ensures that if multiple flex legs with
      // different phone numbers, the first leg is prioritized
      phone = itinerary.legs
        .map((leg: Leg) => leg.pickupBookingInfo?.contactInfo?.phoneNumber)
        .filter((number: string) => !!number)[0]
    }
    return (
      <div
        className={`option metro-itin${active ? ' active' : ''}${expanded ? ' expanded' : ''
          }`}
        onMouseEnter={this._onMouseEnter}
        onMouseLeave={this._onMouseLeave}
        role='presentation'
      >
        <button
          className='header'
          // TODO: use _onHeaderClick for tap only -- this will require disabling
          // this onClick handler after a touchStart
          onClick={() => {
            setActiveItinerary(itinerary)
            setActiveLeg(null, null)
            setItineraryView(ItineraryView.FULL)
          }}
        >
          <ItineraryWrapper>
            <div className='title'>
              This one takes <FormattedDuration duration={itinerary.duration} />
              {mini && 'small indicator test'}
              {/* <ItineraryDescription itinerary={itinerary} /> */}
              {/* <ItinerarySummary itinerary={itinerary} LegIcon={LegIcon} /> */}
              {!mini && itineraryHasAccessibilityScores(itinerary) && (
                <AccessibilityRating
                  gradationMap={accessibilityScoreGradationMap}
                  large
                  score={getAccessibilityScoreForItinerary(itinerary)}
                />
              )}
            </div>
            {!mini && isFlexItinerary && (
              <FlexIndicator
                isCallAhead={isCallAhead}
                shrink={false}
                isContinuousDropoff={isContinuousDropoff}
                phoneNumber={phone}
              />
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
      dispatch(uiActions.setItineraryView(payload)),
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(MetroItinerary))
