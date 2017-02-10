import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { getActiveItinerary, getActiveSearch } from '../../util/state'
import ItineraryStops from './itinerary-stops'
import ItineraryLegs from './itinerary-legs'

class ItineraryOverlay extends Component {

  static propTypes = {
    itinerary: PropTypes.object
  }

  render () {
    const { itinerary, activeLeg, activeStep } = this.props
    if (!itinerary) return null
    return (
      <div>
        <ItineraryLegs {...this.props} />
        <ItineraryStops {...this.props} />
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    itinerary: getActiveItinerary(state.otp),
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(ItineraryOverlay)
