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
import Icon from '../narrative/icon'
import {
  getActiveErrors,
  getActiveItineraries,
  getActiveSearch,
  getRealtimeEffects
} from '../../util/state'

// TODO: move to utils?
function humanReadableMode (modeStr) {
  if (!modeStr) return 'N/A'
  const arr = modeStr.toLowerCase().replace(/_/g, ' ').split(',')
  if (arr.length > 2) {
    const last = arr.pop()
    return arr.join(', ') + ' and ' + last
  } else {
    return arr.join(' and ')
  }
}

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

  state = {}

  _toggleDetailedItinerary = () => {
    this.setState({showDetails: !this.state.showDetails})
  }

  _saveTrip = () => {
    // FIXME: Replace with new save-trip functionality.
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

  _renderLoadingDivs = () => {
    const {itineraries, modes, pending} = this.props
    if (!pending) return null
    // Construct loading divs as placeholders while all itineraries load.
    const count = modes.combinations
      ? modes.combinations.length - itineraries.length
      : 0
    return Array.from(
      {length: count},
      (v, i) =>
        <div key={i} className='option default-itin'>
          <SkeletonTheme color='#ddd' highlightColor='#eee'>
            <Skeleton count={3} />
          </SkeletonTheme>
        </div>
    )
  }

  render () {
    const {
      activeItinerary,
      activeSearch,
      containerStyle,
      errors,
      filter,
      itineraries,
      itineraryClass,
      pending,
      persistence,
      realtimeEffects,
      sort,
      useRealtime
    } = this.props
    if (!activeSearch) return null
    const itineraryIsExpanded = activeItinerary !== undefined && activeItinerary !== null && this.state.showDetails
    const showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (
      realtimeEffects.exceedsThreshold ||
      realtimeEffects.routesDiffer ||
      !useRealtime
    )
    const resultText = pending
      ? 'Finding your options...'
      : `${itineraries.length} itineraries found.`
    return (
      <div className='options itinerary' style={containerStyle}>
        <div
          className='options header'
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            flexGrow: '0'
          }}
        >
          {itineraryIsExpanded
            ? <>
              <button
                className='clear-button-formatting'
                onClick={this._toggleDetailedItinerary}>
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
              <div
                title={resultText}
                style={{
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                {resultText}
              </div>
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
              <div style={{display: 'inherit'}} className='sort-options'>
                <button
                  onClick={this._onSortDirChange} className='clear-button-formatting'
                  style={{marginRight: '5px'}}>
                  <i className={`fa fa-sort-amount-${sort.direction.toLowerCase()}`} />
                </button>
                <select onChange={this._onSortChange} value={sort.value}>
                  <option value='BEST'>Best option</option>
                  <option value='DURATION'>Duration</option>
                  <option value='ARRIVALTIME'>Arrival time</option>
                  <option value='DEPARTURETIME'>Departure time</option>
                  <option value='WALKTIME'>Walk time</option>
                  <option value='COST'>Cost</option>
                </select>
              </div>
            </>
          }
        </div>
        <div
          // FIXME: Change to a ul with li children?
          className='list'
          style={{
            flexGrow: '1',
            overflowY: 'auto'
          }}
        >
          {itineraries.map((itinerary, index) => {
            const active = index === activeItinerary
            // Hide non-active itineraries.
            if (!active && itineraryIsExpanded) return null
            return React.createElement(itineraryClass, {
              itinerary,
              index,
              key: index,
              active,
              routingType: 'ITINERARY',
              sort,
              expanded: this.state.showDetails,
              onClick: active ? this._toggleDetailedItinerary : undefined,
              showRealtimeAnnotation,
              ...this.props
            })
          })}
          {/* FIXME: Flesh out error design/move to component? */}
          {errors.map((e, i) => {
            const mode = humanReadableMode(e.requestParameters.mode)
            return (
              <div key={i} className='option default-itin'>
                <h4>
                  <Icon className='text-warning' type='exclamation-triangle' />{' '}
                  No trip found for {mode}
                </h4>
                <div>{e.error.msg}</div>
              </div>
            )
          })}
          {this._renderLoadingDivs()}
        </div>
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
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const itineraries = getActiveItineraries(state.otp)
  const realtimeEffects = getRealtimeEffects(state.otp)
  const useRealtime = state.otp.useRealtime
  return {
    activeSearch,
    errors: getActiveErrors(state.otp),
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
  // FIXME: update signature of these methods,
  // so that only one argument is passed,
  // e.g. setActiveLeg({ index, leg })
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
