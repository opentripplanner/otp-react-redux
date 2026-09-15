import { connect } from 'react-redux'
import { Itinerary } from '@opentripplanner/types'
import { textOnlyItineraryString } from '@opentripplanner/itinerary-body'
import React from 'react'

import { AppConfig } from '../../util/config-types'
import { AppReduxState } from '../../util/state-types'
import { getActiveItinerary } from '../../util/state'

import TripTools from './trip-tools'

const TripToolsWrapper = ({
  config,
  itinerary
}: {
  config: AppConfig
  itinerary: Itinerary
}) => {
  const textOnlyItinerary =
    itinerary && itinerary.legs && textOnlyItineraryString(itinerary, config)

  return <TripTools textOnlyItinString={textOnlyItinerary} />
}

// connect to the redux store
const mapStateToProps = (state: AppReduxState) => {
  const itinerary = getActiveItinerary(state) as Itinerary
  const { config } = state.otp
  return {
    config,
    itinerary
  }
}

export default connect(mapStateToProps)(TripToolsWrapper)
