import {isTransit} from '@opentripplanner/core-utils/lib/itinerary'
import {randId} from '@opentripplanner/core-utils/lib/storage'
import moment from 'moment'

import {getRoutingParams} from '../actions/api'
import {getTimestamp} from './state'

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

// List of tabs used for filtering field trips.
export const TABS = [
  {
    id: 'new',
    label: 'New',
    filter: (req) => req.status !== 'cancelled' &&
      (!req.inboundTripStatus || !req.outboundTripStatus)
  },
  {
    id: 'planned',
    label: 'Planned',
    filter: (req) => req.status !== 'cancelled' &&
      req.inboundTripStatus && req.outboundTripStatus
  },
  {
    id: 'cancelled',
    label: 'Cancelled',
    filter: (req) => req.status === 'cancelled'
  },
  {
    id: 'past',
    label: 'Past',
    filter: (req) => req.travelDate &&
      moment(req.travelDate).diff(moment(), 'days') < 0
  },
  {
    id: 'all',
    label: 'All',
    filter: (req) => true
  }
]

// List of fields in field trip object to which user's text search input applies.
const SEARCH_FIELDS = [
  'address',
  'ccLastFour',
  'ccName',
  'ccType',
  'checkNumber',
  'city',
  'classpassId',
  'emailAddress',
  'endLocation',
  'grade',
  'phoneNumber',
  'schoolName',
  'startLocation',
  'submitterNotes',
  'teacherName'
]

export function constructNewCall () {
  return {
    startTime: getTimestamp(),
    id: randId(),
    searches: []
  }
}

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
 * Get visible field trip requests according to the currently selected tab and
 * search terms.
 */
export function getVisibleRequests (state) {
  const {callTaker} = state
  const {fieldTrip} = callTaker
  const {filter} = fieldTrip
  const {search, tab} = filter
  const activeTab = TABS.find(t => t.id === tab)
  return fieldTrip.requests.data.filter(request => {
    let includedInTab = false
    let includedInSearch = false
    // First, filter field trip on whether it should be visible for the
    // active tab.
    if (activeTab) includedInTab = activeTab.filter(request)
    // If search input is found, only include field trips with at least one
    // field that matches search criteria.
    if (search) {
      // Split the search terms by whitespace and check that the request has
      // values that match every term.
      const searchTerms = search.toLowerCase().split(' ')
      includedInSearch = searchTerms.every(term => {
        const splitBySlash = term.split('/')
        if (splitBySlash.length > 1) {
          // Potential date format detected in search term.
          const [month, day] = splitBySlash
          if (!isNaN(month) && !isNaN(day)) {
            // If month and day seem to be numbers, check against request date.
            const date = moment(request.travelDate)
            return date.month() + 1 === +month && date.date() === +day
          }
        }
        return SEARCH_FIELDS.some(key => {
          const value = (request[key] || '').toLowerCase()
          let hasMatch = false
          if (value) {
            hasMatch = value.indexOf(term) !== -1
          }
          return hasMatch
        })
      })
      return includedInTab && includedInSearch
    }
    return includedInTab
  })
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

/**
 * Create trip plan from plan data with itineraries. Note: this is based on
 * original code in OpenTripPlanner:
 * https://github.com/ibi-group/OpenTripPlanner/blob/fdf972e590b809014e3f80160aeb6dde209dd1d4/src/client/js/otp/modules/planner/TripPlan.js#L27-L38
 *
 * FIXME: This still needs to be implemented for the field trip module.
 */
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

/**
 * Calculate time bounds for all of the itineraries. Note: this is based on
 * original code in OpenTripPlanner:
 * https://github.com/ibi-group/OpenTripPlanner/blob/fdf972e590b809014e3f80160aeb6dde209dd1d4/src/client/js/otp/modules/planner/TripPlan.js#L53-L66
 *
 * FIXME: This still needs to be implemented for the field trip module.
 */
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
  return {earliestStartTime, latestEndTime}
}

/**
 * Create itinerary. Note this is based on original code in OpenTripPlanner:
 * https://github.com/ibi-group/OpenTripPlanner/blob/46e1f9ffd9a55f0c5409d25a34769cdaff2d8cbb/src/client/js/otp/modules/planner/Itinerary.js#L27-L40
 */
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
