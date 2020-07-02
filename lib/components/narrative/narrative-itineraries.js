import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setUseRealtimeResponse
} from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveItineraries, getActiveSearch, getRealtimeEffects } from '../../util/state'
import RealtimeAnnotation from './realtime-annotation'

class NarrativeItineraries extends Component {
  static propTypes = {
    itineraries: PropTypes.array,
    itineraryClass: PropTypes.func,
    pending: PropTypes.bool,
    activeItinerary: PropTypes.number,
    setActiveItinerary: PropTypes.func,
    setActiveLeg: PropTypes.func,
    setActiveStep: PropTypes.func,
    setUseRealtimeResponse: PropTypes.func,
    useRealtime: PropTypes.bool,
    companies: PropTypes.string
  }

  static defaultProps = {
    itineraryClass: DefaultItinerary
  }

  _toggleRealtimeItineraryClick = (e) => {
    const {setUseRealtimeResponse, useRealtime} = this.props
    setUseRealtimeResponse({useRealtime: !useRealtime})
  }

  render () {
    const {
      activeItinerary,
      itineraries,
      itineraryClass,
      realtimeEffects,
      useRealtime
    } = this.props
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>
          We found {itineraries.length} itineraries:
        </div>

        {realtimeEffects.isAffectedByRealtimeData && (
          realtimeEffects.exceedsThreshold ||
          realtimeEffects.routesDiffer ||
          !useRealtime) && (
          <RealtimeAnnotation
            realtimeEffects={realtimeEffects}
            toggleRealtime={this._toggleRealtimeItineraryClick}
            useRealtime={useRealtime} />
        )
        }

        {itineraries.map((itinerary, index) => {
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active: index === activeItinerary,
            routingType: 'ITINERARY',
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
  const itineraries = getActiveItineraries(state.otp)
  const realtimeEffects = getRealtimeEffects(state.otp)
  const useRealtime = state.otp.useRealtime
  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    itineraries,
    pending,
    realtimeEffects,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    useRealtime,
    companies: state.otp.currentQuery.companies
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  // FIXME: update signature of these methods,
  // so that only one argument is passed,
  // e.g. setActiveLeg({ index, leg }) 
  return {
    setActiveItinerary: index => {
      dispatch(setActiveItinerary({index}))
    },
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    },
    setUseRealtimeResponse: ({useRealtime}) => {
      dispatch(setUseRealtimeResponse({useRealtime}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
