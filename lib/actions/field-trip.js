import { isTransit } from '@opentripplanner/core-utils/lib/itinerary'
import {
  getRoutingParams,
  planParamsToQueryAsync
} from '@opentripplanner/core-utils/lib/query'
import {
  OTP_API_DATE_FORMAT,
  OTP_API_TIME_FORMAT
} from '@opentripplanner/core-utils/lib/time'
import { randId } from '@opentripplanner/core-utils/lib/storage'
import moment from 'moment'
import { serialize } from 'object-to-formdata'
import qs from 'qs'
import { createAction } from 'redux-actions'

import {
  getGroupSize,
  getTripFromRequest,
  lzwEncode,
  sessionIsInvalid
} from '../util/call-taker'
import { getModuleConfig, Modules } from '../util/config'
import { getActiveItineraries, getActiveSearch } from '../util/state'

import {routingQuery, setActiveItineraries, setPendingRequests} from './api'
import {toggleCallHistory} from './call-taker'
import {clearActiveSearch, resetForm, setQueryParam} from './form'

if (typeof (fetch) === 'undefined') require('isomorphic-fetch')

/// PRIVATE ACTIONS

const receivedTravelDateTrips = createAction('RECEIVED_TRAVEL_DATE_TRIPS')
const receiveTripHash = createAction('RECEIVE_TRIP_HASH')
const requestingFieldTrips = createAction('REQUESTING_FIELD_TRIPS')
const receivedFieldTripDetails = createAction('RECEIVED_FIELD_TRIP_DETAILS')
const requestingFieldTripDetails = createAction('REQUESTING_FIELD_TRIP_DETAILS')

// PUBLIC ACTIONS
export const receivedFieldTrips = createAction('RECEIVED_FIELD_TRIPS')
export const setFieldTripFilter = createAction('SET_FIELD_TRIP_FILTER')
export const setActiveFieldTrip = createAction('SET_ACTIVE_FIELD_TRIP')
export const setGroupSize = createAction('SET_GROUP_SIZE')
export const toggleFieldTrips = createAction('TOGGLE_FIELD_TRIPS')

// these are date/time formats specifically used by otp-datastore
const FIELD_TRIP_DATE_FORMAT = 'MM/DD/YYYY'
const FIELD_TRIP_DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss'
const FIELD_TRIP_TIME_FORMAT = 'HH:mm:ss'

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

/**
 * Validates and saves the currently active field trip itineraries to the
 * appropriate inbound or outbound trip of a field trip request.
 *
 * @param  {Object} request  The field trip request
 * @param  {boolean} outbound If true, save the current itineraries to the
 *                            outbound field trip journey.
 */
export function saveRequestTripItineraries (request, outbound) {
  return async function (dispatch, getState) {
    const state = getState()
    const { session } = state.callTaker
    if (sessionIsInvalid(session)) return

    const itineraries = getActiveItineraries(state)

    // If plan is not valid, return before persisting trip.
    if (fieldTripPlanIsInvalid(request, itineraries)) return

    // Show a confirmation dialog before overwriting existing plan
    if (!overwriteExistingRequestTripsConfirmed(request, outbound)) return

    // Send data to server for saving.
    let text
    try {
      const res = await fetch(
        `${state.otp.config.datastoreUrl}/fieldtrip/newTrip`,
        {
          method: 'POST',
          body: makeSaveFieldTripItinerariesData(request, outbound, state)
        }
      )
      text = await res.text()
    } catch (e) {
      return alert(`Failed to save itineraries: ${JSON.stringify(e)}`)
    }

    if (text === '-1') {
      return alert('Cannot Save Plan: This plan could not be saved due to a lack of capacity on one or more vehicles. Please re-plan your trip.')
    }

    dispatch(fetchFieldTripDetails(request.id))
  }
}

/**
 * Checks that a group plan is valid for a given request, i.e., that it occurs
 * on the requested travel date.
 *
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
      `Planned trip date (${planDeparture.format(FIELD_TRIP_DATE_FORMAT)}) is not the requested day of travel (${requestDate.format(FIELD_TRIP_DATE_FORMAT)})`
    )
    return true
  }

  return false
}

/**
 * Returns the earliest start time (in unix epoch milliseconds) in the given
 * itineraries.
 */
function getEarliestStartTime (itineraries) {
  return itineraries.reduce(
    (earliestStartTime, itinerary) =>
      Math.min(earliestStartTime, itinerary.startTime),
    Number.POSITIVE_INFINITY
  )
}

/**
 * Returns true if the user confirms the overwrite of an existing set of
 * itineraries planned for the inbound or outbound part of the field trip.
 *
 * @param  {Object} request  The field trip request
 * @param  {boolean} outbound If true, save the current itineraries to the
 *                            outbound field trip journey.
 */
function overwriteExistingRequestTripsConfirmed (request, outbound) {
  const type = outbound ? 'outbound' : 'inbound'
  const preExistingTrip = getTripFromRequest(request, outbound)
  if (preExistingTrip) {
    const msg = `This action will overwrite a previously planned ${type} itinerary for this request. Do you wish to continue?`
    return confirm(msg)
  }
  return true
}

/**
 * Constructs data used to save a set of itineraries for the inbound or outbound
 * part of the field trip.
 */
function makeSaveFieldTripItinerariesData (request, outbound, state) {
  const { fieldTrip, session } = state.callTaker
  const { tripHashLookup } = fieldTrip
  const { config, currentQuery } = state.otp
  const fieldTripModuleConfig = getModuleConfig(state, Modules.FIELD_TRIP)
  const itineraries = getActiveItineraries(state)

  // initialize base object
  const data = {
    gtfsTrips: [],
    itins: [],
    requestId: request.id,
    sessionId: session.sessionId,
    trip: {
      createdBy: session.username,
      departure: moment(getEarliestStartTime(itineraries))
        .format(FIELD_TRIP_DATE_TIME_FORMAT),
      destination: getOtpLocationString(currentQuery.from),
      origin: getOtpLocationString(currentQuery.to),
      passengers: getGroupSize(request),
      queryParams: JSON.stringify(getRoutingParams(config, currentQuery)),
      requestOrder: outbound ? 0 : 1
    }
  }

  // iterate through itineraries to construct itinerary and gtfsTrip data to
  // save the itineraries to otp-datastore.
  itineraries.forEach((itinerary, itinIdx) => {
    const itineraryDataToSave = {
      itinData: lzwEncode(JSON.stringify(itinerary)),
      passengers: itinerary.fieldTripGroupSize,
      timeOffset: 0
    }

    const gtfsTripsForItinerary = []
    itinerary.legs.filter(leg => isTransit(leg.mode))
      .forEach(leg => {
        let routeName = leg.routeShortName
          ? `(${leg.routeShortName}) `
          : ''
        routeName = `${routeName}${leg.routeLongName}`
        const gtfsTrip = {
          depart: moment(leg.startTime).format(FIELD_TRIP_TIME_FORMAT),
          arrive: moment(leg.endTime).format(FIELD_TRIP_TIME_FORMAT),
          agencyAndId: leg.tripId,
          tripHash: tripHashLookup[leg.tripId],
          routeName,
          fromStopIndex: leg.from.stopIndex,
          toStopIndex: leg.to.stopIndex,
          fromStopName: leg.from.name,
          toStopName: leg.to.name,
          headsign: leg.headsign,
          capacity: getFieldTripGroupCapacityForMode(
            fieldTripModuleConfig,
            leg.mode
          )
        }
        if (leg.tripBlockId) gtfsTrip.blockId = leg.tripBlockId
        gtfsTripsForItinerary.push(gtfsTrip)
      })

    data.itins.push(itineraryDataToSave)
    data.gtfsTrips.push(gtfsTripsForItinerary)
  })
  return serialize(data, { indices: true })
}

/**
 * Creates an OTP-style location string based on the location name, lat and lon.
 */
function getOtpLocationString (location) {
  const latLonString = `${location.lat},${location.lon}`
  return location.name
    ? `${location.name}::${latLonString}`
    : latLonString
}

/**
 * Begins the process of making trip requests to find suitable itineraries for
 * either an inbound or outbound journey of a field trip.
 */
export function planTrip (request, outbound) {
  return function (dispatch, getState) {
    dispatch(setGroupSize(getGroupSize(request)))
    // Construct params from request details
    if (outbound) dispatch(planOutbound(request))
    else dispatch(planInbound(request))
  }
}

/**
 * Sets the appropriate request parameters for an outbound journey of a field
 * trip.
 */
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

/**
 * Sets the appropriate request parameters for an inbound journey of a field
 * trip.
 */
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
 * accommodate the field trip group. This is done as follows:
 *
 * 1. Fetch a list of all the existing transit trips that already have a field
 *   trip assigned to the trip.
 * 2. In a loop of up to 10 times:
 *   i. Make a trip plan query to OTP for one additional itinerary
 *   ii. Calculate the trip hashes in the resulting itinerary by making requests
 *     to the OTP index API
 *   iii. Assign as many field trip travelers to the resulting itinerary as
 *     possible.
 *   iv. Check if there are still unassigned field trip travelers
 *     a. If there are still more to assign, ban each trip used in this
 *       itinerary in subsequent OTP plan requests.
 *     b. If all travelers have been assigned, exit the loop and cleanup
 */
function makeFieldTripPlanRequests (request) {
  return async function (dispatch, getState) {
    const fieldTripModuleConfig = getModuleConfig(
      getState(),
      Modules.FIELD_TRIP
    )

    // request other known trip IDs that other field trips are using on the
    // field trip request date
    try {
      await dispatch(getTripIdsForTravelDate(request))
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

    // make requests until enough itineraries have been found to accommodate
    // group
    while (shouldContinueSearching) {
      numRequests++
      if (numRequests > maxRequests) {
        // max number of requests exceeded. Show error.
        alert('Number of trip requests exceeded without valid results')
        return dispatch(doFieldTripPlanRequestCleanup(searchId))
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
      await getMissingTripHashesForActiveItineraries()

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
        dispatch(doFieldTripPlanRequestCleanup(searchId))
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

/**
 * Makes a request to get data about other planned field trips happening on a
 * particular date.
 */
function getTripIdsForTravelDate (request) {
  return async function (dispatch, getState) {
    const state = getState()
    const {datastoreUrl} = state.otp.config
    const {sessionId} = state.callTaker.session
    const formattedTravelDate = moment(request.travelDate)
      .format(FIELD_TRIP_DATE_FORMAT)
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
    return dispatch(receivedTravelDateTrips(trips))
  }
}

/**
 * Makes the needed requests to the OTP index API to obtain semantic trip hashes
 * for any tripIds in the active itineraries that haven't already been obtained
 * from the OTP index API.
 */
function getMissingTripHashesForActiveItineraries () {
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

/**
 * Analyzes the current itineraries from each response in the active search to
 * appropriately assign the field trip group to subgroups that use each
 * itinerary according to the capacity available in each itinerary.
 *
 * @return {Object} result
 * @return {Object} result.assignedItinerariesByResponse An Object organized by
 *  response index and list of itineraries that can be used to update the state
 *  with modified itinerary objects that can help display the field trip group
 *  size assigned to each itinerary.
 * @return {Object} result.remainingGroupSize The remaining number of people in
 *  the field trip group that have yet to be assigned to an itinerary.
 * @return {Object} result.tripsToBanInSubsequentSearches An array of strings
 *  representing tripIds that should be added to the list of tripIds to ban when
 *  making requests for additional itineraries from OTP.
 */
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

      // check each individual trip to see if there aren't any trips in this
      // itinerary that are already in use by another field trip
      itinerary.legs.filter(leg => isTransit(leg.mode)).forEach(leg => {
        const { tripId } = leg

        // this variable is used to track how many other field trips are using a
        // particular trip
        let capacityInUse = 0

        // iterate over trips that are already being used by other field trips
        travelDateTripsInUse.forEach(tripInUse => {
          if (!tripsOverlap(leg, tripHashLookup, tripId, tripInUse)) return

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
        // itinerary has capacity, add to list and update remaining group size.
        // A field trip response is guaranteed to have only one itinerary, so it
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

/**
 * Checks whether an existing trip in use by another field trip overlaps with a
 * a trip identified by tripId.
 *
 * @param  leg            The leg information of the trip in the associated
 *                          itinerary
 * @param  tripHashLookup The lookup of trip hashes
 * @param  tripId         The tripId to analyze with respect to a trip in use
 * @param  tripInUse      The trip in use by an existing field trip. This is an
 *                          otp-datastore object.
 * @return                true if the trips overlap
 */
function tripsOverlap (leg, tripHashLookup, tripId, tripInUse) {
  // check if the trip is being used by another field trip
  let sameVehicleTrip = false
  if (tripId in tripHashLookup && tripInUse.tripHash) {
    // use the trip hashes if available
    sameVehicleTrip = (tripHashLookup[tripId] === tripInUse.tripHash)
  } else {
    // as fallback, compare the tripId strings
    sameVehicleTrip = (tripId === tripInUse.tripId)
  }
  // not used by another vehicle, so this trip/vehicle is free to use
  if (!sameVehicleTrip) return false

  // check if the stop ranges overlap. It is OK if one field trip begins
  // where the other ends.
  if (
    leg.from.stopIndex >= tripInUse.toStopIndex ||
      leg.to.stopIndex <= tripInUse.fromStopIndex
  ) {
    // legs do not overlap, so this trip/vehicle is free to use
    return false
  }
  return true
}

// These can be overridden in the field trip module config.
const defaultFieldTripModeCapacities = {
  'TRAM': 80,
  'SUBWAY': 120,
  'RAIL': 80,
  'BUS': 40,
  'FERRY': 100,
  'CABLE_CAR': 20,
  'GONDOLA': 15,
  'FUNICULAR': 20
}
const unknownModeCapacity = 15

/**
 * Calculates the mode capacity based on the field trip module mode capacities
 * (if it exists) or from the above default lookup of mode capacities or if
 * given an unknown mode, then the unknownModeCapacity is returned.
 *
 * @param {Object} fieldTripModuleConfig the field trip module config
 * @param {string} mode the OTP mode
 */
function getFieldTripGroupCapacityForMode (fieldTripModuleConfig, mode) {
  const configModeCapacities = fieldTripModuleConfig?.modeCapacities
  return (configModeCapacities && configModeCapacities[mode]) ||
      defaultFieldTripModeCapacities[mode] ||
      unknownModeCapacity
}

/**
 * Dispatches the appropriate cleanup actions after making requests to find the
 * itineraries for an inbound or outbound field trip journey.
 */
function doFieldTripPlanRequestCleanup (searchId) {
  return function (dispatch, getState) {
    // set pending searches to 0 to indicate searching is finished
    dispatch(setPendingRequests({ searchId, pending: 0 }))
    // clear banned trips query param
    dispatch(setQueryParam({ bannedTrips: undefined }))
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
