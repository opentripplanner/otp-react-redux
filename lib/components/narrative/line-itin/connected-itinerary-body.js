import isEqual from 'lodash.isequal'
import TriMetLegIcon from '@opentripplanner/icons/lib/trimet-leg-icon'
import TransitLegSummary from '@opentripplanner/itinerary-body/lib/defaults/transit-leg-summary'
import ItineraryBody from '@opentripplanner/itinerary-body/lib/otp-react-redux/itinerary-body'
import LineColumnContent from '@opentripplanner/itinerary-body/lib/otp-react-redux/line-column-content'
import PlaceName from '@opentripplanner/itinerary-body/lib/otp-react-redux/place-name'
import RouteDescription from '@opentripplanner/itinerary-body/lib/otp-react-redux/route-description'
import TripDetails from '@opentripplanner/trip-details/lib'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { showLegDiagram } from '../../../actions/map'
import { setActiveLeg } from '../../../actions/narrative'
import { setViewedTrip } from '../../../actions/ui'
import TransitLegSubheader from './connected-transit-leg-subheader'
import TripDetails from '../connected-trip-details'
import TripTools from '../trip-tools'

import TransitLegSubheader from './connected-transit-leg-subheader'

const noop = () => {}

class ConnectedItineraryBody extends Component {
  shouldComponentUpdate (nextProps, nextState) {
    return !isEqual(this.props.companies, nextProps.companies) ||
      !isEqual(this.props.itinerary, nextProps.itinerary)
  }

  render () {
    const {
      config,
      diagramVisible,
      itinerary,
      setActiveLeg,
      setViewedTrip,
      showLegDiagram
    } = this.props

    return (
      <div className='itin-body'>
        <ItineraryBody
          config={config}
          diagramVisible={diagramVisible}
          itinerary={itinerary}
          LegIcon={TriMetLegIcon}
          LineColumnContent={LineColumnContent}
          PlaceName={PlaceName}
          RouteDescription={RouteDescription}
          setActiveLeg={setActiveLeg}
          setLegDiagram={showLegDiagram}
          setViewedTrip={setViewedTrip}
          showAgencyInfo
          showElevationProfile
          showLegIcon
          showMapButtonColumn={false}
          showViewTripButton
          toRouteAbbreviation={noop}
          TransitLegSubheader={TransitLegSubheader}
          TransitLegSummary={TransitLegSummary}
        />
        <TripDetails itinerary={itinerary} />
        <TripTools itinerary={itinerary} />
      </div>
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
  setActiveLeg,
  setViewedTrip,
  showLegDiagram
}

export default connect(mapStateToProps, mapDispatchToProps)(
  ConnectedItineraryBody
)
