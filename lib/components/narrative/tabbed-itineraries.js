import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'

import { setActiveItinerary, setActiveLeg, setActiveStep, setUseRealtimeResponse } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveItineraries, getActiveSearch, getRealtimeEffects } from '../../util/state'
import RealtimeAnnotation from './realtime-annotation'
import { formatDuration } from '../../util/time'

class TabbedItineraries extends Component {
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
      <div className='options itinerary tabbed-itineraries'>
        <div className='tab-row'>
          {itineraries.map((itinerary, index) => {
            const classNames = ['tab-button', 'clear-button-formatting']
            if (index === activeItinerary) classNames.push('selected')
            return (
              <Button
                key={`tab-button-${index}`}
                className={classNames.join(' ')}
                onClick={() => { this.props.setActiveItinerary(index) }}
              >
                <div className='title'>{index === 0
                  ? <span>Best Bet</span>
                  : <span>Option {index + 1}</span>
                }</div>
                <div className='details'>
                  {formatDuration(itinerary.duration)}
                  {itinerary.transfers > 0 && (
                    <span><br />{itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}</span>
                  )}
                </div>
              </Button>
            )
          })}
        </div>

        {/* TODO: should this be moved? */}
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

        {/* Show the active itinerary */}
        {(activeItinerary !== null) && React.createElement(itineraryClass, {
          itinerary: itineraries[activeItinerary],
          index: activeItinerary,
          key: activeItinerary,
          active: true,
          routingType: 'ITINERARY',
          ...this.props
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
  TabbedItineraries
)
