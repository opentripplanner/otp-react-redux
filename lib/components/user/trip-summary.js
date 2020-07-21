import coreUtils from '@opentripplanner/core-utils'
import { ClassicLegIcon } from '@opentripplanner/icons'
import React, { Component } from 'react'
import { connect } from 'react-redux'

import { getQueryParamsFromQueryString } from '../../util/query'
import ItinerarySummary from '../narrative/default/itinerary-summary'

const { formatDuration, formatTime } = coreUtils.time

class TripSummary extends Component {
  constructor () {
    super()

    this.state = {
      // Hold a default state for query location names
      // while it is being fetched in updateQueryState.
      queryObj: {
        from: {},
        to: {}
      }
    }
  }

  updateQueryState = async () => {
    const { monitoredTrip, config } = this.props
    const { queryParams } = monitoredTrip
    const queryObj = await getQueryParamsFromQueryString(queryParams, config)

    // Prevent a state update if componentWillUnmount happened while await was executing.
    if (!this.state.willUnmount) {
      this.setState({ queryObj })
    }
  }

  componentDidMount () {
    this.updateQueryState()
  }

  componentDidUpdate (prevProps) {
    // Update the state the monitoredTrip prop has changed.
    if (this.props.monitoredTrip !== prevProps.monitoredTrip) {
      this.updateQueryState()
    }
  }

  componentWillMount () {
    this.setState({
      willUnmount: true
    })
  }

  render () {
    const { itinerary } = this.props.monitoredTrip
    const { from, to } = this.state.queryObj

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
