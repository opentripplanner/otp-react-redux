import coreUtils from '@opentripplanner/core-utils'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import * as narrativeActions from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveSearch, getRealtimeEffects } from '../../util/state'

const { calculateFares, calculatePhysicalActivity, getTimeZoneOffset } = coreUtils.itinerary
const { formatDuration, formatTime, getTimeFormat } = coreUtils.time

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
    const { setUseRealtimeResponse, useRealtime } = this.props
    setUseRealtimeResponse({ useRealtime: !useRealtime })
  }

  render () {
    const {
      activeItinerary,
      itineraries,
      itineraryClass,
      realtimeEffects,
      setActiveItinerary,
      timeFormat,
      useRealtime,
      ...itineraryClassProps
    } = this.props
    if (!itineraries) return null

    /* TODO: should this be moved? */
    const showRealtimeAnnotation =
      realtimeEffects.isAffectedByRealtimeData && (
        realtimeEffects.exceedsThreshold ||
        realtimeEffects.routesDiffer ||
        !useRealtime
      )
    return (
      <div className='options itinerary tabbed-itineraries'>
        <div className='tab-row'>
          {itineraries.map((itinerary, index) => {
            return (
              <TabButton
                index={index}
                isActive={index === activeItinerary}
                itinerary={itinerary}
                onClick={setActiveItinerary}
                timeFormat={timeFormat}
              />
            )
          })}
        </div>

        {/* <RealtimeAnnotation
          realtimeEffects={realtimeEffects}
          toggleRealtime={this._toggleRealtimeItineraryClick}
          useRealtime={useRealtime} />
        */}

        {/* Show active itin if itineraries exist and active itin is defined. */}
        {(itineraries.length > 0 && activeItinerary >= 0)
          ? React.createElement(itineraryClass, {
            itinerary: itineraries[activeItinerary],
            index: activeItinerary,
            key: activeItinerary,
            active: true,
            expanded: true,
            routingType: 'ITINERARY',
            showRealtimeAnnotation,
            timeFormat,
            ...itineraryClassProps
          })
          : null
        }

      </div>
    )
  }
}

class TabButton extends Component {
  _onClick = () => {
    const {index, onClick} = this.props
    // FIXME: change signature once actions resolved with otp-ui
    onClick(index)
  }

  render () {
    const {index, isActive, itinerary, timeFormat} = this.props
    const timeOptions = {
      format: timeFormat,
      offset: getTimeZoneOffset(itinerary)
    }
    const classNames = ['tab-button', 'clear-button-formatting']
    const { caloriesBurned } = calculatePhysicalActivity(itinerary)
    const {
      centsToString,
      maxTNCFare,
      minTNCFare,
      transitFare
    } = calculateFares(itinerary)
    // TODO: support non-USD
    const minTotalFare = minTNCFare * 100 + transitFare
    const plus = maxTNCFare && maxTNCFare > minTNCFare ? '+' : ''
    if (isActive) classNames.push('selected')
    return (
      <Button
        key={`tab-button-${index}`}
        className={classNames.join(' ')}
        onClick={this._onClick}
      >
        <div className='title'><span>Option {index + 1}</span></div>
        <div className='details'>
          {/* The itinerary duration in hrs/mins */}
          {formatDuration(itinerary.duration)}

          {/* The duration as a time range */}
          <span>
            <br />
            {formatTime(itinerary.startTime, timeOptions)} - {formatTime(itinerary.endTime, timeOptions)}
          </span>

          {/* the fare / calories summary line */}
          <span>
            <br />
            {minTotalFare ? <span>{`${centsToString(minTotalFare)}${plus}`} &bull; </span> : ''}
            {Math.round(caloriesBurned)} Cal
          </span>

          {/* The 'X tranfers' line, if applicable */}
          {itinerary.transfers > 0 && (
            <span>
              <br />
              {itinerary.transfers} transfer{itinerary.transfers > 1 ? 's' : ''}
            </span>
          )}
        </div>
      </Button>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const realtimeEffects = getRealtimeEffects(state.otp)
  const useRealtime = state.otp.useRealtime
  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    pending,
    realtimeEffects,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    useRealtime,
    companies: state.otp.currentQuery.companies,
    tnc: state.otp.tnc,
    timeFormat: getTimeFormat(state.otp.config)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  const {setActiveItinerary, setActiveLeg, setActiveStep, setUseRealtimeResponse} = narrativeActions
  return {
    // FIXME
    setActiveItinerary: (index) => {
      dispatch(setActiveItinerary({index}))
    },
    // FIXME
    setActiveLeg: (index, leg) => {
      dispatch(setActiveLeg({index, leg}))
    },
    // FIXME
    setActiveStep: (index, step) => {
      dispatch(setActiveStep({index, step}))
    },
    // FIXME
    setUseRealtimeResponse: ({useRealtime}) => {
      dispatch(setUseRealtimeResponse({useRealtime}))
    }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(
  TabbedItineraries
)
