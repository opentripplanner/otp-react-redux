import {OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT} from '@opentripplanner/core-utils/lib/time'
import {getTimeZoneOffset} from '@opentripplanner/core-utils/lib/itinerary'
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

import {FlexButtonGroup} from './styled'

const SERVICE_BREAK = '03:00'
const NINETY_SECONDS = 90000

class PlanFirstLastButtons extends Component {
  _updateParamsAndPlan = (params) => {
    const {routingQuery, setQueryParam} = this.props
    setQueryParam(params)
    routingQuery()
  }

  _getOffsetTime = (unixTime) => {
    let offset = 0
    const itinerary = this.props.itineraries[this.props.activeItinerary]
    if (itinerary) {
      offset = getTimeZoneOffset(itinerary)
    }
    return moment(unixTime + offset)
  }

  _planFirst = () => {
    const {activeItinerary, currentQuery, itineraries} = this.props
    const itinerary = itineraries[activeItinerary]
    const date = moment(currentQuery.date)
    // If already planning for the "first" trip, subtract a day to mirror the
    // behavior of _planLast.
    if (this._isPlanningFirst()) date.subtract('days', 1)
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      date: date.format(OTP_API_DATE_FORMAT),
      time: SERVICE_BREAK,
      departArrive: 'DEPART'
    }
    this._updateParamsAndPlan(params)
  }

  _isPlanningFirst = () => {
    const {departArrive, time} = this.props.currentQuery
    return departArrive === 'DEPART' && time === SERVICE_BREAK
  }

  _planPrevious = () => {
    const {activeItinerary, itineraries} = this.props
    const itinerary = itineraries[activeItinerary]
    const newEndTime = this._getOffsetTime(itinerary.endTime - NINETY_SECONDS)
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      time: newEndTime.format(OTP_API_TIME_FORMAT),
      date: newEndTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE'
    }
    this._updateParamsAndPlan(params)
  }

  _planNext = () => {
    const {activeItinerary, itineraries} = this.props
    const itinerary = itineraries[activeItinerary]
    const newStartTime = this._getOffsetTime(itinerary.startTime + NINETY_SECONDS)
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      time: newStartTime.format(OTP_API_TIME_FORMAT),
      date: newStartTime.format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART'
    }
    this._updateParamsAndPlan(params)
  }

  _planLast = () => {
    const {activeItinerary, currentQuery, itineraries} = this.props
    const itinerary = itineraries[activeItinerary]
    const params = {
      startTransitStopId: getFirstStopId(itinerary),
      date: moment(currentQuery.date).add('days', 1).format(OTP_API_DATE_FORMAT),
      time: SERVICE_BREAK,
      departArrive: 'ARRIVE'
    }
    this._updateParamsAndPlan(params)
  }

  render () {
    const {enabled, itineraries} = this.props
    if (!enabled || itineraries.length === 0) {
      return null
    }
    return (
      <FlexButtonGroup>
        <Button bsSize='small' onClick={this._planFirst}>
          First
        </Button>
        <Button bsSize='small' onClick={this._planPrevious}>
          Previous
        </Button>
        <Button bsSize='small' onClick={this._planNext}>
          Next
        </Button>
        <Button bsSize='small' onClick={this._planLast}>
          Last
        </Button>
      </FlexButtonGroup>
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
    enabled: state.otp.config.itinerary?.showPlanFirstLastButtons,
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
