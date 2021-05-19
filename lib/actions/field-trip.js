import { planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import { serialize } from 'object-to-formdata'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {routingQuery} from './api'
import {toggleCallHistory} from './call-taker'
import {resetForm, setQueryParam} from './form'
import {getGroupSize, getTripFromRequest, sessionIsInvalid} from '../util/call-taker'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const receivedFieldTrips = createAction('RECEIVED_FIELD_TRIPS')
const requestingFieldTrips = createAction('REQUESTING_FIELD_TRIPS')
const receivedFieldTripDetails = createAction('RECEIVED_FIELD_TRIP_DETAILS')
const requestingFieldTripDetails = createAction('REQUESTING_FIELD_TRIP_DETAILS')

// PUBLIC ACTIONS

export const setFieldTripFilter = createAction('SET_FIELD_TRIP_FILTER')
export const setActiveFieldTrip = createAction('SET_ACTIVE_FIELD_TRIP')
export const setGroupSize = createAction('SET_GROUP_SIZE')
export const toggleFieldTrips = createAction('TOGGLE_FIELD_TRIPS')

/**
 * Fully reset form and toggle field trips (and close call history if open).
 */
export function resetAndToggleFieldTrips () {
  return async function (dispatch, getState) {
    dispatch(resetForm(true))
    dispatch(toggleFieldTrips())
    if (getState().callTaker.callHistory.visible) dispatch(toggleCallHistory())
  }
}

/**
 * Fetch all field trip requests (as summaries).
 */
export function fetchFieldTrips () {
  return async function (dispatch, getState) {
    dispatch(requestingFieldTrips())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    let fieldTrips = []
    try {
      const res = await fetch(`${datastoreUrl}/fieldtrip/getRequestsSummary?${qs.stringify({sessionId})}`)
      fieldTrips = await res.json()
    } catch (e) {
      alert(`Error fetching field trips: ${JSON.stringify(e)}`)
    }
    dispatch(receivedFieldTrips({fieldTrips}))
  }
}

/**
 * Fetch details for a particular field trip request.
 */
export function fetchFieldTripDetails (requestId) {
  return function (dispatch, getState) {
    dispatch(requestingFieldTripDetails())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/fieldtrip/getRequest?${qs.stringify({requestId, sessionId})}`)
      .then(res => res.json())
      .then(fieldTrip => dispatch(receivedFieldTripDetails({fieldTrip})))
      .catch(err => {
        alert(`Error fetching field trips: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Add note for field trip request.
 */
export function addFieldTripNote (request, note) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId, username} = callTaker.session
    const noteData = serialize({
      sessionId,
      note: {...note, userName: username},
      requestId: request.id
    })
    return fetch(`${datastoreUrl}/fieldtrip/addNote`,
      {method: 'POST', body: noteData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error adding field trip note: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Delete a specific note for a field trip request.
 */
export function deleteFieldTripNote (request, noteId) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    return fetch(`${datastoreUrl}/fieldtrip/deleteNote`,
      {method: 'POST', body: serialize({ noteId, sessionId })}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error deleting field trip note: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Edit teacher (AKA submitter) notes for a field trip request.
 */
export function editSubmitterNotes (request, submitterNotes) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const noteData = serialize({
      notes: submitterNotes,
      requestId: request.id,
      sessionId
    })
    return fetch(`${datastoreUrl}/fieldtrip/editSubmitterNotes`,
      {method: 'POST', body: noteData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error editing submitter notes: ${JSON.stringify(err)}`)
      })
  }
}

export function saveRequestTrip (request, outbound, groupPlan) {
  return function (dispatch, getState) {
    // If plan is not valid, return before persisting trip.
    const check = checkPlanValidity(request, groupPlan)
    if (!check.isValid) return alert(check.message)
    const requestOrder = outbound ? 0 : 1
    const type = outbound ? 'outbound' : 'inbound'
    const preExistingTrip = getTripFromRequest(request, outbound)
    if (preExistingTrip) {
      const msg = `This action will overwrite a previously planned ${type} itinerary for this request. Do you wish to continue?`
      if (!confirm(msg)) return
    }
    alert(`TODO: Save trip in request order ${requestOrder}!`)
    // TODO: Enable saveTrip
    // dispatch(saveTrip(request, requestOrder))
  }
}

/**
 * @typedef {Object} ValidationCheck
 * @property {boolean} isValid - Whether the check is valid
 * @property {string} message - The message explaining why the check returned
 *   invalid.
 */

/**
 * Checks that a group plan is valid for a given request, i.e., that it occurs
 * on the requested travel date.
 * @param  request   field trip request
 * @param  groupPlan the group plan to check
 * @return {ValidationCheck}
 */
function checkPlanValidity (request, groupPlan) {
  if (groupPlan == null) {
    return {
      isValid: false,
      message: 'No active plan to save'
    }
  }

  // FIXME: add back in offset?
  const planDeparture = moment(groupPlan.earliestStartTime) // .add('hours', otp.config.timeOffset)
  const requestDate = moment(request.travelDate)

  if (
    planDeparture.date() !== requestDate.date() ||
    planDeparture.month() !== requestDate.month() ||
    planDeparture.year() !== requestDate.year()
  ) {
    return {
      isValid: false,
      message: `Planned trip date (${planDeparture.format('MM/DD/YYYY')}) is not the requested day of travel (${requestDate.format('MM/DD/YYYY')})`
    }
  }

  // FIXME More checks? E.g., origin/destination

  return { isValid: true, message: null }
}

export function planTrip (request, outbound) {
  return async function (dispatch, getState) {
    dispatch(setGroupSize(getGroupSize(request)))
    const trip = getTripFromRequest(request, outbound)
    if (!trip) {
      // Construct params from request details
      if (outbound) dispatch(planOutbound(request))
      else dispatch(planInbound(request))
    } else {
      // Populate params from saved query params
      const params = await planParamsToQueryAsync(JSON.parse(trip.queryParams))
      dispatch(setQueryParam(params, trip.id))
    }
  }
}

function planOutbound (request) {
  return async function (dispatch, getState) {
    const {config} = getState().otp
    // clearTrip()
    const locations = await planParamsToQueryAsync({
      fromPlace: request.startLocation,
      toPlace: request.endLocation
    }, config)
    const queryParams = {
      date: moment(request.travelDate).format(OTP_API_DATE_FORMAT),
      departArrive: 'ARRIVE',
      groupSize: getGroupSize(request),
      time: moment(request.arriveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(routingQuery())
  }
}

function planInbound (request) {
  return async function (dispatch, getState) {
    const {config} = getState().otp
    const locations = await planParamsToQueryAsync({
      fromPlace: request.endLocation,
      toPlace: request.startLocation
    }, config)
    // clearTrip()
    const queryParams = {
      date: moment(request.travelDate).format(OTP_API_DATE_FORMAT),
      departArrive: 'DEPART',
      groupSize: getGroupSize(request),
      time: moment(request.leaveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(routingQuery())
  }
}

/**
 * Set group size for a field trip request. Group size consists of numStudents,
 * numFreeStudents, and numChaperones.
 */
export function setRequestGroupSize (request, groupSize) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const groupSizeData = serialize({
      ...groupSize,
      requestId: request.id,
      sessionId
    })
    return fetch(`${datastoreUrl}/fieldtrip/setRequestGroupSize`,
      {method: 'POST', body: groupSizeData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error setting group size: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Set payment info for a field trip request.
 */
export function setRequestPaymentInfo (request, paymentInfo) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const paymentData = serialize({
      ...paymentInfo,
      requestId: request.id,
      sessionId
    })
    return fetch(`${datastoreUrl}/fieldtrip/setRequestPaymentInfo`,
      {method: 'POST', body: paymentData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error setting payment info: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * Set field trip request status (e.g., cancelled).
 */
export function setRequestStatus (request, status) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const statusData = serialize({
      requestId: request.id,
      sessionId,
      status
    })
    return fetch(`${datastoreUrl}/fieldtrip/setRequestStatus`,
      {method: 'POST', body: statusData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error setting request status: ${JSON.stringify(err)}`)
      })
  }
}
