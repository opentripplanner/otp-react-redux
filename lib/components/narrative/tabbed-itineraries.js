import { calculateFares, calculatePhysicalActivity, getTimeZoneOffset } from '@opentripplanner/core-utils/lib/itinerary'
import { formatDuration, formatTime, getTimeFormat } from '@opentripplanner/core-utils/lib/time'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { connect } from 'react-redux'

import { setActiveItinerary, setActiveLeg, setActiveStep, setUseRealtimeResponse } from '../../actions/narrative'
import DefaultItinerary from './default/default-itinerary'
import { getActiveSearch, getRealtimeEffects } from '../../util/state'

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
      useRealtime,
      timeFormat
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
            let minTotalFare = minTNCFare * 100 + transitFare
            const plus = maxTNCFare && maxTNCFare > minTNCFare ? '+' : ''
            if (index === activeItinerary) classNames.push('selected')
            return (
              <Button
                key={`tab-button-${index}`}
                className={classNames.join(' ')}
                onClick={() => { this.props.setActiveItinerary(index) }}
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
          })}
        </div>

        {/* <RealtimeAnnotation
          realtimeEffects={realtimeEffects}
          toggleRealtime={this._toggleRealtimeItineraryClick}
          useRealtime={useRealtime} />
        */}

        {/* Show the active itinerary */}
        {(activeItinerary !== null) && React.createElement(itineraryClass, {
          itinerary: itineraries[activeItinerary],
          index: activeItinerary,
          key: activeItinerary,
          active: true,
          routingType: 'ITINERARY',
          showRealtimeAnnotation,
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
