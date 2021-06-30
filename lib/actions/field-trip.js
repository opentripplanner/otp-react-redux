import { planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import { randId } from '@opentripplanner/core-utils/lib/storage'
import moment from 'moment'
import { serialize } from 'object-to-formdata'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {
  getGroupSize,
  getTripFromRequest,
  // lzwEncode,
  sessionIsInvalid
} from '../util/call-taker'
import { getModuleConfig, Modules } from '../util/config'
import { getActiveItineraries } from '../util/state'

import {routingQuery} from './api'
import {toggleCallHistory} from './call-taker'
import {clearActiveSearch, resetForm, setQueryParam} from './form'

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

    // TODO: fetch trip IDs for day
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

export function saveRequestTrip (request, outbound) {
  return async function (dispatch, getState) {
    const state = getState()
    const { session } = state.callTaker
    if (sessionIsInvalid(session)) return

    const itineraries = getActiveItineraries(state)

    // If plan is not valid, return before persisting trip.
    if (fieldTripPlanIsInvalid(request, itineraries)) return

    // Show a confirmation dialog before overwriting existing plan
    if (!overwriteExistingRequestTripsConfirmed(request, outbound)) return

    // construct data for request to save
    const data = {
      // itins: itineraries.map(createFieldTripItinerarySaveData),
      requestId: request.id,
      sessionId: session.sessionId,
      trip: {
        createdBy: session.username,
        departure: moment(getEarliestStartTime(itineraries)).format('YYYY-MM-DDTHH:mm:ss'),
        // destination: getEndOTPString(),
        // origin: getStartOTPString(),
        passengers: getGroupSize(request),
        queryParams: JSON.stringify(state.otp.currentQuery),
        requestOrder: outbound ? 0 : 1
      }
    }
    console.log(data)

    // do actual saving of trip
    // const res = await fetch(`${state.otp.config.datastoreUrl}/calltaker/call`,
    //   {method: 'POST', body: makeFieldTripData(request)}
    // )
    //
    // this.serverRequest('/fieldtrip/newTrip', 'POST', data, _.bind(function(data) {
    //     if(data === -1) {
    //         otp.widgets.Dialogs.showOkDialog("This plan could not be saved due to a lack of capacity on one or more vehicles. Please re-plan your trip.", "Cannot Save Plan");
    //     }
    //     else successCallback.call(this, data);
    // }, this));
  }
}

/**
 * Checks that a group plan is valid for a given request, i.e., that it occurs
 * on the requested travel date.
 * @param  request   field trip request
 * @param  itineraries the currently active itineraries
 * @return true if invalid
 */
function fieldTripPlanIsInvalid (request, itineraries) {
  if (!itineraries || itineraries.length === 0) {
    return {
      isValid: false,
      message: 'No active plan to save'
    }
  }

  const earliestStartTime = getEarliestStartTime(itineraries)

  // FIXME: add back in offset?
  const planDeparture = moment(earliestStartTime) // .add('hours', otp.config.timeOffset)
  const requestDate = moment(request.travelDate)

  if (
    planDeparture.date() !== requestDate.date() ||
    planDeparture.month() !== requestDate.month() ||
    planDeparture.year() !== requestDate.year()
  ) {
    alert(
      `Planned trip date (${planDeparture.format('MM/DD/YYYY')}) is not the requested day of travel (${requestDate.format('MM/DD/YYYY')})`
    )
    return true
  }

  // FIXME More checks? E.g., origin/destination

  return false
}

function getEarliestStartTime (itineraries) {
  return itineraries.reduce(
    (earliestStartTime, itinerary) =>
      Math.min(earliestStartTime, itinerary.startTime),
    Number.POSITIVE_INFINITY
  )
}

function overwriteExistingRequestTripsConfirmed (request, outbound) {
  const type = outbound ? 'outbound' : 'inbound'
  const preExistingTrip = getTripFromRequest(request, outbound)
  if (preExistingTrip) {
    const msg = `This action will overwrite a previously planned ${type} itinerary for this request. Do you wish to continue?`
    return confirm(msg)
  }
  return true
}

// function createFieldTripItinerarySaveData (itinerary) {
//   const result = {}
//   result.passengers = itinerary.fieldTripGroupSize
//   data['itins['+i+'].itinData'] = lzwEncode(JSON.stringify(itin.itinData));
//   data['itins['+i+'].timeOffset'] = otp.config.timeOffset || 0;
//
//   var legs = itin.getTransitLegs();
//
//   for(var l = 0; l < legs.length; l++) {
//       var leg = legs[l];
//       var routeName = (leg.routeShortName !== null ? ('(' + leg.routeShortName + ') ') : '') + (leg.routeLongName || "");
//       var tripHash = this.tripHashLookup[leg.tripId];
//
//       data['gtfsTrips['+i+']['+l+'].depart'] = moment(leg.startTime).format("HH:mm:ss");
//       data['gtfsTrips['+i+']['+l+'].arrive'] = moment(leg.endTime).format("HH:mm:ss");
//       data['gtfsTrips['+i+']['+l+'].agencyAndId'] = leg.tripId;
//       data['gtfsTrips['+i+']['+l+'].tripHash'] = tripHash;
//       data['gtfsTrips['+i+']['+l+'].routeName'] = routeName;
//       data['gtfsTrips['+i+']['+l+'].fromStopIndex'] = leg.from.stopIndex;
//       data['gtfsTrips['+i+']['+l+'].toStopIndex'] = leg.to.stopIndex;
//       data['gtfsTrips['+i+']['+l+'].fromStopName'] = leg.from.name;
//       data['gtfsTrips['+i+']['+l+'].toStopName'] = leg.to.name;
//       data['gtfsTrips['+i+']['+l+'].headsign'] = leg.headsign;
//       data['gtfsTrips['+i+']['+l+'].capacity'] = itin.getModeCapacity(leg.mode);
//       if(leg.tripBlockId) data['gtfsTrips['+i+']['+l+'].blockId'] = leg.tripBlockId;
//   }
//   return result
// }

export function planTrip (request, outbound) {
  return function (dispatch, getState) {
    dispatch(setGroupSize(getGroupSize(request)))
    // Construct params from request details
    if (outbound) dispatch(planOutbound(request))
    else dispatch(planInbound(request))
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
      time: moment(request.arriveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(makeFieldTripPlanRequests(request))
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
      time: moment(request.leaveDestinationTime).format(OTP_API_TIME_FORMAT),
      ...locations
    }
    dispatch(setQueryParam(queryParams))
    dispatch(makeFieldTripPlanRequests(request))
  }
}

/**
 * Makes appropriate OTP requests until enough itineraries have been found to
 * accomodate the field trip group.
 */
function makeFieldTripPlanRequests (request) {
  return async function (dispatch, getState) {
    const fieldTripModuleConfig = getModuleConfig(
      getState(),
      Modules.FIELD_TRIP
    )
    // set numItineraries param for field trip requests
    dispatch(setQueryParam({ numItineraries: 1 }))

    // initialize the remaining group size to be the total group size
    let remainingGroupSize = getGroupSize(request)

    // create a new searchId to use for making all requests
    const searchId = randId()

    // track number of requests made such that endless requesting doesn't occur
    const maxRequests = fieldTripModuleConfig?.maxRequests || 10
    let numRequests = 0

    // make requests until
    while (remainingGroupSize > 0) {
      numRequests++
      if (numRequests > maxRequests) {
        // max number of requests exceeded. Show error.
        alert('Number of trip requests exceeded without valid results')
        return dispatch(clearActiveSearch())
      }

      // make next query
      await dispatch(routingQuery(searchId))

      // obtain trip hashes from OTP Index API
      const state = getState()
      await getTripHashesFromActiveItineraries(state)

      // check trip validity and calculate itinerary capacity

      // calculate remaining group size
      // FIXME: actually implement and remove lint-passing placeholder
      remainingGroupSize -= 12345

      // set parameters for next iteration
    }
  }
}

function getTripHashesFromActiveItineraries (state) {
  return async function (dispatch, getState) {
    const activeItineraries = getActiveItineraries(state)
    const tripHashesToRequest = []
    activeItineraries.forEach(itinerary => {
      itinerary.legs.forEach(leg => {

      })
    })

    return Promise.all(tripHashesToRequest.map(tripId => {
      return fetch()
    }))
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

/**
 * Clears and resets all relevant data after a field trip loses focus (upon
 * closing the field trip details window)
 */
export function clearActiveFieldTrip () {
  return function (dispatch, getState) {
    dispatch(setActiveFieldTrip(null))
    dispatch(clearActiveSearch())
    dispatch(setQueryParam({ numItineraries: undefined }))
  }
}
