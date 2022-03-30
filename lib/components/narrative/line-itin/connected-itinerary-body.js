/* eslint-disable react/prop-types */
// TODO: Typescript (otp-rr config object)
import { connect } from 'react-redux'
import {
  PlaceName as PlaceNameWrapper,
  PlaceRowWrapper
} from '@opentripplanner/itinerary-body/lib/styled'
import clone from 'clone'
import isEqual from 'lodash.isequal'
import ItineraryBody from '@opentripplanner/itinerary-body/lib/otp-react-redux/itinerary-body'
import LineColumnContent from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'
import PlaceName from '@opentripplanner/itinerary-body/lib/otp-react-redux/place-name'
import React, { Component } from 'react'
import RouteDescription from '@opentripplanner/itinerary-body/lib/otp-react-redux/route-description'
import styled from 'styled-components'
import TransitLegSummary from '@opentripplanner/itinerary-body/lib/defaults/transit-leg-summary'

import { ComponentContext } from '../../../util/contexts'
import { setLegDiagram, setMapillaryId } from '../../../actions/map'
import { setViewedTrip } from '../../../actions/ui'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'

import RealtimeTimeColumn from './realtime-time-column'
import TransitLegSubheader from './connected-transit-leg-subheader'

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {}

const ItineraryBodyContainer = styled.div`
  padding: 0px 0px;
`

const StyledItineraryBody = styled(ItineraryBody)`
  ${PlaceNameWrapper} {
    font-weight: inherit;
  }
  ${PlaceRowWrapper} {
    max-width: inherit;
  }
`

class ConnectedItineraryBody extends Component {
  static contextType = ComponentContext

  /** avoid rerendering if the itinerary to display hasn't changed */
  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render() {
    const {
      accessibilityScoreGradationMap,
      config,
      diagramVisible,
      itinerary,
      setActiveLeg,
      setLegDiagram,
      setMapillaryId,
      setViewedTrip,
      timeOptions
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

    return (
      <ItineraryBodyContainer>
        <StyledItineraryBody
          accessibilityScoreGradationMap={accessibilityScoreGradationMap}
          config={config}
          diagramVisible={diagramVisible}
          itinerary={clonedItinerary}
          LegIcon={LegIcon}
          LineColumnContent={LineColumnContent}
          mapillaryCallback={setMapillaryId}
          mapillaryKey={config?.mapillary?.key}
          PlaceName={PlaceName}
          RouteDescription={RouteDescription}
          setActiveLeg={setActiveLeg}
          setLegDiagram={setLegDiagram}
          setViewedTrip={setViewedTrip}
          showAgencyInfo
          showElevationProfile={config.elevationProfile}
          showLegIcon
          showMapButtonColumn={false}
          showRouteFares={config.itinerary && config.itinerary.showRouteFares}
          showViewTripButton
          TimeColumnContent={RealtimeTimeColumn}
          timeOptions={timeOptions}
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

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config,
    diagramVisible: state.otp.ui.diagramLeg
  }
}

const mapDispatchToProps = {
  setLegDiagram,
  setMapillaryId,
  setViewedTrip
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ConnectedItineraryBody)
