import coreUtils from '@opentripplanner/core-utils'
import TransitiveCanvasOverlay from '@opentripplanner/transitive-overlay'
import { connect } from 'react-redux'

import { getActiveSearch, getActiveItineraries } from '../../util/state'

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  let transitiveData = null
  if (
    activeSearch &&
    activeSearch.query.routingType === 'ITINERARY' &&
    activeSearch.response &&
    activeSearch.response.plan
  ) {
    const itins = getActiveItineraries(state.otp)
    // TODO: prevent itineraryToTransitive() from being called more than needed
    transitiveData = coreUtils.map.itineraryToTransitive(itins[activeSearch.activeItinerary])
  } else if (
    activeSearch &&
    activeSearch.response &&
    activeSearch.response.otp
  ) {
    transitiveData = activeSearch.response.otp
  }

  return {
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType,
    transitiveData,
    visible: true
  }
}

const mapDispatchToProps = {}

export default connect(mapStateToProps, mapDispatchToProps)(TransitiveCanvasOverlay)
