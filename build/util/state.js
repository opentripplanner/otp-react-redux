'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.queryIsValid = exports.hasValidLocation = exports.getActiveItinerary = undefined;
exports.getActiveSearch = getActiveSearch;
exports.getActiveItineraries = getActiveItineraries;
exports.getDefaultQuery = getDefaultQuery;
exports.getRealtimeEffects = getRealtimeEffects;

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _time = require('../util/time');

var _map = require('../util/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Get the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an search object, or null if there is no active search
 */

function getActiveSearch(otpState) {
  return otpState.searches[otpState.activeSearchId];
}

/**
 * Get the active itineraries for the active search, which is dependent on
 * whether realtime or non-realtime results should be displayed
 * @param {Object} otpState the OTP state object
 * @return {Array}      array of itinerary objects from the OTP plan response,
 *                      or null if there is no active search
 */
function getActiveItineraries(otpState) {
  var search = getActiveSearch(otpState);
  var useRealtime = otpState.useRealtime;
  // set response to use depending on useRealtime

  var response = !search ? null : useRealtime ? search.response : search.nonRealtimeResponse;
  if (!response || !response.plan) return null;
  return response.plan.itineraries;
}

/**
 * Get the active itinerary/profile for the active search object
 * @param {Object} otpState the OTP state object
 * @returns {Object} an itinerary object from the OTP plan response, or null if
 *   there is no active search or itinerary
 */

function getActiveItinerary(otpState) {
  var search = getActiveSearch(otpState);
  var itineraries = getActiveItineraries(otpState);
  if (!itineraries) return null;
  return itineraries.length > search.activeItinerary && search.activeItinerary >= 0 ? itineraries[search.activeItinerary] : null;
}
exports.getActiveItinerary = getActiveItinerary;

/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {Object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */

function hasValidLocation(otpState, locationKey) {
  return otpState.currentQuery[locationKey] && otpState.currentQuery[locationKey].lat && otpState.currentQuery[locationKey].lon;
}
exports.hasValidLocation = hasValidLocation;

/**
 * Determine if the current query is valid
 * @param {Object} otpState the OTP state object
 * @returns {boolean}
 */

function queryIsValid(otpState) {
  return hasValidLocation(otpState, 'from') && hasValidLocation(otpState, 'to');
  // TODO: add mode validation
  // TODO: add date/time validation
}
exports.queryIsValid = queryIsValid;
function getDefaultQuery() {
  var params = {};
  if (typeof window !== 'undefined') {
    params = _qs2.default.parse(window.location.hash.split('#plan?')[1]);
  }
  console.log(params);
  var from = params.fromPlace && params.fromPlace.split(',') || [];
  var to = params.toPlace && params.toPlace.split(',') || [];
  return {
    routingType: 'ITINERARY',
    from: from.length ? {
      name: (0, _map.coordsToString)(from) || null,
      lat: from[0] || null,
      lon: from[1] || null
    } : null,
    to: to.length ? {
      name: (0, _map.coordsToString)(to) || null,
      lat: to[0] || null,
      lon: to[1] || null
    } : null,
    departArrive: params.arriveBy === 'true' ? 'ARRIVE' : params.arriveBy === 'false' ? 'DEPART' : 'NOW',
    date: params.date || (0, _time.getCurrentDate)(),
    time: params.time || (0, _time.getCurrentTime)(),
    mode: params.mode
  };
}

function getRealtimeEffects(otpState) {
  var search = getActiveSearch(otpState);

  var realtimeItineraries = search && search.response && search.response.plan ? search.response.plan.itineraries : null;

  var hasNonRealtimeItineraries = search && search.nonRealtimeResponse && search.nonRealtimeResponse.plan;

  var nonRealtimeItineraries = hasNonRealtimeItineraries ? search.nonRealtimeResponse.plan.itineraries : null;

  var isAffectedByRealtimeData = !!(realtimeItineraries && hasNonRealtimeItineraries &&
  // FIXME: Are realtime impacts only indicated by a change in the duration
  // of the first itinerary
  realtimeItineraries[0].duration !== nonRealtimeItineraries[0].duration);

  var normalRoutes = isAffectedByRealtimeData && nonRealtimeItineraries ? nonRealtimeItineraries[0].legs.filter(function (leg) {
    return !!leg.route;
  }).map(function (leg) {
    return leg.route;
  }) : [];

  var realtimeRoutes = isAffectedByRealtimeData && realtimeItineraries ? realtimeItineraries[0].legs.filter(function (leg) {
    return !!leg.route;
  }).map(function (leg) {
    return leg.route;
  }) : [];

  var normalDuration = isAffectedByRealtimeData && nonRealtimeItineraries ? nonRealtimeItineraries[0].duration : 0;

  var realtimeDuration = isAffectedByRealtimeData && realtimeItineraries ? realtimeItineraries[0].duration : 0;

  return {
    isAffectedByRealtimeData: isAffectedByRealtimeData,
    normalRoutes: normalRoutes,
    realtimeRoutes: realtimeRoutes,
    routesDiffer: !(0, _lodash2.default)(normalRoutes, realtimeRoutes),
    normalDuration: normalDuration,
    realtimeDuration: realtimeDuration,
    exceedsThreshold: Math.abs(normalDuration - realtimeDuration) >= otpState.config.realtimeEffectsDisplayThreshold
  };
}

//# sourceMappingURL=state.js