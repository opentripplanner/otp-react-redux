import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import {
  setActiveLeg
} from '../../actions/narrative'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import ItinerarySteps from './itinerary-steps'
import ItineraryStops from './itinerary-stops'
import ItineraryLegs from './itinerary-legs'

class ItineraryOverlay extends Component {
  static propTypes = {
    activeLeg: PropTypes.number,
    activeStep: PropTypes.number,
    itinerary: PropTypes.object
  }

  render () {
    const { activeLeg, activeStep, itinerary } = this.props
    if (!itinerary) return null
    return (
      <div>
        <ItineraryLegs
          itinerary={itinerary}
          activeLeg={activeLeg}
          setActiveLeg={this.props.setActiveLeg}
        />
        <ItineraryStops
          itinerary={itinerary}
          activeLeg={activeLeg}
          setActiveLeg={this.props.setActiveLeg}
        />
        <ItinerarySteps
          itinerary={itinerary}
          activeLeg={activeLeg}
          activeStep={activeStep}
        />
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
  return {
    setActiveLeg: (index, leg) => { dispatch(setActiveLeg({ index, leg })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ItineraryOverlay)
