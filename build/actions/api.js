'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearStops = exports.transportationNetworkCompanyRideError = exports.transportationNetworkCompanyRideResponse = exports.transportationNetworkCompanyEtaError = exports.transportationNetworkCompanyEtaResponse = exports.findGeometryForPatternError = exports.findGeometryForPatternResponse = exports.findPatternsForRouteError = exports.findPatternsForRouteResponse = exports.findRouteError = exports.findRouteResponse = exports.findRoutesError = exports.findRoutesResponse = exports.findStopTimesForStopError = exports.findStopTimesForStopResponse = exports.findGeometryForTripError = exports.findGeometryForTripResponse = exports.findStopTimesForTripError = exports.findStopTimesForTripResponse = exports.findStopsForTripError = exports.findStopsForTripResponse = exports.findTripError = exports.findTripResponse = exports.findStopError = exports.findStopResponse = exports.carRentalError = exports.carRentalResponse = exports.bikeRentalResponse = exports.bikeRentalError = exports.parkAndRideResponse = exports.parkAndRideError = exports.routingError = exports.routingResponse = exports.routingRequest = exports.nonRealtimeRoutingResponse = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

exports.routingQuery = routingQuery;
exports.parkAndRideQuery = parkAndRideQuery;
exports.bikeRentalQuery = bikeRentalQuery;
exports.carRentalQuery = carRentalQuery;
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

var _reduxActions = require('redux-actions');

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _haversine = require('haversine');

var _haversine2 = _interopRequireDefault(_haversine);

var _state = require('../util/state');

var _queryParams = require('../util/query-params');

var _queryParams2 = _interopRequireDefault(_queryParams);

var _query = require('../util/query');

var _itinerary = require('../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* globals fetch */

if (typeof fetch === 'undefined') require('isomorphic-fetch');

// Generic API actions

var nonRealtimeRoutingResponse = exports.nonRealtimeRoutingResponse = (0, _reduxActions.createAction)('NON_REALTIME_ROUTING_RESPONSE');
var routingRequest = exports.routingRequest = (0, _reduxActions.createAction)('ROUTING_REQUEST');
var routingResponse = exports.routingResponse = (0, _reduxActions.createAction)('ROUTING_RESPONSE');
var routingError = exports.routingError = (0, _reduxActions.createAction)('ROUTING_ERROR');

var lastSearchId = 0;

function routingQuery() {
  return function () {
    var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(dispatch, getState) {
      var otpState, routingType, searchId;
      return _regenerator2.default.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              otpState = getState().otp;
              routingType = otpState.currentQuery.routingType;
              searchId = ++lastSearchId;

              if ((0, _state.queryIsValid)(otpState)) {
                _context.next = 5;
                break;
              }

              return _context.abrupt('return');

            case 5:
              dispatch(routingRequest({ routingType: routingType, searchId: searchId }));

              // fetch a realtime route
              fetch(constructRoutingQuery(otpState)).then(getJsonAndCheckResponse).then(function (json) {
                dispatch(routingResponse({ response: json, searchId: searchId }));
              }).catch(function (error) {
                dispatch(routingError({ error: error, searchId: searchId }));
              });

              // also fetch a non-realtime route
              fetch(constructRoutingQuery(otpState, true)).then(getJsonAndCheckResponse).then(function (json) {
                dispatch(nonRealtimeRoutingResponse({ response: json, searchId: searchId }));
              }).catch(function (error) {
                console.error(error);
                // do nothing
              });

            case 8:
            case 'end':
              return _context.stop();
          }
        }
      }, _callee, this);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
}

function getJsonAndCheckResponse(res) {
  if (res.status >= 400) {
    var error = new Error('Received error from server');
    error.response = res;
    throw error;
  }
  return res.json();
}

function constructRoutingQuery(otpState, ignoreRealtimeUpdates) {
  var config = otpState.config,
      currentQuery = otpState.currentQuery;

  var routingType = currentQuery.routingType;
  var isItinerary = routingType === 'ITINERARY';

  // Check for routingType-specific API config; if none, use default API
  var rt = config.routingTypes && config.routingTypes.find(function (rt) {
    return rt.key === routingType;
  });
  var api = rt.api || config.api;
  var planEndpoint = '' + api.host + (api.port ? ':' + api.port : '') + api.path + '/plan';

  var params = {};

  // Start with the universe of OTP parameters defined in query-params.js:
  _queryParams2.default.filter(function (qp) {
    // A given parameter is included in the request if all of the following:
    // 1. Must apply to the active routing type (ITINERARY or PROFILE)
    // 2. Must be included in the current user-defined query
    // 3. Must pass the parameter's applicability test, if one is specified
    return qp.routingTypes.indexOf(routingType) !== -1 && qp.name in currentQuery && (typeof qp.applicable !== 'function' || qp.applicable(currentQuery));
  }).forEach(function (qp) {
    // Translate the applicable parameters according to their rewrite
    // functions (if provided)
    var rewriteFunction = isItinerary ? qp.itineraryRewrite : qp.profileRewrite;
    params = (0, _assign2.default)(params, rewriteFunction ? rewriteFunction(currentQuery[qp.name]) : (0, _defineProperty3.default)({}, qp.name, currentQuery[qp.name]));
  });

  // Additional processing specific to ITINERARY mode
  if (isItinerary) {
    // override ignoreRealtimeUpdates if provided
    if (typeof ignoreRealtimeUpdates === 'boolean') {
      params.ignoreRealtimeUpdates = ignoreRealtimeUpdates;
    }

    // check date/time validity; ignore both if either is invalid
    var dateValid = (0, _moment2.default)(params.date, 'YYYY-MM-DD').isValid();
    var timeValid = (0, _moment2.default)(params.time, 'H:mm').isValid();

    if (!dateValid || !timeValid) {
      delete params.time;
      delete params.date;
    }

    // temp: set additional parameters for CAR_HAIL or CAR_RENT trips
    if (params.mode && (params.mode.includes('CAR_HAIL') || params.mode.includes('CAR_RENT'))) {
      params.minTransitDistance = '50%';
      // increase search timeout because these queries can take a while
      params.searchTimeout = 10000;
    }

    // Additional processing specific to PROFILE mode
  } else {
    // check start and end time validity; ignore both if either is invalid
    var startTimeValid = (0, _moment2.default)(params.startTime, 'H:mm').isValid();
    var endTimeValid = (0, _moment2.default)(params.endTime, 'H:mm').isValid();

    if (!startTimeValid || !endTimeValid) {
      delete params.startTimeValid;
      delete params.endTimeValid;
    }
  }

  // TODO: check that valid from/to locations are provided

  // FIXME: This is only performed when ignoring realtimeupdates currently, just
  // to ensure it is not repeated twice.
  if (ignoreRealtimeUpdates) (0, _query.updateOtpUrlParams)(params);

  // hack to add walking to driving/TNC trips
  if ((0, _itinerary.hasCar)(params.mode)) {
    params.mode += ',WALK';
  }

  return planEndpoint + '?' + _qs2.default.stringify(params);
}

// Park and Ride location query

var parkAndRideError = exports.parkAndRideError = (0, _reduxActions.createAction)('PARK_AND_RIDE_ERROR');
var parkAndRideResponse = exports.parkAndRideResponse = (0, _reduxActions.createAction)('PARK_AND_RIDE_RESPONSE');

function parkAndRideQuery(params) {
  var endpoint = 'park_and_ride';
  if (params && (0, _keys2.default)(params).length > 0) {
    endpoint += '?' + (0, _keys2.default)(params).map(function (key) {
      return key + '=' + params[key];
    }).join('&');
  }
  return createQueryAction(endpoint, parkAndRideResponse, parkAndRideError);
}

// bike rental station query

var bikeRentalError = exports.bikeRentalError = (0, _reduxActions.createAction)('BIKE_RENTAL_ERROR');
var bikeRentalResponse = exports.bikeRentalResponse = (0, _reduxActions.createAction)('BIKE_RENTAL_RESPONSE');

function bikeRentalQuery(params) {
  return createQueryAction('bike_rental', bikeRentalResponse, bikeRentalError);
}

// Car rental (e.g. car2go) locations lookup query

var carRentalResponse = exports.carRentalResponse = (0, _reduxActions.createAction)('CAR_RENTAL_RESPONSE');
var carRentalError = exports.carRentalError = (0, _reduxActions.createAction)('CAR_RENTAL_ERROR');

function carRentalQuery(params) {
  return createQueryAction('car_rental', carRentalResponse, carRentalError);
}

// Single stop lookup query

var findStopResponse = exports.findStopResponse = (0, _reduxActions.createAction)('FIND_STOP_RESPONSE');
var findStopError = exports.findStopError = (0, _reduxActions.createAction)('FIND_STOP_ERROR');

function findStop(params) {
  return createQueryAction('index/stops/' + params.stopId, findStopResponse, findStopError, {
    serviceId: 'stops',
    postprocess: function postprocess(payload, dispatch) {
      dispatch(findRoutesAtStop(params.stopId));
      dispatch(findStopTimesForStop({ stopId: params.stopId }));
    }
  });
}

// Single trip lookup query

var findTripResponse = exports.findTripResponse = (0, _reduxActions.createAction)('FIND_TRIP_RESPONSE');
var findTripError = exports.findTripError = (0, _reduxActions.createAction)('FIND_TRIP_ERROR');

function findTrip(params) {
  return createQueryAction('index/trips/' + params.tripId, findTripResponse, findTripError, {
    postprocess: function postprocess(payload, dispatch) {
      dispatch(findStopsForTrip({ tripId: params.tripId }));
      dispatch(findStopTimesForTrip({ tripId: params.tripId }));
      dispatch(findGeometryForTrip({ tripId: params.tripId }));
    }
  });
}

// Stops for trip query

var findStopsForTripResponse = exports.findStopsForTripResponse = (0, _reduxActions.createAction)('FIND_STOPS_FOR_TRIP_RESPONSE');
var findStopsForTripError = exports.findStopsForTripError = (0, _reduxActions.createAction)('FIND_STOPS_FOR_TRIP_ERROR');

function findStopsForTrip(params) {
  return createQueryAction('index/trips/' + params.tripId + '/stops', findStopsForTripResponse, findStopsForTripError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        tripId: params.tripId,
        stops: payload
      };
    }
  });
}

// Stop times for trip query

var findStopTimesForTripResponse = exports.findStopTimesForTripResponse = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_TRIP_RESPONSE');
var findStopTimesForTripError = exports.findStopTimesForTripError = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_TRIP_ERROR');

function findStopTimesForTrip(params) {
  return createQueryAction('index/trips/' + params.tripId + '/stoptimes', findStopTimesForTripResponse, findStopTimesForTripError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        tripId: params.tripId,
        stopTimes: payload
      };
    }
  });
}

// Geometry for trip query

var findGeometryForTripResponse = exports.findGeometryForTripResponse = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_TRIP_RESPONSE');
var findGeometryForTripError = exports.findGeometryForTripError = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_TRIP_ERROR');

function findGeometryForTrip(params) {
  return createQueryAction('index/trips/' + params.tripId + '/geometry', findGeometryForTripResponse, findGeometryForTripError, function (payload) {
    return {
      tripId: params.tripId,
      geometry: payload
    };
  });
}

// Stop times for stop query

var findStopTimesForStopResponse = exports.findStopTimesForStopResponse = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_STOP_RESPONSE');
var findStopTimesForStopError = exports.findStopTimesForStopError = (0, _reduxActions.createAction)('FIND_STOP_TIMES_FOR_STOP_ERROR');

function findStopTimesForStop(params) {
  return createQueryAction('index/stops/' + params.stopId + '/stoptimes?timeRange=14400', findStopTimesForStopResponse, findStopTimesForStopError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        stopId: params.stopId,
        stopTimes: payload
      };
    }
  });
}

// Routes lookup query

var findRoutesResponse = exports.findRoutesResponse = (0, _reduxActions.createAction)('FIND_ROUTES_RESPONSE');
var findRoutesError = exports.findRoutesError = (0, _reduxActions.createAction)('FIND_ROUTES_ERROR');

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
}

// Single Route lookup query

var findRouteResponse = exports.findRouteResponse = (0, _reduxActions.createAction)('FIND_ROUTE_RESPONSE');
var findRouteError = exports.findRouteError = (0, _reduxActions.createAction)('FIND_ROUTE_ERROR');

function findRoute(params) {
  return createQueryAction('index/routes/' + params.routeId, findRouteResponse, findRouteError, {
    postprocess: function postprocess(payload, dispatch) {
      // load patterns
      dispatch(findPatternsForRoute({ routeId: params.routeId }));
    }
  });
}

// Patterns for Route lookup query

var findPatternsForRouteResponse = exports.findPatternsForRouteResponse = (0, _reduxActions.createAction)('FIND_PATTERNS_FOR_ROUTE_RESPONSE');
var findPatternsForRouteError = exports.findPatternsForRouteError = (0, _reduxActions.createAction)('FIND_PATTERNS_FOR_ROUTE_ERROR');

function findPatternsForRoute(params) {
  return createQueryAction('index/routes/' + params.routeId + '/patterns', findPatternsForRouteResponse, findPatternsForRouteError, {
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
}

// Geometry for Pattern lookup query

var findGeometryForPatternResponse = exports.findGeometryForPatternResponse = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_PATTERN_RESPONSE');
var findGeometryForPatternError = exports.findGeometryForPatternError = (0, _reduxActions.createAction)('FIND_GEOMETRY_FOR_PATTERN_ERROR');

function findGeometryForPattern(params) {
  return createQueryAction('index/patterns/' + params.patternId + '/geometry', findGeometryForPatternResponse, findGeometryForPatternError, {
    rewritePayload: function rewritePayload(payload) {
      return {
        routeId: params.routeId,
        patternId: params.patternId,
        geometry: payload
      };
    }
  });
}

// TNC ETA estimate lookup query

var transportationNetworkCompanyEtaResponse = exports.transportationNetworkCompanyEtaResponse = (0, _reduxActions.createAction)('TNC_ETA_RESPONSE');
var transportationNetworkCompanyEtaError = exports.transportationNetworkCompanyEtaError = (0, _reduxActions.createAction)('TNC_ETA_ERROR');

function getTransportationNetworkCompanyEtaEstimate(params) {
  var companies = params.companies,
      from = params.from;

  return createQueryAction('transportation_network_company/eta_estimate?' + _qs2.default.stringify({
    companies: companies,
    from: from
  }), // endpoint
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
}

// TNC ride estimate lookup query

var transportationNetworkCompanyRideResponse = exports.transportationNetworkCompanyRideResponse = (0, _reduxActions.createAction)('TNC_RIDE_RESPONSE');
var transportationNetworkCompanyRideError = exports.transportationNetworkCompanyRideError = (0, _reduxActions.createAction)('TNC_RIDE_ERROR');

function getTransportationNetworkCompanyRideEstimate(params) {
  var company = params.company,
      from = params.from,
      rideType = params.rideType,
      to = params.to;

  return createQueryAction('transportation_network_company/ride_estimate?' + _qs2.default.stringify({
    company: company,
    from: from,
    rideType: rideType,
    to: to
  }), // endpoint
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
}

// Nearby Stops Query

var receivedNearbyStopsResponse = (0, _reduxActions.createAction)('NEARBY_STOPS_RESPONSE');
var receivedNearbyStopsError = (0, _reduxActions.createAction)('NEARBY_STOPS_ERROR');

function findNearbyStops(params) {
  return createQueryAction('index/stops?' + _qs2.default.stringify((0, _extends3.default)({ radius: 1000 }, params)), receivedNearbyStopsResponse, receivedNearbyStopsError, {
    serviceId: 'stops',
    rewritePayload: function rewritePayload(stops) {
      if (stops) {
        // Sort the stops by proximity
        stops.forEach(function (stop) {
          stop.distance = (0, _haversine2.default)({ latitude: params.lat, longitude: params.lon }, { latitude: stop.lat, longitude: stop.lon });
        });
        stops.sort(function (a, b) {
          return a.distance - b.distance;
        });
        if (params.max && stops.length > params.max) stops = stops.slice(0, params.max);
      }
      return { stops: stops };
    },
    // retrieve routes for each stop
    postprocess: function postprocess(stops, dispatch, getState) {
      if (params.max && stops.length > params.max) stops = stops.slice(0, params.max);
      stops.forEach(function (stop) {
        return dispatch(findRoutesAtStop(stop.id));
      });
    }
  });
}

// Routes at Stop query

var receivedRoutesAtStopResponse = (0, _reduxActions.createAction)('ROUTES_AT_STOP_RESPONSE');
var receivedRoutesAtStopError = (0, _reduxActions.createAction)('ROUTES_AT_STOP_ERROR');

function findRoutesAtStop(stopId) {
  return createQueryAction('index/stops/' + stopId + '/routes', receivedRoutesAtStopResponse, receivedRoutesAtStopError, {
    serviceId: 'stops/routes',
    rewritePayload: function rewritePayload(routes) {
      return { stopId: stopId, routes: routes };
    }
  });
}

// Stops within Bounding Box Query

var receivedStopsWithinBBoxResponse = (0, _reduxActions.createAction)('STOPS_WITHIN_BBOX_RESPONSE');
var receivedStopsWithinBBoxError = (0, _reduxActions.createAction)('STOPS_WITHIN_BBOX_ERROR');

function findStopsWithinBBox(params) {
  return createQueryAction('index/stops?' + _qs2.default.stringify(params), receivedStopsWithinBBoxResponse, receivedStopsWithinBBoxError, {
    serviceId: 'stops',
    rewritePayload: function rewritePayload(stops) {
      return { stops: stops };
    }
  });
}

var clearStops = exports.clearStops = (0, _reduxActions.createAction)('CLEAR_STOPS_OVERLAY');

/**
 * Generic helper for constructing API queries
 *
 * @param {String} endpoint - The API endpoint path (does not include
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
 */

function createQueryAction(endpoint, responseAction, errorAction, options) {
  return function () {
    var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(dispatch, getState) {
      var otpState, url, api, payload, response, error;
      return _regenerator2.default.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              otpState = getState().otp;
              url = void 0;

              if (options && options.serviceId && otpState.config.alternateTransitIndex && otpState.config.alternateTransitIndex.services.includes(options.serviceId)) {
                console.log('Using alt service for ' + options.serviceId);
                url = otpState.config.alternateTransitIndex.apiRoot + endpoint;
              } else {
                api = otpState.config.api;

                url = '' + api.host + (api.port ? ':' + api.port : '') + api.path + '/' + endpoint;
              }
              payload = void 0;
              _context2.prev = 4;
              _context2.next = 7;
              return fetch(url);

            case 7:
              response = _context2.sent;

              if (!(response.status >= 400)) {
                _context2.next = 12;
                break;
              }

              error = new Error('Received error from server');

              error.response = response;
              throw error;

            case 12:
              _context2.next = 14;
              return response.json();

            case 14:
              payload = _context2.sent;
              _context2.next = 20;
              break;

            case 17:
              _context2.prev = 17;
              _context2.t0 = _context2['catch'](4);
              return _context2.abrupt('return', dispatch(errorAction(_context2.t0)));

            case 20:

              if (options && typeof options.rewritePayload === 'function') {
                dispatch(responseAction(options.rewritePayload(payload)));
              } else {
                dispatch(responseAction(payload));
              }

              if (options && typeof options.postprocess === 'function') {
                options.postprocess(payload, dispatch, getState);
              }

            case 22:
            case 'end':
              return _context2.stop();
          }
        }
      }, _callee2, this, [[4, 17]]);
    }));

    return function (_x3, _x4) {
      return _ref3.apply(this, arguments);
    };
  }();
}

//# sourceMappingURL=api.js