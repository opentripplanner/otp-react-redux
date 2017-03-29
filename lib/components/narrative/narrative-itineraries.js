import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import NarrativeItinerary from './narrative-itinerary'
import Loading from './loading'
import { getActiveSearch } from '../../util/state'

class NarrativeItineraries extends Component {
  static propTypes = {
    itineraries: PropTypes.array,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  render () {
    const { itineraries, pending, activeItinerary } = this.props
    if (pending) return <Loading />
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>We found {itineraries.length} itineraries:</div>
        {itineraries.map((itinerary, index) => {
          return (
            <NarrativeItinerary
              itinerary={itinerary}
              index={index}
              key={index}
              active={index === activeItinerary}
              {...this.props}
            />
          )
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  const pending = state.otp.searches.length ? state.otp.searches[state.otp.searches.length - 1].pending : false
  return {
    itineraries: activeSearch && activeSearch.planResponse && activeSearch.planResponse.plan ? activeSearch.planResponse.plan.itineraries : null,
    pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = {setActiveItinerary, setActiveLeg, setActiveStep}

export default connect(mapStateToProps, mapDispatchToProps)(NarrativeItineraries)
