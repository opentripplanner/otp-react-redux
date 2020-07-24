import coreUtils from '@opentripplanner/core-utils'
import { ClassicLegIcon } from '@opentripplanner/icons'
import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'

import { getQueryParamsFromQueryString } from '../../util/query'
import ItinerarySummary from '../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

const TripSummary = ({ config, monitoredTrip }) => {
  // State, state setter, and intital state.
  const [{ from, to }, setQueryObj] = useState({ from: {}, to: {} })
  const { itinerary, queryParams } = monitoredTrip

  useEffect(() => {
    // Will be set to false on component unload.
    let isComponentMounted = true

    getQueryParamsFromQueryString(queryParams, config)
      .then(queryObj => {
        // Update the state with the query object while component is mounted.
        if (isComponentMounted) {
          setQueryObj(queryObj)
        }
      })

    // Gets called when component is unmounted.
    // Turn off flag to prevent state update.
    return () => {
      isComponentMounted = false
    }
  }, [])

  // TODO: use the modern itinerary summary built for trip comparison.
  return (
    <div>
      <div>From <b>{from.name}</b> to <b>{to.name}</b></div>
      <div className={`otp option default-itin active`}>
        <div className='header'>
          <span className='title'>Itinerary</span>{' '}
          <span className='duration pull-right'>{formatDuration(itinerary.duration)}</span>{' '}
          <span className='arrivalTime'>{formatTime(itinerary.startTime)}—{formatTime(itinerary.endTime)}</span>
          <ItinerarySummary itinerary={itinerary} LegIcon={ClassicLegIcon} />
        </div>
      </div>
    </div>
  )
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  return {
    config: state.otp.config
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TripSummary)
