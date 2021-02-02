import { getUrlParams, planParamsToQueryAsync } from '@opentripplanner/core-utils/lib/query'
import { OTP_API_DATE_FORMAT, OTP_API_TIME_FORMAT } from '@opentripplanner/core-utils/lib/time'
import moment from 'moment'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {routingQuery} from './api'
import {setQueryParam} from './form'
import {getGroupSize, getTrip, searchToQuery} from '../util/call-taker'
import {URL_ROOT} from '../util/constants'
import {getTimestamp} from '../util/state'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const endingCall = createAction('END_CALL')
const receivedCalls = createAction('RECEIVED_CALLS')
const receivedQueries = createAction('RECEIVED_QUERIES')
const requestingCalls = createAction('REQUESTING_CALLS')
const requestingQueries = createAction('REQUESTING_QUERIES')
const storeSession = createAction('STORE_SESSION')

const receivedFieldTrips = createAction('RECEIVED_FIELD_TRIPS')
const requestingFieldTrips = createAction('REQUESTING_FIELD_TRIPS')
const receivedFieldTripDetails = createAction('RECEIVED_FIELD_TRIP_DETAILS')
const requestingFieldTripDetails = createAction('REQUESTING_FIELD_TRIP_DETAILS')

/// PUBLIC ACTIONS

export const beginCall = createAction('BEGIN_CALL')
export const setFieldTripFilter = createAction('SET_FIELD_TRIP_FILTER')
export const setActiveFieldTrip = createAction('SET_ACTIVE_FIELD_TRIP')
export const setGroupSize = createAction('SET_GROUP_SIZE')
export const toggleCallHistory = createAction('TOGGLE_CALL_HISTORY')
export const toggleFieldTrips = createAction('TOGGLE_FIELD_TRIPS')

/**
 * End the active call and store the queries made during the call.
 */
export function endCall () {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {activeCall, session} = callTaker
    if (sessionIsInvalid(session)) return
    // Make POST request to store call.
    const callData = new FormData()
    callData.append('sessionId', session.sessionId)
    callData.append('call.startTime', activeCall.startTime)
    callData.append('call.endTime', getTimestamp())
    fetch(`${otp.config.datastoreUrl}/calltaker/call`,
      {method: 'POST', body: callData}
    )
      .then(res => res.json())
      .then(id => {
        // Inject call ID into active call and save queries.
        dispatch(saveQueriesForCall({...activeCall, id}))
        dispatch(fetchCalls())
      })
      .catch(err => {
        console.error(err)
        alert(`Could not save call: ${JSON.stringify(err)}`)
      })
    dispatch(endingCall())
  }
}

/**
 * Initialize the Call Taker and Field Trip modules by checking the session
 * query param against sessions in the datastore backend or initializing a new
 * session via Trinet.
 */
export function initializeModules () {
  return function (dispatch, getState) {
    const {datastoreUrl, trinetReDirect} = getState().otp.config
    // Initialize session if datastore enabled.
    if (datastoreUrl && trinetReDirect) {
      // TODO: Generalize for non-TriNet instances.
      const sessionId = getUrlParams().sessionId
      if (sessionId) {
        // Initialize the session if found in URL query params.
        dispatch(checkSession(datastoreUrl, sessionId))
      } else {
        // No sessionId was passed in, so we must request one from server.
        newSession(datastoreUrl, trinetReDirect, URL_ROOT)
      }
    }
  }
}

/**
 * Handle initializing a new Trinet session by redirecting to Trinet auth and
 * returning once authenticated successfully.
 */
function newSession (datastoreUrl, verifyLoginUrl, redirect) {
  fetch(datastoreUrl + '/auth/newSession')
    .then(res => res.json())
    .then(data => {
      const {sessionId: session} = data
      const windowUrl = `${verifyLoginUrl}?${qs.stringify({session, redirect})}`
      // Redirect to login url.
      window.location = windowUrl
    })
    .catch(error => {
      console.error('newSession error', error)
    })
}

/**
 * Check that a particular session ID is valid and store resulting session
 * data.
 */
function checkSession (datastoreUrl, sessionId) {
  return function (dispatch, getState) {
    fetch(datastoreUrl + `/auth/checkSession?sessionId=${sessionId}`)
      .then(res => res.json())
      .then(session => dispatch(storeSession({session})))
      .catch(error => {
        dispatch(storeSession({session: null}))
        alert(`Error establishing auth session: ${JSON.stringify(error)}`)
      })
  }
}

/**
 * Fetch latest calls for a particular session.
 */
export function fetchCalls () {
  return function (dispatch, getState) {
    dispatch(requestingCalls())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    const limit = 30
    fetch(`${datastoreUrl}/calltaker/call?${qs.stringify({limit, sessionId})}`)
      .then(res => res.json())
      .then(calls => dispatch(receivedCalls({calls})))
      .catch(err => alert(`Error fetching calls: ${JSON.stringify(err)}`))
  }
}

/**
 * Fetch all field trip requests (as summaries).
 */
export function fetchFieldTrips () {
  return function (dispatch, getState) {
    dispatch(requestingFieldTrips())
    const {callTaker, otp} = getState()
    if (sessionIsInvalid(callTaker.session)) return
    const {datastoreUrl} = otp.config
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/fieldtrip/getRequestsSummary?${qs.stringify({sessionId})}`)
      .then(res => res.json())
      .then(fieldTrips => dispatch(receivedFieldTrips({fieldTrips})))
      .catch(err => alert(`Error fetching field trips: ${JSON.stringify(err)}`))
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
    console.log(callTaker.session)
    const {sessionId, username} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('note.note', note.note)
    queryData.append('note.type', note.type)
    queryData.append('note.userName', username)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/addNote`,
      {method: 'POST', body: queryData}
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
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('noteId', noteId)
    return fetch(`${datastoreUrl}/fieldtrip/deleteNote`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error deleting field trip note: ${JSON.stringify(err)}`)
      })
  }
}

function processPlan (tripPlan, restoring) {
  if (updateActiveOnly) {
    var itinIndex = itinWidget.activeIndex
    tripPlan.itineraries[0].groupSize = groupPlan.itineraries[itinIndex].groupSize
    itinWidget.updateItineraries(tripPlan.itineraries)
    updateActiveOnly = false
    drawItinerary(tripPlan.itineraries[0])
    return
  }

  if (groupPlan == null) {
    groupPlan = new otp.modules.planner.TripPlan(null, _.extend(tripPlan.queryParams, { groupSize : groupSize }))
  }

  if (itinWidget == null) createItinerariesWidget()

  var itin = tripPlan.itineraries[0]
  var capacity = itin.getGroupTripCapacity()

  // if this itin shares a vehicle trip with another one already in use, only use the remainingCapacity (as set in checkTripValidity())
  if (itinCapacity) capacity = Math.min(capacity, itinCapacity)

  groupPlan.addItinerary(itin)

  var transitLegs = itin.getTransitLegs()
  for (var i = 0; i < transitLegs.length; i++) {
    var leg = transitLegs[i]
    bannedSegments.push({
      tripId : leg.tripId,
      fromStopIndex : leg.from.stopIndex,
      toStopIndex : leg.to.stopIndex,
    })
  }

  setBannedTrips()

  if (currentGroupSize > capacity) {
    // group members remain. plan another trip
    currentGroupSize -= capacity
    itin.groupSize = capacity
    //console.log("remaining: "+currentGroupSize)
    itinCapacity = null
    planTrip()
  } else {
    // we're done. show the results
    itin.groupSize = currentGroupSize
    showResults()
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
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('notes', submitterNotes)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/editSubmitterNotes`,
      {method: 'POST', body: queryData}
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
    const preExistingTrip = getTrip(request, outbound)
    if (preExistingTrip) {
      const msg = `This action will overwrite a previously planned ${type} itinerary for this request. Do you wish to continue?`
      if (!confirm(msg)) return
    }
    dispatch(saveTrip(request, requestOrder))
  }
}

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

  return { isValid: true }
}

function saveTrip (request, requestOrder) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId, username} = callTaker.session
    const data = {
      sessionId: sessionId,
      requestId: request.id,
      'trip.requestOrder': requestOrder,
      'trip.origin': getStartOTPString(),
      'trip.destination': getEndOTPString(),
      'trip.createdBy': username,
      'trip.passengers': groupSize,
      'trip.departure': moment(groupPlan.earliestStartTime).add('hours', otp.config.timeOffset).format('YYYY-MM-DDTHH:mm:ss'),
      'trip.queryParams': JSON.stringify(groupPlan.queryParams)
    }

    for (let i = 0; i < groupPlan.itineraries.length; i++) {
      const itin = groupPlan.itineraries[i]
      data[`itins[${i}].passengers`] = itin.groupSize
      data[`itins[${i}].itinData`] = otp.util.Text.lzwEncode(JSON.stringify(itin.itinData))
      data[`itins[${i}].timeOffset`] = otp.config.timeOffset || 0

      const legs = itin.getTransitLegs()

      for (let l = 0; l < legs.length; l++) {
        const leg = legs[l]
        const routeName = (leg.routeShortName !== null ? ('(' + leg.routeShortName + ') ') : '') + (leg.routeLongName || '')
        const tripHash = tripHashLookup[leg.tripId]

        data[`gtfsTrips[${i}][${l}].depart`] = moment(leg.startTime).format('HH:mm:ss')
        data[`gtfsTrips[${i}][${l}].arrive`] = moment(leg.endTime).format('HH:mm:ss')
        data[`gtfsTrips[${i}][${l}].agencyAndId`] = leg.tripId
        data[`gtfsTrips[${i}][${l}].tripHash`] = tripHash
        data[`gtfsTrips[${i}][${l}].routeName`] = routeName
        data[`gtfsTrips[${i}][${l}].fromStopIndex`] = leg.from.stopIndex
        data[`gtfsTrips[${i}][${l}].toStopIndex`] = leg.to.stopIndex
        data[`gtfsTrips[${i}][${l}].fromStopName`] = leg.from.name
        data[`gtfsTrips[${i}][${l}].toStopName`] = leg.to.name
        data[`gtfsTrips[${i}][${l}].headsign`] = leg.headsign
        data[`gtfsTrips[${i}][${l}].capacity`] = itin.getModeCapacity(leg.mode)
        if (leg.tripBlockId) data[`gtfsTrips[${i}][${l}].blockId`] = leg.tripBlockId
      }
    }
    return fetch(`${datastoreUrl}/fieldtrip/newTrip`,
      {method: 'POST', body: data}
    )
      .then((res) => {
        console.log(res)
        if (res === -1) {
          alert('This plan could not be saved due to a lack of capacity on one or more vehicles. Please re-plan your trip.')
        } else {
          dispatch(fetchFieldTripDetails(request.id))
        }
      })
      .catch(err => {
        alert(`Error saving trip: ${JSON.stringify(err)}`)
      })
  }
}

export function planTrip (request, outbound) {
  return async function (dispatch, getState) {
    dispatch(setGroupSize(getGroupSize(request)))
    const trip = getTrip(request, outbound)
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
 * Set group size for a field trip request.
 */
export function setRequestGroupSize (request, groupSize) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('numStudents', groupSize.numStudents)
    queryData.append('numFreeStudents', groupSize.numFreeStudents)
    queryData.append('numChaperones', groupSize.numChaperones)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/setRequestGroupSize`,
      {method: 'POST', body: queryData}
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
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('classpassId', paymentInfo.classpassId)
    queryData.append('paymentPreference', paymentInfo.paymentPreference)
    queryData.append('ccType', paymentInfo.ccType)
    queryData.append('ccName', paymentInfo.ccName)
    queryData.append('ccLastFour', paymentInfo.ccLastFour)
    queryData.append('checkNumber', paymentInfo.checkNumber)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/setRequestPaymentInfo`,
      {method: 'POST', body: queryData}
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
    const queryData = new FormData()
    queryData.append('sessionId', sessionId)
    queryData.append('status', status)
    queryData.append('requestId', request.id)
    return fetch(`${datastoreUrl}/fieldtrip/setRequestStatus`,
      {method: 'POST', body: queryData}
    )
      .then(() => dispatch(fetchFieldTripDetails(request.id)))
      .catch(err => {
        alert(`Error setting request status: ${JSON.stringify(err)}`)
      })
  }
}

/**
 * @return {boolean} - whether a calltaker session is invalid
 */
function sessionIsInvalid (session) {
  if (!session || !session.sessionId) {
    console.error('No valid OTP datastore session found.')
    return true
  }
  return false
}

/**
 * Store the trip queries made over the course of a call (to be called when the
 * call terminates).
 */
export function saveQueriesForCall (call) {
  return function (dispatch, getState) {
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    if (!call) {
      alert(`Could not find call for ${call.id}. Cancelling save queries request.`)
      return
    }
    return Promise.all(call.searches.map(searchId => {
      const search = otp.searches[searchId]
      const query = searchToQuery(search, call, otp.config)
      const {sessionId} = callTaker.session
      const queryData = new FormData()
      queryData.append('sessionId', sessionId)
      queryData.append('query.queryParams', query.queryParams)
      queryData.append('query.fromPlace', query.fromPlace)
      queryData.append('query.toPlace', query.toPlace)
      queryData.append('query.timeStamp', query.timeStamp)
      queryData.append('query.call.id', call.id)
      return fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}`,
        {method: 'POST', body: queryData}
      )
        .then(res => res.json())
        .catch(err => {
          alert(`Error storing call queries: ${JSON.stringify(err)}`)
        })
    }))
  }
}

/**
 * Fetch the trip queries that were made during a particular call.
 */
export function fetchQueries (callId) {
  return function (dispatch, getState) {
    dispatch(requestingQueries())
    const {callTaker, otp} = getState()
    const {datastoreUrl} = otp.config
    if (sessionIsInvalid(callTaker.session)) return
    const {sessionId} = callTaker.session
    fetch(`${datastoreUrl}/calltaker/callQuery?sessionId=${sessionId}&call.id=${callId}`)
      .then(res => res.json())
      .then(queries => {
        dispatch(receivedQueries({callId, queries}))
      })
      .catch(err => {
        alert(`Error fetching queries: ${JSON.stringify(err)}`)
      })
  }
}
