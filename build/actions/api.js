"use strict";

require("core-js/modules/es6.regexp.replace");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routingQuery = routingQuery;
exports.parkAndRideQuery = parkAndRideQuery;
exports.bikeRentalQuery = bikeRentalQuery;
exports.carRentalQuery = carRentalQuery;
exports.vehicleRentalQuery = vehicleRentalQuery;
exports.findStop = findStop;
exports.findTrip = findTrip;
exports.findStopsForTrip = findStopsForTrip;
exports.findStopTimesForTrip = findStopTimesForTrip;
exports.findGeometryForTrip = findGeometryForTrip;
exports.findStopTimesForStop = findStopTimesForStop;
exports.findRoutes = findRoutes;
exports.findRoute = findRoute;
exports.findPatternsForRoute = findPatternsForRoute;
exports.findGeometryForPattern = findGeometryForPattern;
exports.getTransportationNetworkCompanyEtaEstimate = getTransportationNetworkCompanyEtaEstimate;
exports.getTransportationNetworkCompanyRideEstimate = getTransportationNetworkCompanyRideEstimate;
exports.findNearbyStops = findNearbyStops;
exports.findRoutesAtStop = findRoutesAtStop;
exports.findStopsWithinBBox = findStopsWithinBBox;
exports.setUrlSearch = setUrlSearch;
exports.updateOtpUrlParams = updateOtpUrlParams;
exports.clearStops = exports.transportationNetworkCompanyRideError = exports.transportationNetworkCompanyRideResponse = exports.transportationNetworkCompanyEtaError = exports.transportationNetworkCompanyEtaResponse = exports.findRouteError = exports.findRouteResponse = exports.findGeometryForTripError = exports.findGeometryForTripResponse = exports.findStopTimesForTripError = exports.findStopTimesForTripResponse = exports.findStopsForTripError = exports.findStopsForTripResponse = exports.findTripError = exports.findTripResponse = exports.vehicleRentalError = exports.vehicleRentalResponse = exports.carRentalError = exports.carRentalResponse = exports.bikeRentalResponse = exports.bikeRentalError = exports.parkAndRideResponse = exports.parkAndRideError = exports.forgetSearch = exports.rememberSearch = exports.toggleTracking = exports.routingError = exports.routingResponse = exports.routingRequest = exports.nonRealtimeRoutingResponse = void 0;

require("core-js/modules/es6.promise");

require("core-js/modules/es7.object.get-own-property-descriptors");

require("core-js/modules/es6.symbol");

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find");

require("regenerator-runtime/runtime");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

var _connectedReactRouter = require("connected-react-router");

var _haversine = _interopRequireDefault(require("haversine"));

var _moment = _interopRequireDefault(require("moment"));

var _objectHash = _interopRequireDefault(require("object-hash"));

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _queryParams = _interopRequireDefault(require("@opentripplanner/core-utils/lib/query-params"));

var _reduxActions = require("redux-actions");

var _qs = _interopRequireDefault(require("qs"));

var _map = require("./map");

var _state = require("../util/state");

var _middleware = require("../util/middleware");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _objectWithoutProperties(source, excluded) { if (source == null) return {}; var target = _objectWithoutPropertiesLoose(source, excluded); var key, i; if (Object.getOwnPropertySymbols) { var sourceSymbolKeys = Object.getOwnPropertySymbols(source); for (i = 0; i < sourceSymbolKeys.length; i++) { key = sourceSymbolKeys[i]; if (excluded.indexOf(key) >= 0) continue; if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue; target[key] = source[key]; } } return target; }

function _objectWithoutPropertiesLoose(source, excluded) { if (source == null) return {}; var target = {}; var sourceKeys = Object.keys(source); var key, i; for (i = 0; i < sourceKeys.length; i++) { key = sourceKeys[i]; if (excluded.indexOf(key) >= 0) continue; target[key] = source[key]; } return target; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); if (enumerableOnly) symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; }); keys.push.apply(keys, symbols); } return keys; }

function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i] != null ? arguments[i] : {}; if (i % 2) { ownKeys(source, true).forEach(function (key) { _defineProperty(target, key, source[key]); }); } else if (Object.getOwnPropertyDescriptors) { Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)); } else { ownKeys(source).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } } return target; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

if (typeof fetch === 'undefined') require('isomorphic-fetch');
var hasCar = _coreUtils.default.itinerary.hasCar;
var _coreUtils$query = _coreUtils.default.query,
    getTripOptionsFromQuery = _coreUtils$query.getTripOptionsFromQuery,
    getUrlParams = _coreUtils$query.getUrlParams;
var randId = _coreUtils.default.storage.randId;
var _coreUtils$time = _coreUtils.default.time,
    OTP_API_DATE_FORMAT = _coreUtils$time.OTP_API_DATE_FORMAT,
    OTP_API_TIME_FORMAT = _coreUtils$time.OTP_API_TIME_FORMAT; // Generic API actions

var nonRealtimeRoutingResponse = (0, _reduxActions.createAction)('NON_REALTIME_ROUTING_RESPONSE');
exports.nonRealtimeRoutingResponse = nonRealtimeRoutingResponse;
var routingRequest = (0, _reduxActions.createAction)('ROUTING_REQUEST');
exports.routingRequest = routingRequest;
var routingResponse = (0, _reduxActions.createAction)('ROUTING_RESPONSE');
exports.routingResponse = routingResponse;
var routingError = (0, _reduxActions.createAction)('ROUTING_ERROR');
exports.routingError = routingError;
var toggleTracking = (0, _reduxActions.createAction)('TOGGLE_TRACKING');
exports.toggleTracking = toggleTracking;
var rememberSearch = (0, _reduxActions.createAction)('REMEMBER_SEARCH');
exports.rememberSearch = rememberSearch;
var forgetSearch = (0, _reduxActions.createAction)('FORGET_SEARCH');
exports.forgetSearch = forgetSearch;

function formatRecentPlace(place) {
  return _objectSpread({}, place, {
    type: 'recent',
    icon: 'clock-o',
    id: "recent-".concat(randId()),
    timestamp: new Date().getTime()
  });
}

function formatRecentSearch(url, otpState) {
  return {
    query: getTripOptionsFromQuery(otpState.currentQuery, true),
    url: url,
    id: randId(),
    timestamp: new Date().getTime()
  };
}

function isStoredPlace(place) {
  return ['home', 'work', 'suggested', 'stop'].indexOf(place.type) !== -1;
}
/**
 * Compute the initial activeItinerary. If this is the first search of
 * session (i.e. searches lookup is empty/null) AND an activeItinerary ID
 * is specified in URL parameters, use that ID. Otherwise, use null/0.
 */


function getActiveItinerary(otpState) {
  var activeItinerary = otpState.currentQuery.routingType === 'ITINERARY' ? 0 : null; // We cannot use window.history.state here to check for the active
  // itinerary param because it is unreliable in some states (e.g.,
  // when the print layout component first loads).

  var urlParams = getUrlParams();

  if ((!otpState.searches || Object.keys(otpState.searches).length === 0) && urlParams.ui_activeItinerary) {
    activeItinerary = +urlParams.ui_activeItinerary;
  }

  return activeItinerary;
}
/**
 * Send a routing query to the OTP backend.
 *
 * NOTE: We need a random ID so that when a user reloads the page (clearing the
 * state), performs searches, and presses back to load previous searches
 * that are no longer contained in the state we don't confuse the search IDs
 * with search IDs from the new session. If we were to use sequential numbers
 * as IDs, we would run into this problem.
 */


function routingQuery() {
  var searchId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
  return (
    /*#__PURE__*/
    function () {
      var _ref = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(dispatch, getState) {
        var state, otpState, isNewSearch, routingType, activeItinerary, query, params, user, storeTripHistory;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                state = getState();
                otpState = state.otp;
                isNewSearch = !searchId;
                if (isNewSearch) searchId = randId();
                routingType = otpState.currentQuery.routingType; // Don't permit a routing query if the query is invalid

                if ((0, _state.queryIsValid)(otpState)) {
                  _context.next = 8;
                  break;
                }

                console.warn('Query is invalid. Aborting routing query', otpState.currentQuery);
                return _context.abrupt("return");

              case 8:
                activeItinerary = getActiveItinerary(otpState);
                dispatch(routingRequest({
                  activeItinerary: activeItinerary,
                  routingType: routingType,
                  searchId: searchId
                })); // fetch a realtime route

                query = constructRoutingQuery(otpState);
                fetch(query, getOtpFetchOptions(state)).then(getJsonAndCheckResponse).then(function (json) {
                  dispatch(routingResponse({
                    response: json,
                    searchId: searchId
                  })); // If tracking is enabled, store locations and search after successful
                  // search is completed.

                  if (otpState.user.trackRecent) {
                    var _otpState$currentQuer = otpState.currentQuery,
                        from = _otpState$currentQuer.from,
                        to = _otpState$currentQuer.to;

                    if (!isStoredPlace(from)) {
                      dispatch((0, _map.rememberPlace)({
                        type: 'recent',
                        location: formatRecentPlace(from)
                      }));
                    }

                    if (!isStoredPlace(to)) {
                      dispatch((0, _map.rememberPlace)({
                        type: 'recent',
                        location: formatRecentPlace(to)
                      }));
                    }

                    dispatch(rememberSearch(formatRecentSearch(query, otpState)));
                  }
                }).catch(function (error) {
                  dispatch(routingError({
                    error: error,
                    searchId: searchId
                  }));
                }); // Update OTP URL params if a new search. In other words, if we're
                // performing a search based on query params taken from the URL after a back
                // button press, we don't need to update the OTP URL.
                // TODO: For old searches that we are re-running, should we be **replacing**
                //  the URL params here (instead of **pushing** a new path to history like
                //  what currently happens in updateOtpUrlParams)? That way we could ensure
                //  that the path absolutely accurately reflects the app state.

                params = getUrlParams();

                if (isNewSearch || params.ui_activeSearch !== searchId) {
                  dispatch(updateOtpUrlParams(otpState, searchId));
                } // Also fetch a non-realtime route.
                //
                // FIXME: The statement below may no longer apply with future work
                // involving realtime info embedded in the OTP response.
                // (That action records an entry again in the middleware.)
                // For users who opted in to store trip request history,
                // to avoid recording the same trip request twice in the middleware,
                // only add the user Authorization token to the request
                // when querying the non-realtime route.
                //
                // The advantage of using non-realtime route is that the middleware will be able to
                // record and provide the theoretical itinerary summary without having to query OTP again.
                // FIXME: Interestingly, and this could be from a side effect elsewhere,
                // when a logged-in user refreshes the page, the trip request in the URL is not recorded again
                // (state.user stays unpopulated until after this function is called).
                //


                user = state.user;
                storeTripHistory = user && user.loggedInUser && user.loggedInUser.storeTripHistory;
                fetch(constructRoutingQuery(otpState, true), getOtpFetchOptions(state, storeTripHistory)).then(getJsonAndCheckResponse).then(function (json) {
                  // FIXME: This is only performed when ignoring realtimeupdates currently, just
                  // to ensure it is not repeated twice.
                  dispatch(nonRealtimeRoutingResponse({
                    response: json,
                    searchId: searchId
                  }));
                }).catch(function (error) {
                  console.error(error); // do nothing
                });

              case 17:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      return function (_x, _x2) {
        return _ref.apply(this, arguments);
      };
    }()
  );
}

function getJsonAndCheckResponse(res) {
  if (res.status >= 400) {
    var error = new Error('Received error from server');
    error.response = res;
    throw error;
  }

  return res.json();
}
/**
 * This method determines the fetch options (including API key and Authorization headers) for the OTP API.
 * - If the OTP server is not the middleware server (standalone OTP server),
 *   an empty object is returned.
 * - If the OTP server is the same as the middleware server,
 *   then an object is returned with the following:
 *   - A middleware API key, if it has been set in the configuration (it is most likely required),
 *   - An Auth0 accessToken, when includeToken is true and a user is logged in (userState.loggedInUser is not null).
 * This method assumes JSON request bodies.)
 */


function getOtpFetchOptions(state) {
  var includeToken = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var apiBaseUrl, apiKey, token;
  var _state$otp$config = state.otp.config,
      api = _state$otp$config.api,
      persistence = _state$otp$config.persistence;

  if (persistence && persistence.otp_middleware) {
    var _persistence$otp_midd = persistence.otp_middleware;
    apiBaseUrl = _persistence$otp_midd.apiBaseUrl;
    apiKey = _persistence$otp_midd.apiKey;
  }

  var isOtpServerSameAsMiddleware = apiBaseUrl === api.host;

  if (isOtpServerSameAsMiddleware) {
    if (includeToken && state.user) {
      var _state$user = state.user,
          accessToken = _state$user.accessToken,
          loggedInUser = _state$user.loggedInUser;

      if (accessToken && loggedInUser) {
        token = accessToken;
      }
    }

    return (0, _middleware.getSecureFetchOptions)(token, apiKey);
  } else {
    return {};
  }
}

function constructRoutingQuery(otpState, ignoreRealtimeUpdates) {
  var config = otpState.config,
      currentQuery = otpState.currentQuery;
  var routingType = currentQuery.routingType; // Check for routingType-specific API config; if none, use default API

  var rt = config.routingTypes && config.routingTypes.find(function (rt) {
    return rt.key === routingType;
  });
  var api = rt && rt.api || config.api;
  var planEndpoint = "".concat(api.host).concat(api.port ? ':' + api.port : '').concat(api.path, "/plan");
  var params = getRoutingParams(otpState, ignoreRealtimeUpdates);
  return "".concat(planEndpoint, "?").concat(_qs.default.stringify(params));
}

function getRoutingParams(otpState, ignoreRealtimeUpdates) {
  var config = otpState.config,
      currentQuery = otpState.currentQuery;
  var routingType = currentQuery.routingType;
  var isItinerary = routingType === 'ITINERARY';
  var params = {}; // Start with the universe of OTP parameters defined in query-params.js:

  _queryParams.default.filter(function (qp) {
    // A given parameter is included in the request if all of the following:
    // 1. Must apply to the active routing type (ITINERARY or PROFILE)
    // 2. Must be included in the current user-defined query
    // 3. Must pass the parameter's applicability test, if one is specified
    return qp.routingTypes.indexOf(routingType) !== -1 && qp.name in currentQuery && (typeof qp.applicable !== 'function' || qp.applicable(currentQuery, config));
  }).forEach(function (qp) {
    // Translate the applicable parameters according to their rewrite
    // functions (if provided)
    var rewriteFunction = isItinerary ? qp.itineraryRewrite : qp.profileRewrite;
    params = Object.assign(params, rewriteFunction ? rewriteFunction(currentQuery[qp.name]) : _defineProperty({}, qp.name, currentQuery[qp.name]));
  }); // Additional processing specific to ITINERARY mode


  if (isItinerary) {
    // override ignoreRealtimeUpdates if provided
    if (typeof ignoreRealtimeUpdates === 'boolean') {
      params.ignoreRealtimeUpdates = ignoreRealtimeUpdates;
    } // check date/time validity; ignore both if either is invalid


    var dateValid = (0, _moment.default)(params.date, OTP_API_DATE_FORMAT).isValid();
    var timeValid = (0, _moment.default)(params.time, OTP_API_TIME_FORMAT).isValid();

    if (!dateValid || !timeValid) {
      delete params.time;
      delete params.date;
    } // temp: set additional parameters for CAR_HAIL or CAR_RENT trips


    if (params.mode && (params.mode.includes('CAR_HAIL') || params.mode.includes('CAR_RENT'))) {
      params.minTransitDistance = '50%'; // increase search timeout because these queries can take a while

      params.searchTimeout = 10000;
    } // set onlyTransitTrips for car rental searches


    if (params.mode && params.mode.includes('CAR_RENT')) {
      params.onlyTransitTrips = true;
    } // Additional processing specific to PROFILE mode

  } else {
    // check start and end time validity; ignore both if either is invalid
    var startTimeValid = (0, _moment.default)(params.startTime, OTP_API_TIME_FORMAT).isValid();
    var endTimeValid = (0, _moment.default)(params.endTime, OTP_API_TIME_FORMAT).isValid();

    if (!startTimeValid || !endTimeValid) {
      delete params.startTimeValid;
      delete params.endTimeValid;
    }
  } // TODO: check that valid from/to locations are provided
  // hack to add walking to driving/TNC trips


  if (hasCar(params.mode)) {
    params.mode += ',WALK';
  }

  return params;
} // Park and Ride location query


var parkAndRideError = (0, _reduxActions.createAction)('PARK_AND_RIDE_ERROR');
exports.parkAndRideError = parkAndRideError;
var parkAndRideResponse = (0, _reduxActions.createAction)('PARK_AND_RIDE_RESPONSE');
exports.parkAndRideResponse = parkAndRideResponse;

function parkAndRideQuery(params) {
  var endpoint = 'park_and_ride';

  if (params && Object.keys(params).length > 0) {
    endpoint += '?' + Object.keys(params).map(function (key) {
      return key + '=' + params[key];
    }).join('&');
  }

  return createQueryAction(endpoint, parkAndRideResponse, parkAndRideError);
} // bike rental station query


var bikeRentalError = (0, _reduxActions.createAction)('BIKE_RENTAL_ERROR');
exports.bikeRentalError = bikeRentalError;
var bikeRentalResponse = (0, _reduxActions.createAction)('BIKE_RENTAL_RESPONSE');
exports.bikeRentalResponse = bikeRentalResponse;

function bikeRentalQuery(params) {
  return createQueryAction('bike_rental', bikeRentalResponse, bikeRentalError);
} // Car rental (e.g. car2go) locations lookup query


var carRentalResponse = (0, _reduxActions.createAction)('CAR_RENTAL_RESPONSE');
exports.carRentalResponse = carRentalResponse;
var carRentalError = (0, _reduxActions.createAction)('CAR_RENTAL_ERROR');
exports.carRentalError = carRentalError;

function carRentalQuery(params) {
  return createQueryAction('car_rental', carRentalResponse, carRentalError);
} // Vehicle rental locations lookup query. For now, there are 3 seperate
// "vehicle" rental endpoints - 1 for cars, 1 for bicycle rentals and another
// for micromobility. In the future, the hope is to consolidate these 3
// endpoints into one.


var vehicleRentalResponse = (0, _reduxActions.createAction)('VEHICLE_RENTAL_RESPONSE');
exports.vehicleRentalResponse = vehicleRentalResponse;
var vehicleRentalError = (0, _reduxActions.createAction)('VEHICLE_RENTAL_ERROR');
exports.vehicleRentalError = vehicleRentalError;

function vehicleRentalQuery(params) {
  return createQueryAction('vehicle_rental', vehicleRentalResponse, vehicleRentalError);
} // Single stop lookup query


var findStopResponse = (0, _reduxActions.createAction)('FIND_STOP_RESPONSE');
var findStopError = (0, _reduxActions.createAction)('FIND_STOP_ERROR');

function findStop(params) {
  return createQueryAction("index/stops/".concat(params.stopId), findStopResponse, findStopError, {
    serviceId: 'stops',
    postprocess: function postprocess(payload, dispatch) {
      dispatch(findRoutesAtStop(params.stopId));
      dispatch(findStopTimesForStop(params));
    },
    noThrottle: true
  });
} // TODO: Optionally substitute GraphQL queries? Note: this is not currently
// possible because gtfsdb (the alternative transit index used by TriMet) does not
// support GraphQL queries.
// export function findStop (params) {
//   const query = `
// query stopQuery($stopId: [String]) {
//   stops (ids: $stopId) {
//     id: gtfsId
//     code
//     name
//     url
//     lat
//     lon
//     stoptimesForPatterns {
//       pattern {
//         id: semanticHash
//         route {
//           id: gtfsId
//           longName
//           shortName
//           sortOrder
//         }
//       }
//       stoptimes {
//         scheduledArrival
//         realtimeArrival
//         arrivalDelay
//         scheduledDeparture
//         realtimeDeparture
//         departureDelay
//         timepoint
//         realtime
//         realtimeState
//         serviceDay
//         headsign
//       }
//     }
//   }
// }
// `
//   return createGraphQLQueryAction(
//     query,
//     { stopId: params.stopId },
//     findStopResponse,
//     findStopError,
//     {
//       // find stop should not be throttled since it can make quite frequent
//       // updates when fetching stop times for a stop
//       noThrottle: true,
//       serviceId: 'stops',
//       rewritePayload: (payload) => {
//         // convert pattern array to ID-mapped object
//         const patterns = []
//         const { stoptimesForPatterns, ...stop } = payload.data.stops[0]
//         stoptimesForPatterns.forEach(obj => {
//           const { pattern, stoptimes: stopTimes } = obj
//           // It's possible that not all stop times for a pattern will share the
//           // same headsign, but this is probably a minor edge case.
//           const headsign = stopTimes[0]
//             ? stopTimes[0].headsign
//             : pattern.route.longName
//           const patternIndex = patterns.findIndex(p =>
//             p.headsign === headsign && pattern.route.id === p.route.id)
//           if (patternIndex === -1) {
//             patterns.push({ ...pattern, headsign, stopTimes })
//           } else {
//             patterns[patternIndex].stopTimes.push(...stopTimes)
//           }
//         })
//         return {
//           ...stop,
//           patterns
//         }
//       }
//     }
//   )
// }
// Single trip lookup query


var findTripResponse = (0, _reduxActions.createAction)('FIND_TRIP_RESPONSE');
exports.findTripResponse = findTripResponse;
var findTripError = (0, _reduxActions.createAction)('FIND_TRIP_ERROR');
exports.findTripError = findTripError;

function findTrip(params) {
  return createQueryAction("index/trips/".concat(params.tripId), findTripResponse, findTripError, {
    postprocess: function postprocess(payload, dispatch) {
      dispatch(findStopsForTrip({
        tripId: params.tripId
      }));
      dispatch(findStopTimesForTrip({
        tripId: params.tripId
      }));
      dispatch(findGeometryForTrip({
        tripId: params.tripId
      }));
    }
  });
} // Stops for trip query


var findStopsForTripResponse = (0, _reduxActions.createAction)('FIND_STOPS_FOR_TRIP_RESPONSE');
exports.findStopsForTripResponse = findStopsForTripResponse;
var findStopsForTripError = (0, _reduxActions.createAction)('FIND_STOPS_FOR_TRIP_ERROR');
exports.findStopsForTripError = findStopsForTripError;

function findStopsForTrip(params) {
  return createQueryAction("index/trips/".concat(params.tripId, "/stops"), findStopsForTripResponse, findStopsForTripError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        tripId: params.tripId,
        stops: payload
      };
    }
  });
} // Stop times for trip query


var findStopTimesForTripResponse = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_TRIP_RESPONSE');
exports.findStopTimesForTripResponse = findStopTimesForTripResponse;
var findStopTimesForTripError = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_TRIP_ERROR');
exports.findStopTimesForTripError = findStopTimesForTripError;

function findStopTimesForTrip(params) {
  return createQueryAction("index/trips/".concat(params.tripId, "/stoptimes"), findStopTimesForTripResponse, findStopTimesForTripError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        tripId: params.tripId,
        stopTimes: payload
      };
    },
    noThrottle: true
  });
} // Geometry for trip query


var findGeometryForTripResponse = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_TRIP_RESPONSE');
exports.findGeometryForTripResponse = findGeometryForTripResponse;
var findGeometryForTripError = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_TRIP_ERROR');
exports.findGeometryForTripError = findGeometryForTripError;

function findGeometryForTrip(params) {
  var tripId = params.tripId;
  return createQueryAction("index/trips/".concat(tripId, "/geometry"), findGeometryForTripResponse, findGeometryForTripError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        tripId: tripId,
        geometry: payload
      };
    }
  });
}

var findStopTimesForStopResponse = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_STOP_RESPONSE');
var findStopTimesForStopError = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_STOP_ERROR');
/**
 * Stop times for stop query (used in stop viewer).
 */

function findStopTimesForStop(params) {
  return function (dispatch, getState) {
    var stopId = params.stopId,
        otherParams = _objectWithoutProperties(params, ["stopId"]); // If other params not provided, fall back on defaults from stop viewer config.


    var queryParams = _objectSpread({}, (0, _state.getStopViewerConfig)(getState().otp), {}, otherParams); // If no start time is provided, pass in the current time. Note: this is not
    // a required param by the back end, but if a value is not provided, the
    // time defaults to the server's time, which can make it difficult to test
    // scenarios when you may want to use a different date/time for your local
    // testing environment.


    if (!queryParams.startTime) {
      var nowInSeconds = Math.floor(new Date().getTime() / 1000);
      queryParams.startTime = nowInSeconds;
    }

    dispatch(createQueryAction("index/stops/".concat(stopId, "/stoptimes?").concat(_qs.default.stringify(queryParams)), findStopTimesForStopResponse, findStopTimesForStopError, {
      rewritePayload: function rewritePayload(stopTimes) {
        return {
          stopId: stopId,
          stopTimes: stopTimes
        };
      },
      noThrottle: true
    }));
  };
} // Routes lookup query


var findRoutesResponse = (0, _reduxActions.createAction)('FIND_ROUTES_RESPONSE');
var findRoutesError = (0, _reduxActions.createAction)('FIND_ROUTES_ERROR');

function findRoutes(params) {
  return createQueryAction('index/routes', findRoutesResponse, findRoutesError, {
    serviceId: 'routes',
    rewritePayload: function rewritePayload(payload) {
      var routes = {};
      payload.forEach(function (rte) {
        routes[rte.id] = rte;
      });
      return routes;
    }
  });
} // export function findRoutes (params) {
//   const query = `
// {
//   routes {
//     id: gtfsId
//     color
//     longName
//     shortName
//     mode
//     type
//     desc
//     bikesAllowed
//     sortOrder
//     textColor
//     url
//     agency {
//       id: gtfsId
//       name
//       url
//     }
//   }
// }
//   `
//   return createGraphQLQueryAction(
//     query,
//     {},
//     findRoutesResponse,
//     findRoutesError,
//     {
//       serviceId: 'routes',
//       rewritePayload: (payload) => {
//         const routes = {}
//         payload.data.routes.forEach(rte => { routes[rte.id] = rte })
//         return routes
//       }
//     }
//   )
// }
// Patterns for Route lookup query
// TODO: replace with GraphQL query for route => patterns => geometry


var findPatternsForRouteResponse = (0, _reduxActions.createAction)('FIND_PATTERNS_FOR_ROUTE_RESPONSE');
var findPatternsForRouteError = (0, _reduxActions.createAction)('FIND_PATTERNS_FOR_ROUTE_ERROR'); // Single Route lookup query

var findRouteResponse = (0, _reduxActions.createAction)('FIND_ROUTE_RESPONSE');
exports.findRouteResponse = findRouteResponse;
var findRouteError = (0, _reduxActions.createAction)('FIND_ROUTE_ERROR');
exports.findRouteError = findRouteError;

function findRoute(params) {
  return createQueryAction("index/routes/".concat(params.routeId), findRouteResponse, findRouteError, {
    postprocess: function postprocess(payload, dispatch) {
      // load patterns
      dispatch(findPatternsForRoute({
        routeId: params.routeId
      }));
    },
    noThrottle: true
  });
}

function findPatternsForRoute(params) {
  return createQueryAction("index/routes/".concat(params.routeId, "/patterns"), findPatternsForRouteResponse, findPatternsForRouteError, {
    rewritePayload: function rewritePayload(payload) {
      // convert pattern array to ID-mapped object
      var patterns = {};
      payload.forEach(function (ptn) {
        patterns[ptn.id] = ptn;
      });
      return {
        routeId: params.routeId,
        patterns: patterns
      };
    },
    postprocess: function postprocess(payload, dispatch) {
      // load geometry for each pattern
      payload.forEach(function (ptn) {
        dispatch(findGeometryForPattern({
          routeId: params.routeId,
          patternId: ptn.id
        }));
      });
    }
  });
} // Geometry for Pattern lookup query


var findGeometryForPatternResponse = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_PATTERN_RESPONSE');
var findGeometryForPatternError = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_PATTERN_ERROR');

function findGeometryForPattern(params) {
  return createQueryAction("index/patterns/".concat(params.patternId, "/geometry"), findGeometryForPatternResponse, findGeometryForPatternError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        routeId: params.routeId,
        patternId: params.patternId,
        geometry: payload
      };
    }
  });
} // export function findRoute (params) {
//   const query = `
//   query routeQuery($routeId: [String]) {
//     routes (ids: $routeId) {
//       id: gtfsId
//       patterns {
//         id: semanticHash
//         directionId
//         headsign
//         name
//         semanticHash
//         geometry {
//           lat
//           lon
//         }
//       }
//     }
//   }
//   `
//   return createGraphQLQueryAction(
//     query,
//     { routeId: params.routeId },
//     findPatternsForRouteResponse,
//     findPatternsForRouteError,
//     {
//       rewritePayload: (payload) => {
//         // convert pattern array to ID-mapped object
//         const patterns = {}
//         payload.data.routes[0].patterns.forEach(ptn => {
//           patterns[ptn.id] = {
//             routeId: params.routeId,
//             patternId: ptn.id,
//             geometry: ptn.geometry
//           }
//         })
//
//         return {
//           routeId: params.routeId,
//           patterns
//         }
//       }
//     }
//   )
// }
// TNC ETA estimate lookup query


var transportationNetworkCompanyEtaResponse = (0, _reduxActions.createAction)('TNC_ETA_RESPONSE');
exports.transportationNetworkCompanyEtaResponse = transportationNetworkCompanyEtaResponse;
var transportationNetworkCompanyEtaError = (0, _reduxActions.createAction)('TNC_ETA_ERROR');
exports.transportationNetworkCompanyEtaError = transportationNetworkCompanyEtaError;

function getTransportationNetworkCompanyEtaEstimate(params) {
  var companies = params.companies,
      from = params.from;
  return createQueryAction("transportation_network_company/eta_estimate?".concat(_qs.default.stringify({
    companies: companies,
    from: from
  })), // endpoint
  transportationNetworkCompanyEtaResponse, // responseAction
  transportationNetworkCompanyEtaError, // errorAction
  {
    rewritePayload: function rewritePayload(payload) {
      return {
        from: from,
        estimates: payload.estimates
      };
    }
  });
} // TNC ride estimate lookup query


var transportationNetworkCompanyRideResponse = (0, _reduxActions.createAction)('TNC_RIDE_RESPONSE');
exports.transportationNetworkCompanyRideResponse = transportationNetworkCompanyRideResponse;
var transportationNetworkCompanyRideError = (0, _reduxActions.createAction)('TNC_RIDE_ERROR');
exports.transportationNetworkCompanyRideError = transportationNetworkCompanyRideError;

function getTransportationNetworkCompanyRideEstimate(params) {
  var company = params.company,
      from = params.from,
      rideType = params.rideType,
      to = params.to;
  return createQueryAction("transportation_network_company/ride_estimate?".concat(_qs.default.stringify({
    company: company,
    from: from,
    rideType: rideType,
    to: to
  })), // endpoint
  transportationNetworkCompanyRideResponse, // responseAction
  transportationNetworkCompanyRideError, // errorAction
  {
    rewritePayload: function rewritePayload(payload) {
      return {
        company: company,
        from: from,
        rideEstimate: payload.rideEstimate,
        to: to
      };
    }
  });
} // Nearby Stops Query


var receivedNearbyStopsResponse = (0, _reduxActions.createAction)('NEARBY_STOPS_RESPONSE');
var receivedNearbyStopsError = (0, _reduxActions.createAction)('NEARBY_STOPS_ERROR');

function findNearbyStops(params) {
  return createQueryAction("index/stops?".concat(_qs.default.stringify(_objectSpread({
    radius: 1000
  }, params))), receivedNearbyStopsResponse, receivedNearbyStopsError, {
    serviceId: 'stops',
    rewritePayload: function rewritePayload(stops) {
      if (stops) {
        // Sort the stops by proximity
        stops.forEach(function (stop) {
          stop.distance = (0, _haversine.default)({
            latitude: params.lat,
            longitude: params.lon
          }, {
            latitude: stop.lat,
            longitude: stop.lon
          });
        });
        stops.sort(function (a, b) {
          return a.distance - b.distance;
        });
        if (params.max && stops.length > params.max) stops = stops.slice(0, params.max);
      }

      return {
        stops: stops
      };
    },
    // retrieve routes for each stop
    postprocess: function postprocess(stops, dispatch, getState) {
      if (params.max && stops.length > params.max) stops = stops.slice(0, params.max);
      stops.forEach(function (stop) {
        return dispatch(findRoutesAtStop(stop.id));
      });
    }
  });
} // Routes at Stop query


var receivedRoutesAtStopResponse = (0, _reduxActions.createAction)('ROUTES_AT_STOP_RESPONSE');
var receivedRoutesAtStopError = (0, _reduxActions.createAction)('ROUTES_AT_STOP_ERROR');

function findRoutesAtStop(stopId) {
  return createQueryAction("index/stops/".concat(stopId, "/routes"), receivedRoutesAtStopResponse, receivedRoutesAtStopError, {
    serviceId: 'stops/routes',
    rewritePayload: function rewritePayload(routes) {
      return {
        stopId: stopId,
        routes: routes
      };
    },
    noThrottle: true
  });
} // Stops within Bounding Box Query


var receivedStopsWithinBBoxResponse = (0, _reduxActions.createAction)('STOPS_WITHIN_BBOX_RESPONSE');
var receivedStopsWithinBBoxError = (0, _reduxActions.createAction)('STOPS_WITHIN_BBOX_ERROR');

function findStopsWithinBBox(params) {
  return createQueryAction("index/stops?".concat(_qs.default.stringify(params)), receivedStopsWithinBBoxResponse, receivedStopsWithinBBoxError, {
    serviceId: 'stops',
    rewritePayload: function rewritePayload(stops) {
      return {
        stops: stops
      };
    }
  });
}

var clearStops = (0, _reduxActions.createAction)('CLEAR_STOPS_OVERLAY');
exports.clearStops = clearStops;
var throttledUrls = {};

function now() {
  return new Date().getTime();
}

var TEN_SECONDS = 10000; // automatically clear throttled urls older than 10 seconds

window.setInterval(function () {
  Object.keys(throttledUrls).forEach(function (key) {
    if (throttledUrls[key] < now() - TEN_SECONDS) {
      delete throttledUrls[key];
    }
  });
}, 1000);
/**
 * Generic helper for constructing API queries. Automatically throttles queries
 * to url to no more than once per 10 seconds.
 *
 * @param {string} endpoint - The API endpoint path (does not include
 *   '../otp/routers/router_id/')
 * @param {Function} responseAction - Action to dispatch on a successful API
 *   response. Accepts payload object parameter.
 * @param {Function} errorAction - Function to invoke on API error response.
 *   Accepts error object parameter.
 * @param {Options} options - Any of the following optional settings:
 *   - rewritePayload: Function to be invoked to modify payload before being
 *       passed to responseAction. Accepts and returns payload object.
 *   - postprocess: Function to be invoked after responseAction is invoked.
 *       Accepts payload, dispatch, getState parameters.
 *   - serviceId: identifier for TransitIndex service used in
 *       alternateTransitIndex configuration.
 *   - fetchOptions: fetch options (e.g., method, body, headers).
 */

function createQueryAction(endpoint, responseAction, errorAction) {
  var options = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee2(dispatch, getState) {
        var otpState, url, api, throttleKey, payload, response, error;
        return regeneratorRuntime.wrap(function _callee2$(_context2) {
          while (1) {
            switch (_context2.prev = _context2.next) {
              case 0:
                otpState = getState().otp;

                if (options.serviceId && otpState.config.alternateTransitIndex && otpState.config.alternateTransitIndex.services.includes(options.serviceId)) {
                  console.log('Using alt service for ' + options.serviceId);
                  url = otpState.config.alternateTransitIndex.apiRoot + endpoint;
                } else {
                  api = otpState.config.api;
                  url = "".concat(api.host).concat(api.port ? ':' + api.port : '').concat(api.path, "/").concat(endpoint);
                }

                if (options.noThrottle) {
                  _context2.next = 10;
                  break;
                }

                // don't make a request to a URL that has already seen the same request
                // within the last 10 seconds
                throttleKey = options.fetchOptions ? "".concat(url, "-").concat((0, _objectHash.default)(options.fetchOptions)) : url;

                if (!(throttledUrls[throttleKey] && throttledUrls[throttleKey] > now() - TEN_SECONDS)) {
                  _context2.next = 9;
                  break;
                }

                // URL already had a request within last 10 seconds, warn and exit
                console.warn("Request throttled for url: ".concat(url));
                return _context2.abrupt("return");

              case 9:
                throttledUrls[throttleKey] = now();

              case 10:
                _context2.prev = 10;
                _context2.next = 13;
                return fetch(url, options.fetchOptions);

              case 13:
                response = _context2.sent;

                if (!(response.status >= 400)) {
                  _context2.next = 18;
                  break;
                }

                error = new Error('Received error from server');
                error.response = response;
                throw error;

              case 18:
                _context2.next = 20;
                return response.json();

              case 20:
                payload = _context2.sent;
                _context2.next = 26;
                break;

              case 23:
                _context2.prev = 23;
                _context2.t0 = _context2["catch"](10);
                return _context2.abrupt("return", dispatch(errorAction(_context2.t0)));

              case 26:
                if (typeof options.rewritePayload === 'function') {
                  dispatch(responseAction(options.rewritePayload(payload)));
                } else {
                  dispatch(responseAction(payload));
                }

                if (typeof options.postprocess === 'function') {
                  options.postprocess(payload, dispatch, getState);
                }

              case 28:
              case "end":
                return _context2.stop();
            }
          }
        }, _callee2, null, [[10, 23]]);
      }));

      return function (_x3, _x4) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
} // TODO: Determine how we might be able to use GraphQL with the alternative
// transit index. Currently this is not easily possible because the alternative
// transit index does not have support for GraphQL and handling both Rest and
// GraphQL queries could introduce potential difficulties for maintainers.
// function createGraphQLQueryAction (query, variables, responseAction, errorAction, options) {
//   const endpoint = `index/graphql`
//   const fetchOptions = {
//     method: 'POST',
//     body: JSON.stringify({ query, variables }),
//     headers: { 'Content-Type': 'application/json' }
//   }
//   return createQueryAction(
//     endpoint,
//     responseAction,
//     errorAction,
//     { ...options, fetchOptions }
//   )
// }

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 */


function setUrlSearch(params) {
  var replaceCurrent = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  return function (dispatch, getState) {
    var base = getState().router.location.pathname;
    var path = "".concat(base, "?").concat(_qs.default.stringify(params));
    if (replaceCurrent) dispatch((0, _connectedReactRouter.replace)(path));else dispatch((0, _connectedReactRouter.push)(path));
  };
}
/**
 * Update the OTP Query parameters in the URL and ensure that the active search
 * is set correctly. Leaves any other existing URL parameters (e.g., UI) unchanged.
 */


function updateOtpUrlParams(otpState, searchId) {
  var otpParams = getRoutingParams(otpState);
  return function (dispatch, getState) {
    var params = {}; // Get all OTP-specific params, which will be retained unchanged in the URL

    var urlParams = getUrlParams();
    Object.keys(urlParams).filter(function (key) {
      return key.indexOf('_') !== -1;
    }).forEach(function (key) {
      params[key] = urlParams[key];
    });
    params.ui_activeSearch = searchId; // Assumes this is a new search and the active itinerary should be reset.

    params.ui_activeItinerary = 0; // Merge in the provided OTP params and update the URL

    dispatch(setUrlSearch(Object.assign(params, otpParams)));
  };
}

//# sourceMappingURL=api.js