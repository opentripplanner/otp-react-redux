import coreUtils from '@opentripplanner/core-utils'
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import { connect } from 'react-redux'

import {
  setActiveItinerary,
  setActiveLeg,
  setActiveStep,
  setUseRealtimeResponse,
  setVisibleItinerary,
  updateItineraryFilter
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

  _clearActiveItinerary = () => this.props.setActiveItinerary({index: null})

  _saveTrip = () => {
    window.confirm('Are you sure you want to save this trip?')
  }

  _onFilterChange = evt => {
    const {sort, updateItineraryFilter} = this.props
    const {value} = evt.target
    updateItineraryFilter({filter: value, sort})
  }

  _onSortChange = evt => {
    const {value: type} = evt.target
    const {filter, sort, updateItineraryFilter} = this.props
    updateItineraryFilter({filter, sort: {...sort, type}})
  }

  _onSortDirChange = () => {
    const {filter, sort, updateItineraryFilter} = this.props
    const direction = sort.direction === 'ASC' ? 'DESC' : 'ASC'
    updateItineraryFilter({filter, sort: {...sort, direction}})
  }

  _toggleRealtimeItineraryClick = (e) => {
    const {setUseRealtimeResponse, useRealtime} = this.props
    setUseRealtimeResponse({useRealtime: !useRealtime})
  }

  render () {
    const {
      activeItinerary,
      activeSearch,
      filter,
      itineraries,
      itineraryClass,
      persistence,
      realtimeEffects,
      sort,
      useRealtime
    } = this.props
    if (!activeSearch) return null
    const hasActiveItinerary = activeItinerary !== undefined && activeItinerary !== null
    // Construct loading divs as placeholders while all itineraries load.
    const loadingItineraryCount = this.props.modes.combinations
      ? this.props.modes.combinations.length - itineraries.length
      : 0
    const loadingItineraryDivs = Array.from(
      {length: loadingItineraryCount},
      (v, i) =>
        <div key={i} className='option default-itin'>
          <SkeletonTheme color='#ddd' highlightColor='#eee'>
            <Skeleton count={3} />
          </SkeletonTheme>
        </div>
    )
    return (
      <div className='options itinerary'>
        <div className='header' style={{display: 'flex', justifyContent: 'space-between'}}>
          {hasActiveItinerary
            ? <>
              <button
                className='clear-button-formatting'
                onClick={this._clearActiveItinerary}>
                <i className='fa fa-arrow-left' /> View all options
              </button>
              {/* FIXME: only save if meets requirements (e.g., is transit + non-realtime mode) */}
              {persistence && persistence.enabled
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
              { // FIXME: Enable only when ITINERARY/BATCH routing type enabled.
                <select
                  onChange={this._onFilterChange}
                  value={filter}
                >
                  <option value='ALL'>All modes</option>
                  <option value='TRANSIT'>Transit only</option>
                  <option value='ACTIVE'>Active only</option>
                  <option value='CAR'>Uses car</option>
                </select>
              }
              <div className='sort-options'>
                <button
                  onClick={this._onSortDirChange} className='clear-button-formatting'
                  style={{marginRight: '5px'}}>
                  <i className={`fa fa-sort-amount-${sort.direction.toLowerCase()}`} />
                </button>
                <select onChange={this._onSortChange} value={sort.value}>
                  <option value='BEST'>Best option</option>
                  <option value='DURATION'>Duration</option>
                  <option value='COST'>Cost</option>
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
          if (!active && hasActiveItinerary) return null
          return React.createElement(itineraryClass, {
            itinerary,
            index,
            key: index,
            active,
            routingType: 'ITINERARY',
            ...this.props
          })
        })}
        {this.props.pending ? loadingItineraryDivs : null}
      </div>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const {persistence} = state.otp.config
  const {modes} = state.otp.config
  const {filter, sort} = state.otp.filter
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const itineraries = getActiveItineraries(state.otp)
  const realtimeEffects = getRealtimeEffects(state.otp)
  const useRealtime = state.otp.useRealtime
  return {
    activeSearch,
    // swap out realtime itineraries with non-realtime depending on boolean
    itineraries,
    pending,
    realtimeEffects,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    filter,
    modes,
    persistence,
    sort,
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
    setVisibleItinerary: payload => dispatch(setVisibleItinerary(payload)),
    updateItineraryFilter: payload => dispatch(updateItineraryFilter(payload))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  NarrativeItineraries
)
