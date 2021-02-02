import {isTransit} from '@opentripplanner/core-utils/lib/itinerary'

import {getRoutingParams} from '../actions/api'

function placeToLatLonStr (place) {
  return `${place.lat.toFixed(6)},${place.lon.toFixed(6)}`
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

export function getGroupSize (request) {
  let groupSize = 0
  if (request && request.numStudents) groupSize += request.numStudents
  if (request && request.numChaperones) groupSize += request.numChaperones
  return groupSize
}

export function getTrip (request, outbound = false) {
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
  for (let i = 0; i < tripPlan.planData.itineraries.length; i++) {
    const itinData = tripPlan.planData.itineraries[i]
    tripPlan.itineraries.push(createItinerary(itinData, tripPlan))
  }
  const timeBounds = calculateTimeBounds(tripPlan.itineraries)
  return {...tripPlan, ...timeBounds}
}

function calculateTimeBounds (itineraries) {
  let earliestStartTime = null
  let latestEndTime = null
  for (var i = 0; i < itineraries.length; i++) {
    var itin = itineraries[i]
    earliestStartTime = (earliestStartTime == null || itin.getStartTime() < earliestStartTime)
      ? itin.getStartTime()
      : earliestStartTime
    latestEndTime = (latestEndTime == null || itin.getEndTime() > latestEndTime)
      ? itin.getEndTime()
      : latestEndTime
  }
}

function createItinerary (itinData, tripPlan) {
  const itin = {
    itinData,
    tripPlan,
    firstStopIds: [],
    hasTransit: false,
    totalWalk: 0
  }
  for (let l = 0; l < itinData.legs.length; l++) {
    var leg = itinData.legs[l]
    if (isTransit(leg.mode)) {
      itin.hasTransit = true
      itin.firstStopIDs.push(leg.from.stopId)
    }
    if (leg.mode === 'WALK') itin.totalWalk += leg.distance
  }
  return itin
}
