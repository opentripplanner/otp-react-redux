// This is a large file being touched by open PRs. It should be typescripted
// in a separate PR.
/* eslint-disable */
// @ts-expect-error not typescripted yet
import coreUtils from "@opentripplanner/core-utils";
import React from "react";
import {
  FormattedList,
  FormattedMessage,
  FormattedNumber,
  FormattedTime,
  injectIntl,
  IntlShape,
} from "react-intl";
import { connect } from "react-redux";
import styled from "styled-components";
// @ts-expect-error not typescripted yet
import { AccessibilityRating } from "@opentripplanner/itinerary-body";

import * as uiActions from "../../../actions/ui";
import NarrativeItinerary from "../narrative-itinerary";
import ItineraryBody from "../line-itin/connected-itinerary-body";
import SimpleRealtimeAnnotation from "../simple-realtime-annotation";
import FormattedDuration from "../../util/formatted-duration";
import FormattedMode from "../../util/formatted-mode";
import { getTotalFare } from "../../../util/state";
import {
  getAccessibilityScoreForItinerary,
  itineraryHasAccessibilityScores,
} from "../../../util/accessibility-routing";
import Icon from "../../util/icon";

import { FlexIndicator } from "../default/flex-indicator";
import ItinerarySummary from "../default/itinerary-summary";
import { Itinerary, Leg } from "@opentripplanner/types";
import { departureTimes } from "./attribute-utils";

const { ItineraryView } = uiActions;
const {
  isBicycle,
  isMicromobility,
  isTransit,
  isFlex,
  isOptional,
  isContinuousDropoff,
} = coreUtils.itinerary;

// Styled components
const ItineraryWrapper = styled.div`
  background: #fffffffb;
  color: #333;
  padding: 0;

  /* after the -1ch margin this is a 0.1ch margin */
  border-bottom: 1.1ch solid #33333333;
`;

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
`;

const Info = styled.div`
  display: grid;
  grid-template-rows: 2fr 1fr 1fr 1fr;

  grid-row: 1 / 6;
  grid-column: 9 / 11;
`;

const PrimaryInfo = styled.span`
  font-weight: 600;
  font-size: 22px;
  color: #000000cc;
  text-align: right;
`;

const SecondaryInfo = styled.span`
  font-size: 12px;
  color: #090909cc;
  opacity: 0.7;
  text-align: right;
`

const Spacer = styled.span``

const ItineraryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  grid-template-rows: repeat(10, 8px);

  padding: 10px 1em;

  ${DepartureTimes} {
    grid-row: 9 / 11;
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
  }
`;

type Props = {
  accessibilityScoreGradationMap: { [value: number]: string };
  active: boolean;
  expanded: boolean;
  itinerary: Itinerary;
  mini?: boolean;
  intl: IntlShape;
  LegIcon: React.ReactNode;
  setActiveLeg: (leg: Leg) => void;
  setActiveItinerary: () => void;
  setItineraryView: (view: string) => void;
  showRealtimeAnnotation: () => void;
  timeFormat: any; // TODO
};

class MetroItinerary<Props> extends NarrativeItinerary {
  _onMouseEnter = () => {
    const { active, index, setVisibleItinerary, visibleItinerary } = this.props;
    // Set this itinerary as visible if not already visible.
    const visibleNotSet =
      visibleItinerary === null || visibleItinerary === undefined;
    const isVisible =
      visibleItinerary === index || (active === index && visibleNotSet);
    if (typeof setVisibleItinerary === "function" && !isVisible) {
      setVisibleItinerary({ index });
    }
  };

  _onMouseLeave = () => {
    const { index, setVisibleItinerary, visibleItinerary } = this.props;
    if (
      typeof setVisibleItinerary === "function" &&
      visibleItinerary === index
    ) {
      setVisibleItinerary({ index: null });
    }
  };

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
      timeFormat,
    } = this.props;
    const timeOptions = {
      format: timeFormat,
      offset: coreUtils.itinerary.getTimeZoneOffset(itinerary),
    };
    const isFlexItinerary = itinerary.legs?.some(coreUtils.itinerary.isFlex);
    const isCallAhead = itinerary.legs?.some(
      coreUtils.itinerary.isReservationRequired
    );
    const isContinuousDropoff = itinerary.legs?.some(
      coreUtils.itinerary.isContinuousDropoff
    );

    // Use first leg's agency as a fallback
    let phone = itinerary.legs
      ?.map((leg: Leg) => leg?.agencyName)
      .filter((name: string) => !!name)[0];

    if (isCallAhead) {
      // Picking 0 ensures that if multiple flex legs with
      // different phone numbers, the first leg is prioritized
      phone = itinerary.legs
        .map((leg: Leg) => leg.pickupBookingInfo?.contactInfo?.phoneNumber)
        .filter((number: string) => !!number)[0];
    }
    return (
      <div
        className={`option metro-itin${active ? " active" : ""}${expanded ? " expanded" : ""
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
            setActiveItinerary(itinerary);
            setActiveLeg(null, null);
            setItineraryView(ItineraryView.FULL);
          }}
        >
          <ItineraryWrapper>
            <ItineraryGrid>
              <DepartureTimes><FormattedMessage id="components.MetroUI.leaveAt" /> {departureTimes(itinerary)}</DepartureTimes>
                <PrimaryInfo>29 Min</PrimaryInfo>
                <Spacer></Spacer>
                <SecondaryInfo>hello one</SecondaryInfo>
                <SecondaryInfo>hello two</SecondaryInfo>
                <SecondaryInfo>hello 333</SecondaryInfo>
              {mini && "small indicator test"}
              {!mini && itineraryHasAccessibilityScores(itinerary) && (
                <AccessibilityRating
                  gradationMap={accessibilityScoreGradationMap}
                  large
                  score={getAccessibilityScoreForItinerary(itinerary)}
                />
              )}
              {!mini && isFlexItinerary && (
                <FlexIndicator
                  isCallAhead={isCallAhead}
                  shrink={false}
                  isContinuousDropoff={isContinuousDropoff}
                  phoneNumber={phone}
                />
              )}
            </ItineraryGrid>
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
    );
  }
}

// TODO: state type
const mapStateToProps = (state: any, ownProps: Props) => {
  const { intl } = ownProps;
  const gradationMap = state.otp.config.accessibilityScore?.gradationMap;

  // Generate icons based on fa icon keys in config
  // Override text fields if translation set
  gradationMap &&
    Object.keys(gradationMap).forEach((key) => {
      const { icon } = gradationMap[key];
      if (icon && typeof icon === "string") {
        gradationMap[key].icon = <Icon type={icon} />;
      }

      // As these localization keys are in the config, rather than
      // standard language files, the message ids must be dynamically generated
      const localizationId = `config.acessibilityScore.gradationMap.${key}`;
      const localizedText = intl.formatMessage({ id: localizationId });
      // Override the config label if a localized label exists
      if (localizationId !== localizedText) {
        gradationMap[key].text = localizedText;
      }
    });

  return {
    accessibilityScoreGradationMap: gradationMap,
    configCosts: state.otp.config.itinerary?.costs,
    // The configured (ambient) currency is needed for rendering the cost
    // of itineraries whether they include a fare or not, in which case
    // we show $0.00 or its equivalent in the configured currency and selected locale.
    currency: state.otp.config.localization?.currency || "USD",
    defaultFareKey: state.otp.config.itinerary?.defaultFareKey,
  };
};

// TS TODO: correct redux types
const mapDispatchToProps = (dispatch: any) => {
  return {
    setItineraryView: (payload: any) =>
      dispatch(uiActions.setItineraryView(payload)),
  };
};

export default injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(MetroItinerary)
);
