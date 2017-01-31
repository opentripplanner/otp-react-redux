import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import NarrativeItinerary from './narrative-itinerary'
import { getActiveSearch } from '../../util/state'

class NarrativeItineraries extends Component {

  static propTypes = {
    itineraries: PropTypes.array
  }

  render () {
    if (!this.props.itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>We found {this.props.itineraries.length} itineraries:</div>
        {this.props.itineraries.map((itin, index) => {
          return <NarrativeItinerary itinerary={itin} index={index} key={index} />
        })}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    itineraries: activeSearch ? activeSearch.planResponse.plan.itineraries : null
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(NarrativeItineraries)
