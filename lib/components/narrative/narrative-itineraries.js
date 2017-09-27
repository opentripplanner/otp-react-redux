import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { setActiveItinerary, setActiveLeg, setActiveStep } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveSearch } from '../../util/state'
import { formatDuration } from '../../util/time'

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

  _handleDefaultItineraryClick = (e) => {
    // TODO figure out what this button is supposed to do
  }

  render () {
    const {
      activeItinerary,
      itineraries,
      itineraryClass,
      realtimeEffects
    } = this.props
    if (!itineraries) return null

    return (
      <div className='options itinerary'>
        <div className='header'>We found {itineraries.length} itineraries:</div>

        {realtimeEffects.isAffectedByRealtimeData &&
          <div className='realtime-alert'>
            <div className='icon-container'>
              <i className='fa fa-exclamation-triangle' />
            </div>
            <div className='content'>
              <div className='header'>
                This Itinerary was Impacted by Real Time Service Disruptions
              </div>
              <div className='text'>
                Under normal conditions, this trip would take{' '}
                <b>{formatDuration(realtimeEffects.normalTime)} </b>
                using the following routes:{' '}
                {realtimeEffects.normalRoutes.map((route, idx) => (
                  <span>
                    <b>{route}</b>
                    {realtimeEffects.normalRoutes.length - 1 > idx && ', '}
                  </span>
                ))}.
              </div>
              <div>
                <Button
                  bsSize='xsmall'
                  bsStyle='danger'
                  onClick={this._handleDefaultItineraryClick}
                  >
                  View Default Itinerary
                </Button>
              </div>
            </div>
          </div>
        }

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
  const itineraries = activeSearch &&
    activeSearch.response &&
    activeSearch.response.plan
      ? activeSearch.response.plan.itineraries
      : null
  const nonRealtimeItineraries = activeSearch &&
    activeSearch.nonRealtimeResponse &&
    activeSearch.nonRealtimeResponse.plan
      ? activeSearch.nonRealtimeResponse.plan.itineraries
      : null
  const isAffectedByRealtimeData = !!(
    itineraries &&
    nonRealtimeItineraries &&
    itineraries[0].duration !== nonRealtimeItineraries[0].duration
  )
  return {
    itineraries,
    nonRealtimeItineraries,
    pending,
    realtimeEffects: {
      isAffectedByRealtimeData,
      normalRoutes: isAffectedByRealtimeData && nonRealtimeItineraries
        ? nonRealtimeItineraries[0].legs.filter(leg => !!leg.route).map(leg => leg.route)
        : [],
      normalTime: isAffectedByRealtimeData && nonRealtimeItineraries
        ? nonRealtimeItineraries[0].duration
        : 0
    },
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
