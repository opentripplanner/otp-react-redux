import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { setActiveItinerary, setActiveLeg, setActiveStep, setUseRealtimeResponse } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveItineraries, getActiveSearch, getRealtimeEffects } from '../../util/state'
import { formatDuration } from '../../util/time'

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
    useRealtime: PropTypes.bool
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
          We found {itineraries.length}{!useRealtime && ` non-realtime `} itineraries:
        </div>

        {realtimeEffects.isAffectedByRealtimeData &&
          <div className='realtime-alert'>
            <div className='icon-container'>
              <i className='fa fa-exclamation-circle' />
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
                  <span key={idx}>
                    <b>{route}</b>
                    {realtimeEffects.normalRoutes.length - 1 > idx && ', '}
                  </span>
                ))}.
              </div>
              <div>
                <Button
                  bsSize='xsmall'
                  bsStyle='danger'
                  onClick={this._toggleRealtimeItineraryClick}
                  >
                  View {useRealtime ? `Default` : `Realtime`} Itinerary
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
    useRealtime
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
    },
    setUseRealtimeResponse: ({useRealtime}) => {
      dispatch(setUseRealtimeResponse({useRealtime}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
