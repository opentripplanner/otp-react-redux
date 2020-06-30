"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getActiveSearch = getActiveSearch;
exports.getActiveItineraries = getActiveItineraries;
exports.getActiveItinerary = getActiveItinerary;
exports.hasValidLocation = hasValidLocation;
exports.queryIsValid = queryIsValid;
exports.getRealtimeEffects = getRealtimeEffects;
exports.getShowUserSettings = getShowUserSettings;
exports.getStopViewerConfig = getStopViewerConfig;
exports.getUiUrlParams = getUiUrlParams;
exports.getTitle = getTitle;

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _ui = require("../actions/ui");

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
  var useRealtime = otpState.useRealtime; // set response to use depending on useRealtime

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
/**
 * Determine if the current query has a valid location, including lat/lon
 * @param {Object} otpState the OTP state object
 * @param {string} locationKey the location key ('from' or 'to')
 * @returns {boolean}
 */


function hasValidLocation(otpState, locationKey) {
  return otpState.currentQuery[locationKey] && otpState.currentQuery[locationKey].lat && otpState.currentQuery[locationKey].lon;
}
/**
 * Determine if the current query is valid
 * @param {Object} otpState the OTP state object
 * @returns {boolean}
 */


function queryIsValid(otpState) {
  return hasValidLocation(otpState, 'from') && hasValidLocation(otpState, 'to'); // TODO: add mode validation
  // TODO: add date/time validation
}

function getRealtimeEffects(otpState) {
  var search = getActiveSearch(otpState);
  var realtimeItineraries = search && search.response && search.response.plan ? search.response.plan.itineraries : null;
  var hasNonRealtimeItineraries = search && search.nonRealtimeResponse && search.nonRealtimeResponse.plan;
  var nonRealtimeItineraries = hasNonRealtimeItineraries ? search.nonRealtimeResponse.plan.itineraries : null;
  var isAffectedByRealtimeData = !!(realtimeItineraries && hasNonRealtimeItineraries && // FIXME: Are realtime impacts only indicated by a change in the duration
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
    routesDiffer: !(0, _lodash.default)(normalRoutes, realtimeRoutes),
    normalDuration: normalDuration,
    realtimeDuration: realtimeDuration,
    exceedsThreshold: Math.abs(normalDuration - realtimeDuration) >= otpState.config.realtimeEffectsDisplayThreshold // // TESTING: Return this instead to simulate a realtime-affected itinerary.
    // return {
    //   isAffectedByRealtimeData: true,
    //   normalRoutes: ['10', '2', '10'],
    //   realtimeRoutes: ['1', '2'],
    //   routesDiffer: true,
    //   normalDuration: 1000,
    //   realtimeDuration: 800,
    //   exceedsThreshold: true
    // }

  };
}
/**
 * Determine whether user settings panel is enabled.
 */


function getShowUserSettings(otpState) {
  return otpState.config.persistence && otpState.config.persistence.enabled;
}

function getStopViewerConfig(otpState) {
  return otpState.config.stopViewer;
}
/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */


function getUiUrlParams(otpState) {
  var activeSearch = getActiveSearch(otpState);
  var uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0,
    ui_activeSearch: otpState.activeSearchId
  };
  return uiParams;
} // Set default title to the original document title (on load) set in index.html


var DEFAULT_TITLE = document.title;

function getTitle(state) {
  // Override title can optionally be provided in config.yml
  var _state$otp = state.otp,
      config = _state$otp.config,
      ui = _state$otp.ui,
      user = _state$otp.user;
  var title = config.title || DEFAULT_TITLE;
  var mainPanelContent = ui.mainPanelContent,
      viewedRoute = ui.viewedRoute,
      viewedStop = ui.viewedStop;

  switch (mainPanelContent) {
    case _ui.MainPanelContent.ROUTE_VIEWER:
      title += ' | Route';
      if (viewedRoute && viewedRoute.routeId) title += " ".concat(viewedRoute.routeId);
      break;

    case _ui.MainPanelContent.STOP_VIEWER:
      title += ' | Stop';
      if (viewedStop && viewedStop.stopId) title += " ".concat(viewedStop.stopId);
      break;

    default:
      var activeSearch = getActiveSearch(state.otp);

      if (activeSearch) {
        title += " | ".concat(_coreUtils.default.query.summarizeQuery(activeSearch.query, user.locations));
      }

      break;
  } // if (printView) title += ' | Print'


  return title;
}

//# sourceMappingURL=state.js