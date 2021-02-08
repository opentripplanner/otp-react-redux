import {isTransit} from '@opentripplanner/core-utils/lib/itinerary'

import {getRoutingParams} from '../actions/api'

export const TICKET_TYPES = {
  own_tickets: 'Will use own tickets',
  hop_new: 'Will purchase new Hop Card',
  hop_reload: 'Will reload existing Hop Card'
}

const PAYMENT_PREFS = {
  request_call: 'Call requested at provided phone number',
  phone_cc: 'Will call in credit card info to TriMet',
  fax_cc: 'Will fax credit card info to TriMet',
  mail_check: 'Will mail check to TriMet'
}

const positiveIntInputProps = {
  min: 0,
  step: 1,
  type: 'number'
}

export const GROUP_FIELDS = [
  {inputProps: positiveIntInputProps, fieldName: 'numStudents', label: 'students 7 or older'},
  {inputProps: positiveIntInputProps, fieldName: 'numFreeStudents', label: 'students under 7'},
  {inputProps: positiveIntInputProps, fieldName: 'numChaperones', label: 'chaperones'}
]

export const PAYMENT_FIELDS = [
  {label: 'Payment preference', fieldName: 'paymentPreference', options: PAYMENT_PREFS},
  {label: 'Class Pass Hop Card #', fieldName: 'classpassId'},
  {label: 'Credit card type', fieldName: 'ccType'},
  {label: 'Name on credit card', fieldName: 'ccName'},
  {label: 'Credit card last 4 digits', fieldName: 'ccLastFour'},
  {label: 'Check/Money order number', fieldName: 'checkNumber'}
]

function placeToLatLonStr (place) {
  return `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`
}

/**
 * @return {boolean} - whether a calltaker session is invalid
 */
export function sessionIsInvalid (session) {
  if (!session || !session.sessionId) {
    console.error('No valid OTP datastore session found.')
    return true
  }
  return false
}

/**
 * Utility to map an OTP MOD UI search object to a Call Taker datastore query
 * object.
 */
export function searchToQuery (search, call, otpConfig) {
  // FIXME: how to handle realtime updates?
  const queryParams = getRoutingParams(search.query, otpConfig, true)
  const {from, to} = search.query
  return {
    queryParams: JSON.stringify(queryParams),
    fromPlace: from.name || placeToLatLonStr(from),
    toPlace: to.name || placeToLatLonStr(to),
    timeStamp: search.query.timestamp,
    call
  }
}

/**
 * Get the size of the group for a field trip request, optionally
 * limited by those required to pay for tickets.
 */
export function getGroupSize (request, requireTickets = false) {
  if (request) {
    const { numChaperones = 0, numFreeStudents = 0, numStudents = 0 } = request
    if (requireTickets) return numChaperones + numStudents
    else return numChaperones + numFreeStudents + numStudents
  }
  return 0
}

/**
 * Utility method to get either the outbound (default) or inbound
 * trip that has been planned for the field trip request.
 */
export function getTripFromRequest (request, outbound = false) {
  if (!request || !request.trips) return null
  let trip
  request.trips.forEach(t => {
    const tripIsOutbound = t.requestOrder === 0
    if (outbound && tripIsOutbound) trip = t
    else if (!outbound && !tripIsOutbound) trip = t
  })
  return trip
}

export function createTripPlan (planData, queryParams) {
  const tripPlan = {
    earliestStartTime: null,
    latestEndTime: null,
    planData,
    queryParams,
    itineraries: []
  }
  if (!planData) return
  tripPlan.itineraries = tripPlan.planData.map(itinData => 
    createItinerary(itinData, tripPlan))
  const timeBounds = calculateTimeBounds(tripPlan.itineraries)
  return {...tripPlan, ...timeBounds}
}

function calculateTimeBounds (itineraries) {
  let earliestStartTime = null
  let latestEndTime = null
  itineraries.forEach(itin => {
    earliestStartTime = (earliestStartTime == null || itin.getStartTime() < earliestStartTime)
      ? itin.getStartTime()
      : earliestStartTime
    latestEndTime = (latestEndTime == null || itin.getEndTime() > latestEndTime)
      ? itin.getEndTime()
      : latestEndTime
  })
}

function createItinerary (itinData, tripPlan) {
  const itin = {
    itinData,
    tripPlan,
    firstStopIds: [],
    hasTransit: false,
    totalWalk: 0
  }
  itinData.legs.forEach(leg => {
    if (isTransit(leg.mode)) {
      itin.hasTransit = true
      itin.firstStopIDs.push(leg.from.stopId)
    }
    if (leg.mode === 'WALK') itin.totalWalk += leg.distance
  })
  return itin
}
