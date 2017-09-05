import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveSearch } from '../../util/state'

class NarrativeItineraries extends Component {
  static propTypes = {
    itineraries: PropTypes.array,
    itineraryClass: PropTypes.func,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  render () {
    const { itineraries, activeItinerary, itineraryClass } = this.props
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>We found {itineraries.length} itineraries:</div>
        {itineraries.map((itinerary, index) => {
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active: index === activeItinerary,
            ...this.props
          })
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  const pending = activeSearch ? activeSearch.pending : false
  return {
    itineraries:
      activeSearch &&
      activeSearch.planResponse &&
      activeSearch.planResponse.plan
        ? activeSearch.planResponse.plan.itineraries
        : null,
    pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setActiveItinerary: index => {
      dispatch(setActiveItinerary({index}))
    },
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
