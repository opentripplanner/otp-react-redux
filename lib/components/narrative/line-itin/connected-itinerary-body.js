/* eslint-disable react/prop-types */
// TODO: Typescript (otp-rr config object)
import { connect } from 'react-redux'
import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import {
  LegDescriptionHeadsignPrefix,
  PlaceName as PlaceNameWrapper,
  PlaceRowWrapper,
  PlaceSubheader
} from '@opentripplanner/itinerary-body/lib/styled'
import { PlaceName } from '@opentripplanner/itinerary-body/lib/otp-react-redux'
import clone from 'clone'
import isEqual from 'lodash.isequal'
import ItineraryBody from '@opentripplanner/itinerary-body/lib/otp-react-redux/itinerary-body'
import LineColumnContent from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'
import React, { Component } from 'react'
import RouteDescription from '@opentripplanner/itinerary-body/lib/otp-react-redux/route-description'
import styled from 'styled-components'
import TransitLegSummary from '@opentripplanner/itinerary-body/lib/defaults/transit-leg-summary'

import { ComponentContext } from '../../../util/contexts'
import { getActiveSearch } from '../../../util/state'
import {
  getFirstLegStartTime,
  getLastLegEndTime
} from '../../../util/itinerary'
import { getFormattedMode } from '../../../util/i18n'
import { injectIntl } from 'react-intl'
import { MainPanelContent } from '../../../actions/ui-constants'
import { setLegDiagram, setMapillaryId } from '../../../actions/map'
import { setMainPanelContent, setViewedTrip } from '../../../actions/ui'
import InvisibleA11yLabel from '../../util/invisible-a11y-label'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'

import RealtimeTimeColumn from './realtime-time-column'
import TransitLegSubheader from './connected-transit-leg-subheader'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

const ItineraryBodyContainer = styled.div`
  padding: 0px 10px;

  /* TODO: Find a better way of doing this */
  table {
    font-size: 14px;
  }
`

const StyledItineraryBody = styled(ItineraryBody)`
  /* Render itineraries using the ambient font (not necessarily Hind). */
  *:not(.fa) {
    font-family: inherit;
  }
  ${PlaceNameWrapper},
  ${PlaceSubheader},
  ${LegDescriptionHeadsignPrefix} {
    font-weight: inherit;
  }
  ${PlaceRowWrapper} {
    max-width: inherit;
  }
`

class ConnectedItineraryBody extends Component {
  static contextType = ComponentContext

  /** avoid rerendering if the itinerary to display hasn't changed */
  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render() {
    const {
      accessibilityScoreGradationMap,
      activeItineraryTimeIndex,
      config,
      diagramVisible,
      intl,
      itinerary,
      RouteDescriptionOverride,
      setActiveLeg,
      setLegDiagram,
      setMainPanelContent,
      setMapillaryId,
      setViewedTrip
    } = this.props
    const { LegIcon } = this.context
    const clonedItinerary = clone(itinerary)

    // Support OTP1 flex messages in Trip Details
    // Adding empty pickupBookingInfo and dropOffBookingInfo objects
    // to a leg will trigger relevant flex pickup / dropoff descriptions in
    // the Trip Details component.
    const boardingRuleLeg = clonedItinerary.legs.find(
      (leg) => !!leg.boardRule && !leg.pickupBookingInfo
    )
    const alightingRuleLeg = clonedItinerary.legs.find(
      (leg) => !!leg.alightRule && !leg.dropOffBookingInfo
    )

    // At this point, we know the itinerary is active
    // We use this opportunity to replace the legs for the itinerary body with the
    // selected time, while hiding the fact that there were ever alternate times (to avoid showing alterate options
    // in the itinerary body)
    if (activeItineraryTimeIndex !== undefined) {
      const activeTime = itinerary.allStartTimes?.[activeItineraryTimeIndex]
      if (activeTime) {
        if (activeTime.legs) clonedItinerary.legs = activeTime.legs
        clonedItinerary.startTime = getFirstLegStartTime(activeTime.legs)
        clonedItinerary.endTime = getLastLegEndTime(activeTime.legs)
      }
      clonedItinerary.allStartTimes = null
    }

    // Add pickupBookingInfo for any boarding rules
    if (boardingRuleLeg) {
      boardingRuleLeg.pickupBookingInfo = {
        latestBookingTime: {
          daysPrior: 0
        }
      }
    }
    // Add dropOffBookingInfo for any alighting rules
    if (alightingRuleLeg) {
      alightingRuleLeg.dropOffBookingInfo = {
        latestBookingTime: {
          daysPrior: 0
        }
      }
    }

    const LegIconWithA11y = (props) => {
      const { leg } = props
      const { mode } = leg
      const ariaLabel = isTransit(mode) ? getFormattedMode(mode, intl) : null
      return (
        <>
          <LegIcon {...props} />
          {ariaLabel && <InvisibleA11yLabel>{ariaLabel}</InvisibleA11yLabel>}
        </>
      )
    }

    return (
      <ItineraryBodyContainer>
        <StyledItineraryBody
          accessibilityScoreGradationMap={accessibilityScoreGradationMap}
          config={config}
          diagramVisible={diagramVisible}
          itinerary={clonedItinerary}
          key={activeItineraryTimeIndex}
          LegIcon={LegIconWithA11y}
          LineColumnContent={LineColumnContent}
          mapillaryCallback={setMapillaryId}
          mapillaryKey={config?.mapillary?.key}
          PlaceName={PlaceName}
          RouteDescription={RouteDescriptionOverride || RouteDescription}
          setActiveLeg={setActiveLeg}
          setLegDiagram={setLegDiagram}
          setViewedTrip={(tripId) => {
            setViewedTrip(tripId)
            setMainPanelContent(MainPanelContent.TRIP_VIEWER)
          }}
          showAgencyInfo
          showElevationProfile={config.elevationProfile}
          showLegIcon
          showMapButtonColumn={false}
          showRouteFares={config.itinerary && config.itinerary.showRouteFares}
          showViewTripButton
          TimeColumnContent={RealtimeTimeColumn}
          toRouteAbbreviation={noop}
          TransitLegSubheader={TransitLegSubheader}
          TransitLegSummary={TransitLegSummary}
        />
        <TripDetails itinerary={clonedItinerary} />
        <TripTools itinerary={clonedItinerary} />
      </ItineraryBodyContainer>
    )
  }
}

const mapStateToProps = (state) => {
  const activeSearch = getActiveSearch(state)
  const activeItineraryTimeIndex =
    (activeSearch && activeSearch.activeItineraryTimeIndex) || 0

  return {
    activeItineraryTimeIndex,
    config: state.otp.config,
    diagramVisible: state.otp.ui.diagramLeg
  }
}

const mapDispatchToProps = {
  setLegDiagram,
  setMainPanelContent,
  setMapillaryId,
  setViewedTrip
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConnectedItineraryBody))
