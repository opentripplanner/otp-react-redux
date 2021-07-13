import {isTransit} from '@opentripplanner/core-utils/lib/itinerary'
import {getRoutingParams} from '@opentripplanner/core-utils/lib/query'
import {randId} from '@opentripplanner/core-utils/lib/storage'
import moment from 'moment'

import {getTimestamp} from './state'

export const TICKET_TYPES = {
  hop_new: 'Will purchase new Hop Card',
  hop_reload: 'Will reload existing Hop Card',
  own_tickets: 'Will use own tickets'
}

const PAYMENT_PREFS = {
  fax_cc: 'Will fax credit card info to TriMet',
  mail_check: 'Will mail check to TriMet',
  phone_cc: 'Will call in credit card info to TriMet',
  request_call: 'Call requested at provided phone number'
}

const positiveIntInputProps = {
  min: 0,
  step: 1,
  type: 'number'
}

export const GROUP_FIELDS = [
  {fieldName: 'numStudents', inputProps: positiveIntInputProps, label: 'students 7 or older'},
  {fieldName: 'numFreeStudents', inputProps: positiveIntInputProps, label: 'students under 7'},
  {fieldName: 'numChaperones', inputProps: positiveIntInputProps, label: 'chaperones'}
]

export const PAYMENT_FIELDS = [
  {fieldName: 'paymentPreference', label: 'Payment preference', options: PAYMENT_PREFS},
  {fieldName: 'classpassId', label: 'Class Pass Hop Card #'},
  {fieldName: 'ccType', label: 'Credit card type'},
  {fieldName: 'ccName', label: 'Name on credit card'},
  {fieldName: 'ccLastFour', label: 'Credit card last 4 digits'},
  {fieldName: 'checkNumber', label: 'Check/Money order number'}
]

// List of tabs used for filtering field trips.
export const TABS = [
  {
    filter: (req) => req.status !== 'cancelled' &&
      (!req.inboundTripStatus || !req.outboundTripStatus),
    id: 'new',
    label: 'New'
  },
  {
    filter: (req) => req.status !== 'cancelled' &&
      req.inboundTripStatus && req.outboundTripStatus,
    id: 'planned',
    label: 'Planned'
  },
  {
    filter: (req) => req.status === 'cancelled',
    id: 'cancelled',
    label: 'Cancelled'
  },
  {
    filter: (req) => req.travelDate &&
      moment(req.travelDate).diff(moment(), 'days') < 0,
    id: 'past',
    label: 'Past'
  },
  {
    filter: (req) => true,
    id: 'all',
    label: 'All'
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
    id: randId(),
    searches: [],
    startTime: getTimestamp()
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
  const queryParams = getRoutingParams(otpConfig, search.query, true)
  const {from, to} = search.query
  return {
    call,
    fromPlace: from.name || placeToLatLonStr(from),
    queryParams: JSON.stringify(queryParams),
    toPlace: to.name || placeToLatLonStr(to)
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
    itineraries: [],
    latestEndTime: null,
    planData,
    queryParams
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
    firstStopIds: [],
    hasTransit: false,
    itinData,
    totalWalk: 0,
    tripPlan
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

/**
 * @param queryParams The query parameters string to convert (stringified JSON).
 * @returns An object with the parsed query params,
 *          where the arriveBy boolean is converted to a string
 *          per https://github.com/opentripplanner/otp-ui/blob/master/packages/core-utils/src/query.js#L285
 */
export function parseQueryParams (queryParams) {
  return JSON.parse(
    queryParams,
    // convert boolean for the 'arriveBy' field to strings
    (key, value) => key === 'arriveBy'
      ? value.toString()
      : value // return everything else unchanged
  )
}

/**
 * LZW-compress a string
 *
 * LZW functions adapted from jsolait library (LGPL)
 * via http://stackoverflow.com/questions/294297/javascript-implementation-of-gzip
 */
export function lzwEncode (s) {
  var dict = {}
  var data = (s + '').split('')
  var out = []
  var currChar
  var phrase = data[0]
  var code = 256
  let i
  for (i = 1; i < data.length; i++) {
    currChar = data[i]
    if (dict[phrase + currChar] != null) {
      phrase += currChar
    } else {
      out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
      dict[phrase + currChar] = code
      code++
      phrase = currChar
    }
  }
  out.push(phrase.length > 1 ? dict[phrase] : phrase.charCodeAt(0))
  for (i = 0; i < out.length; i++) {
    out[i] = String.fromCharCode(out[i])
  }
  return out.join('')
}

/**
 * Decompress an LZW-encoded string
 *
 * LZW functions adapted from jsolait library (LGPL)
 * via http://stackoverflow.com/questions/294297/javascript-implementation-of-gzip
 */
export function lzwDecode (s) {
  var dict = {}
  var data = (s + '').split('')
  var currChar = data[0]
  var oldPhrase = currChar
  var out = [currChar]
  var code = 256
  var phrase
  for (var i = 1; i < data.length; i++) {
    var currCode = data[i].charCodeAt(0)
    if (currCode < 256) {
      phrase = data[i]
    } else {
      phrase = dict[currCode] ? dict[currCode] : (oldPhrase + currChar)
    }
    out.push(phrase)
    currChar = phrase.charAt(0)
    dict[code] = oldPhrase + currChar
    code++
    oldPhrase = phrase
  }
  return out.join('')
}
