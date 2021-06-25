import {OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT} from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import React, {Component} from 'react'
import {Button} from 'react-bootstrap'
import {connect} from 'react-redux'

import * as apiActions from '../../actions/api'
import * as formActions from '../../actions/form'
import {getFirstStopId} from '../../util/itinerary'
import {
  getActiveItineraries,
  getActiveSearch,
  getResponsesWithErrors,
  getVisibleItineraryIndex
} from '../../util/state'

const serviceBreakTime = '03:00am'
const NINETY_SECONDS = 90000

class PlanFirstLastButtons extends Component {
  _planFirst = () => {
    const {activeItinerary, currentQuery, itineraries, routingQuery, setQueryParam} = this.props
    const itinerary = itineraries[activeItinerary]
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      date: moment(currentQuery.date).format(OTP_API_DATE_FORMAT),
      time: serviceBreakTime,
      departArrive: 'DEPART',
      originalQueryTime: currentQuery.time
    }
    setQueryParam(params)
    routingQuery()
  }

  _planPrevious = () => {
    const {activeItinerary, currentQuery, itineraries, routingQuery, setQueryParam} = this.props
    const itinerary = itineraries[activeItinerary]
    const newEndTime = moment(itinerary.endTime - NINETY_SECONDS)
    const time = newEndTime.format(OTP_API_TIME_FORMAT)
    console.log(activeItinerary, itinerary, itinerary.endTime, time)
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      time,
      date: newEndTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE',
      originalQueryTime: currentQuery.time
    }
    setQueryParam(params)
    routingQuery()
  }

  _planNext = () => {
    const {activeItinerary, currentQuery, itineraries, routingQuery, setQueryParam} = this.props
    const itinerary = itineraries[activeItinerary]
    const newStartTime = moment(itinerary.startTime + NINETY_SECONDS)
    const time = newStartTime.format(OTP_API_TIME_FORMAT)
    console.log(time)
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      time,
      date: newStartTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART',
      originalQueryTime: currentQuery.time
    }
    setQueryParam(params)
    routingQuery()
  }

  _planLast = () => {
    const {activeItinerary, currentQuery, itineraries, routingQuery, setQueryParam} = this.props
    const itinerary = itineraries[activeItinerary]
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      date: moment(currentQuery.date).format(OTP_API_DATE_FORMAT),
      time: serviceBreakTime,
      departArrive: 'ARRIVE',
      originalQueryTime: currentQuery.time
    }
    setQueryParam(params)
    routingQuery()
  }

  render () {
    console.log(moment((this.props.itineraries[this.props.activeItinerary] || {}).endTime).format(OTP_API_TIME_FORMAT))
    return (
      <div style={{alignItems: 'stretch', display: 'flex', flexDirection: 'row', width: '100%'}}>
        <Button onClick={this._planFirst} style={{flex: 1}}>
          First
        </Button>
        <Button onClick={this._planPrevious} style={{flex: 1}}>
          Previous
        </Button>
        <Button onClick={this._planNext} style={{flex: 1}}>
          Next
        </Button>
        <Button onClick={this._planLast} style={{flex: 1}}>
          Last
        </Button>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  const activeItinerary = activeSearch && activeSearch.activeItinerary
  const { errorMessages, modes } = state.otp.config
  const { sort } = state.otp.filter
  const pending = activeSearch ? Boolean(activeSearch.pending) : false
  const itineraries = getActiveItineraries(state.otp)

  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeSearch,
    activeStep: activeSearch && activeSearch.activeStep,
    currentQuery: state.otp.currentQuery,
    errors: getResponsesWithErrors(state.otp),
    errorMessages,
    itineraries,
    // use a key so that the NarrativeItineraries component and its state is
    // reset each time a new search is shown
    key: state.otp.activeSearchId,
    modes,
    pending,
    sort,
    visibleItinerary: getVisibleItineraryIndex(state)
  }
}

const mapDispatchToProps = {
  // beginCallIfNeeded: callTakerActions.beginCallIfNeeded,
  // findRoutes: apiActions.findRoutes,
  routingQuery: apiActions.routingQuery,
  // setGroupSize: fieldTripActions.setGroupSize,
  setQueryParam: formActions.setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(PlanFirstLastButtons)
