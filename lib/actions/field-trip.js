import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import { planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import { randId } from '@opentripplanner/core-utils/lib/storage'
import moment from 'moment'
import { serialize } from 'object-to-formdata'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {
  getFieldTripGroupCapacityForMode,
  getFormattedRequestTravelDate,
  getGroupSize,
  getTripFromRequest,
  // lzwEncode,
  sessionIsInvalid
} from '../util/call-taker'
import { getModuleConfig, Modules } from '../util/config'
import { getActiveItineraries, getActiveSearch } from '../util/state'

import {routingQuery, setActiveItineraries, setPendingRequests} from './api'
import {toggleCallHistory} from './call-taker'
import {clearActiveSearch, resetForm, setQueryParam} from './form'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const receivedFieldTrips = createAction('RECEIVED_FIELD_TRIPS')
const receivedTravelDateTrips = createAction('RECEIVED_TRAVEL_DATE_TRIPS')
const receiveTripHash = createAction('RECEIVE_TRIP_HASH')
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
      date: getFormattedRequestTravelDate(request),
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
      date: getFormattedRequestTravelDate(request),
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
    const prePlanState = getState()
    const fieldTripModuleConfig = getModuleConfig(
      prePlanState,
      Modules.FIELD_TRIP
    )

    // request other known trip IDs that other field trips are using on the
    // field trip request date
    try {
      await getTripIdsForTravelDate(dispatch, prePlanState, request)
    } catch (e) {
      alert(
        `Error fetching trips for field trip travel date: ${JSON.stringify(e)}`
      )
      return
    }

    // create a new searchId to use for making all requests
    const searchId = randId()

    // set numItineraries param for field trip requests
    dispatch(setQueryParam({ numItineraries: 1 }))

    // create a new set to keep track of trips that should be banned
    const bannedTrips = new Set()

    // track number of requests made such that endless requesting doesn't occur
    const maxRequests = fieldTripModuleConfig?.maxRequests || 10
    let numRequests = 0

    let shouldContinueSearching = true

    // make requests until enough itineraries have been found to accomodate
    // group
    while (shouldContinueSearching) {
      numRequests++
      if (numRequests > maxRequests) {
        // max number of requests exceeded. Show error.
        alert('Number of trip requests exceeded without valid results')
        return doFieldTripPlanRequestCleanup(dispatch, searchId)
      }

      // make next query. The second param instructs the action/reducer whether
      // or not to override previous search results in the state.
      await dispatch(routingQuery(searchId, numRequests > 1))

      // set the pending amount of requests to be 2 so that there will always
      // seem to be potentially additional requests that have to be made. If
      // there aren't after making this next request, the pending amount will
      // be set to 0. This needs to happen after the routingQuery so the search
      // is defined.
      dispatch(setPendingRequests({ searchId, pending: 2 }))

      // obtain trip hashes from OTP Index API
      await getTripHashesFromActiveItineraries()

      // check trip validity and calculate itinerary capacity
      const {
        assignedItinerariesByResponse,
        remainingGroupSize,
        tripsToBanInSubsequentSearches
      } = checkValidityAndCapacity(
        getState(),
        request
      )

      // always update itineraries on each itineration
      dispatch(setActiveItineraries({
        assignedItinerariesByResponse,
        searchId
      }))

      if (remainingGroupSize <= 0) {
        // All members of the field trip group have been assigned!
        shouldContinueSearching = false
        doFieldTripPlanRequestCleanup(dispatch, searchId)
      } else {
        // Not enough acceptable itineraries have been generated. Request more.

        // Update banned trips
        tripsToBanInSubsequentSearches.forEach(tripId => {
          bannedTrips.add(tripId)
        })
        dispatch(setQueryParam({ bannedTrips: [...bannedTrips].join(',') }))
      }
    }
  }
}

async function getTripIdsForTravelDate (dispatch, state, request) {
  const {datastoreUrl} = state.otp.config
  const {sessionId} = state.callTaker.session
  const formattedTravelDate = getFormattedRequestTravelDate(request, 'MM/DD/YYYY')
  const params = {
    date: formattedTravelDate,
    sessionId
  }

  const res = await fetch(
    `${datastoreUrl}/fieldtrip/getTrips?${qs.stringify(params)}`
  )
  const fieldTrips = await res.json()

  // add passengers and converted tripId to trips
  const trips = []
  fieldTrips.forEach(fieldTrip => {
    fieldTrip.groupItineraries.forEach(groupItinerary => {
      groupItinerary.trips.forEach(gtfsTrip => {
        // tripIds still stored as 'agencyAndId' in DB, so convert them to
        // be compatible with OTP responses
        gtfsTrip.tripId = gtfsTrip.agencyAndId.replace('_', ':')
        // Add passengers to each trip from group itinerary
        gtfsTrip.passengers = groupItinerary.passengers
        trips.push(gtfsTrip)
      })
    })
  })
  await dispatch(receivedTravelDateTrips(trips))
}

function getTripHashesFromActiveItineraries () {
  return function (dispatch, getState) {
    const state = getState()
    const activeItineraries = getActiveItineraries(state)
    const { tripHashLookup } = state.otp.callTaker.fieldTrip
    const tripHashesToRequest = []
    activeItineraries.forEach(itinerary => {
      itinerary.legs.forEach(leg => {
        if (leg.tripId && !tripHashLookup[leg.tripId]) {
          tripHashesToRequest.push(leg.tripId)
        }
      })
    })

    const api = state.config.api
    const baseUrl = `${api.host}${api.port ? ':' + api.port : ''}${api.path}`

    return Promise.all(tripHashesToRequest.map(tripId => {
      return fetch(`${baseUrl}/index/trips/${tripId}/semanticHash`)
        .then(res => res.text())
        .then(hash => dispatch(receiveTripHash({ hash, tripId })))
    }))
  }
}

function checkValidityAndCapacity (state, request) {
  const fieldTripModuleConfig = getModuleConfig(state, Modules.FIELD_TRIP)
  const minimumAllowableRemainingCapacity =
    fieldTripModuleConfig?.minimumAllowableRemainingCapacity || 10
  const { travelDateTripsInUse, tripHashLookup } = state.callTaker.fieldTrip
  const activeSearch = getActiveSearch(state)

  // initialize the remaining group size to be the total group size
  let remainingGroupSize = getGroupSize(request)
  const assignedItinerariesByResponse = {}
  const tripsToBanInSubsequentSearches = []

  // iterate through responses as we need to keep track of the response that
  // each itinerary came from so that they can be updated
  activeSearch.response.forEach((response, responseIdx) => {
    if (!response.plan) {
      // An error might have occurred!
      return
    }

    // iterate through itineraries to check validity and assign field trip
    // groups
    response.plan.itineraries.forEach((itinerary, idx) => {
      let itineraryCapacity = Number.POSITIVE_INFINITY

      // check each individual trip to see if there aren't any conflicts
      itinerary.legs.forEach(leg => {
        // non-transit legs have infinite capacity
        if (!isTransit(leg.mode)) {
          return
        }
        const { tripId } = leg

        // this variable is used to track how many other field trips are using a
        // particular trip
        let capacityInUse = 0

        // iterate over trips that are already being used by other field trips
        travelDateTripsInUse.forEach(tripInUse => {
          // check if the trip is being used by another field trip
          let sameVehicleTrip = false
          if (tripId in tripHashLookup && tripInUse.tripHash) {
            // use the trip hashes if available
            sameVehicleTrip = (tripHashLookup[tripId] === tripInUse.tripHash)
          } else {
            // as fallback, compare the tripId strings
            sameVehicleTrip = (tripId === tripInUse.tripId)
          }
          // not used by another vehicle, so not used by this other field trip
          if (!sameVehicleTrip) return

          // check if the stop ranges overlap. It is OK if one field trip begins
          // where the other ends.
          if (
            leg.from.stopIndex >= tripInUse.toStopIndex ||
              leg.to.stopIndex <= tripInUse.fromStopIndex
          ) {
            // legs do not overlap, so not used by this other field trip
            return
          }

          // ranges overlap! Add number of passengers on this other field trip
          // to total capacity in use
          capacityInUse += tripInUse.passengers
        })

        // check if the remaining capacity on this trip is enough to allow more
        // field trip passengers on board
        const legModeCapacity = getFieldTripGroupCapacityForMode(
          fieldTripModuleConfig,
          leg.mode
        )
        let remainingTripCapacity = legModeCapacity - capacityInUse
        if (remainingTripCapacity < minimumAllowableRemainingCapacity) {
          // This trip is already too "full" to allow any addition field trips
          // on board. Ban this trip in future searches and don't use this
          // itinerary in final results (set trip and itinerary capacity to 0).
          remainingTripCapacity = 0
        }

        // always ban trips found in itineraries so that subsequent searches
        // don't encounter them.
        // TODO: a more advanced way of doing things might be to ban trip
        //        sequences to not find the same exact sequence, but also
        //        individual trips that are too full.
        tripsToBanInSubsequentSearches.push(tripId)

        itineraryCapacity = Math.min(itineraryCapacity, remainingTripCapacity)
      })

      if (itineraryCapacity > 0) {
        // itinerary is possible, add to list and update remaining group size.
        // A field trip response is gauranteed to have only one itinerary, so it
        // ok to set the itinerary by response as an array with a single
        // itinerary.
        assignedItinerariesByResponse[responseIdx] = [{
          ...itinerary,
          fieldTripGroupSize: Math.min(itineraryCapacity, remainingGroupSize)
        }]
        remainingGroupSize -= itineraryCapacity
      }
    })
  })

  return {
    assignedItinerariesByResponse,
    remainingGroupSize,
    tripsToBanInSubsequentSearches
  }
}

function doFieldTripPlanRequestCleanup (dispatch, searchId) {
  // set pending searches to 0 to indicate searching is finished
  dispatch(setPendingRequests({ searchId, pending: 0 }))
  // clear banned trips query param
  dispatch(setQueryParam({ bannedTrips: undefined }))
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
