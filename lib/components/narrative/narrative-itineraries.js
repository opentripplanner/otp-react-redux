import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setUseRealtimeResponse,
  setVisibleItinerary
} from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveItineraries, getActiveSearch, getRealtimeEffects } from '../../util/state'
import RealtimeAnnotation from './realtime-annotation'

class NarrativeItineraries extends Component {
  constructor (props) {
    super(props)
    this.state = {
      filter: {
        value: 'ALL'
      },
      sort: {
        desc: false,
        value: 'DURATION'
      }
    }
  }

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

  _clearActiveItinerary = () => this.props.setActiveItinerary({index: null})

  _saveTrip = () => {
    window.confirm('Are you sure you want to save this trip?')
  }

  _onFilterChange = evt => {
    const {value} = evt.target
    const filter = {...this.state.filter, value}
    this.setState({filter})
  }

  _onSortChange = evt => {
    const {value} = evt.target
    const sort = {...this.state.sort, value}
    this.setState({sort})
  }

  _onSortDirChange = () => {
    const desc = !this.state.sort.desc
    const sort = {...this.state.sort, desc}
    this.setState({sort})
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
      persistence,
      realtimeEffects,
      useRealtime
    } = this.props
    if (!itineraries) return null
    const {sort} = this.state
    const hasActive = activeItinerary !== undefined && activeItinerary !== null
    return (
      <div className='options itinerary'>
        <div className='header' style={{display: 'flex', justifyContent: 'space-between'}}>
          {hasActive
            ? <>
              <button
                className='clear-button-formatting'
                onClick={this._clearActiveItinerary}>
                <i className='fa fa-arrow-left' /> View all options
              </button>
              {/* FIXME: only save if meets requirements (e.g., is transit + non-realtime mode) */}
              {persistence.enabled
                ? <button
                  className='clear-button-formatting'
                  onClick={this._saveTrip}>
                  <i className='fa fa-plus-circle' /> Save trip
                </button>
                : null
              }
            </>
            : <>
              <div>We found {itineraries.length} itineraries.</div>
              { // FIXME: Enable only when ITINERARY_BATCH routing type enabled.
                // <select
                //   onChange={this._onFilterChange}
                //   // value={sort.value}
                // >
                //   <option>All modes</option>
                //   <option>Transit only</option>
                //   <option>Active only</option>
                // </select>
              }
              <div className='sort-options'>
                <button
                  onClick={this._onSortDirChange} className='clear-button-formatting'
                  style={{marginRight: '5px'}}>
                  <i className={`fa fa-sort-amount-${sort.desc ? 'desc' : 'asc'}`} />
                </button>
                <select onChange={this._onSortChange} value={sort.value}>
                  <option>Best option</option>
                  <option>Duration</option>
                  <option>Cost</option>
                </select>
              </div>
            </>
          }
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
          const active = index === activeItinerary
          // Hide non-active itineraries.
          if (!active && hasActive) return null
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active,
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
  const {persistence} = state.otp.config
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
    persistence,
    timeFormat: coreUtils.time.getTimeFormat(state.otp.config),
    useRealtime,
    visibleItinerary: activeSearch && activeSearch.visibleItinerary
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setActiveItinerary: payload => dispatch(setActiveItinerary(payload)),
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    },
    setUseRealtimeResponse: payload => dispatch(setUseRealtimeResponse(payload)),
    setVisibleItinerary: payload => dispatch(setVisibleItinerary(payload))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
