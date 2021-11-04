import isEqual from 'lodash.isequal'
import TransitLegSummary from '@opentripplanner/itinerary-body/lib/defaults/transit-leg-summary'
import ItineraryBody from '@opentripplanner/itinerary-body/lib/otp-react-redux/itinerary-body'
import LineColumnContent from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'
import PlaceName from '@opentripplanner/itinerary-body/lib/otp-react-redux/place-name'
import { PlaceName as PlaceNameWrapper, PlaceRowWrapper } from '@opentripplanner/itinerary-body/lib/styled'
import RouteDescription from '@opentripplanner/itinerary-body/lib/otp-react-redux/route-description'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import styled from 'styled-components'

import { setLegDiagram } from '../../../actions/map'
import { setViewedTrip } from '../../../actions/ui'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'
import { ComponentContext } from '../../../util/contexts'

import RealtimeTimeColumn from './realtime-time-column'
import TransitLegSubheader from './connected-transit-leg-subheader'

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
  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render () {
    const {
      accessibilityScoreGradationMap,
      config,
      diagramVisible,
      itinerary,
      setActiveLeg,
      setLegDiagram,
      setViewedTrip,
      timeOptions
    } = this.props
    const { LegIcon } = this.context

    return (
      <ItineraryBodyContainer>
        <StyledItineraryBody
          accessibilityScoreGradationMap={accessibilityScoreGradationMap}
          config={config}
          diagramVisible={diagramVisible}
          itinerary={itinerary}
          LegIcon={LegIcon}
          LineColumnContent={LineColumnContent}
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
        <TripDetails itinerary={itinerary} />
        <TripTools itinerary={itinerary} />
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
  setViewedTrip
}

export default connect(mapStateToProps, mapDispatchToProps)(
  ConnectedItineraryBody
)
