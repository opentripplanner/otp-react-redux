"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getQueryParamProperty = getQueryParamProperty;
exports.ensureSingleAccessMode = ensureSingleAccessMode;
exports.getUrlParams = getUrlParams;
exports.getOtpUrlParams = getOtpUrlParams;
exports.summarizeQuery = summarizeQuery;
exports.getUiUrlParams = getUiUrlParams;
exports.getTripOptionsFromQuery = getTripOptionsFromQuery;
exports.isNotDefaultQuery = isNotDefaultQuery;
exports.getDefaultQuery = getDefaultQuery;
exports.planParamsToQuery = planParamsToQuery;
exports.defaultParams = void 0;

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.object.assign");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.array.find");

var _qs = _interopRequireDefault(require("qs"));

var _itinerary = require("./itinerary");

var _map = require("./map");

var _queryParams = _interopRequireDefault(require("./query-params"));

var _state = require("./state");

var _time = require("./time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* The list of default parameters considered in the settings panel */
var defaultParams = ['wheelchair', 'maxWalkDistance', 'maxWalkTime', 'walkSpeed', 'maxBikeDistance', 'maxBikeTime', 'bikeSpeed', 'optimize', 'optimizeBike', 'maxEScooterDistance', 'watts'];
/* A function to retrieve a property value from an entry in the query-params
 * table, checking for either a static value or a function */

exports.defaultParams = defaultParams;

function getQueryParamProperty(paramInfo, property, query) {
  return typeof paramInfo[property] === 'function' ? paramInfo[property](query) : paramInfo[property];
}

function ensureSingleAccessMode(queryModes) {
  // Count the number of access modes
  var accessCount = queryModes.filter(function (m) {
    return (0, _itinerary.isAccessMode)(m);
  }).length; // If multiple access modes are specified, keep only the first one

  if (accessCount > 1) {
    var firstAccess = queryModes.find(function (m) {
      return (0, _itinerary.isAccessMode)(m);
    });
    queryModes = queryModes.filter(function (m) {
      return !(0, _itinerary.isAccessMode)(m) || m === firstAccess;
    }); // If no access modes are specified, add 'WALK' as the default
  } else if (accessCount === 0) {
    queryModes.push('WALK');
  }

  return queryModes;
}

function getUrlParams() {
  return _qs.default.parse(window.location.href.split('?')[1]);
}

function getOtpUrlParams() {
  return Object.keys(getUrlParams()).filter(function (key) {
    return !key.startsWith('ui_');
  });
}

function findLocationType(location) {
  var locations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var types = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : ['home', 'work', 'suggested'];
  var match = locations.find(function (l) {
    return (0, _map.matchLatLon)(l, location);
  });
  return match && types.indexOf(match.type) !== -1 ? match.type : null;
}

function summarizeQuery(query) {
  var locations = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
  var from = findLocationType(query.from, locations) || query.from.name.split(',')[0];
  var to = findLocationType(query.to, locations) || query.to.name.split(',')[0];
  var mode = (0, _itinerary.hasTransit)(query.mode) ? 'Transit' : (0, _itinerary.toSentenceCase)(query.mode);
  return "".concat(mode, " from ").concat(from, " to ").concat(to);
}
/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */


function getUiUrlParams(otpState) {
  var activeSearch = (0, _state.getActiveSearch)(otpState);
  var uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0,
    ui_activeSearch: otpState.activeSearchId
  };
  return uiParams;
}

function getTripOptionsFromQuery(query) {
  var keepPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;
  var options = Object.assign({}, query); // Delete time/date options and from/to

  delete options.time;
  delete options.departArrive;
  delete options.date;

  if (!keepPlace) {
    delete options.from;
    delete options.to;
  }

  return options;
}
/**
 * Gets the default query param by executing the default value function with the
 * provided otp config if the default value is a function.
 */


function getDefaultQueryParamValue(param, config) {
  return typeof param.default === 'function' ? param.default(config) : param.default;
}
/**
 * Determines whether the specified query differs from the default query, i.e.,
 * whether the user has modified any trip options (including mode) from their
 * default values.
 */


function isNotDefaultQuery(query, config) {
  var activeModes = query.mode.split(',');
  var defaultModes = (0, _itinerary.getTransitModes)(config).concat(['WALK']);
  var queryIsDifferent = false;
  var modesEqual = activeModes.length === defaultModes.length && activeModes.sort().every(function (value, index) {
    return value === defaultModes.sort()[index];
  });

  if (!modesEqual) {
    queryIsDifferent = true;
  } else {
    defaultParams.forEach(function (param) {
      var paramInfo = _queryParams.default.find(function (qp) {
        return qp.name === param;
      }); // Check that the parameter applies to the specified routingType


      if (!paramInfo.routingTypes.includes(query.routingType)) return; // Check that the applicability test (if provided) is satisfied

      if (typeof paramInfo.applicable === 'function' && !paramInfo.applicable(query, config)) return;

      if (query[param] !== getDefaultQueryParamValue(paramInfo, config)) {
        queryIsDifferent = true;
      }
    });
  }

  return queryIsDifferent;
}
/**
 * Get the default query to OTP based on the given config.
 *
 * @param config the config in the otp-rr store.
 */


function getDefaultQuery(config) {
  var defaultQuery = {
    routingType: 'ITINERARY'
  };

  _queryParams.default.filter(function (qp) {
    return 'default' in qp;
  }).forEach(function (qp) {
    defaultQuery[qp.name] = getDefaultQueryParamValue(qp, config);
  });

  return defaultQuery;
}
/**
 * Create a otp query based on a the url params.
 *
 * @param  {Object} params An object representing the parsed querystring of url
 *    params.
 * @param config the config in the otp-rr store.
 */


function planParamsToQuery(params, config) {
  var query = {};

  for (var key in params) {
    switch (key) {
      case 'fromPlace':
        query.from = parseLocationString(params.fromPlace);
        break;

      case 'toPlace':
        query.to = parseLocationString(params.toPlace);
        break;

      case 'arriveBy':
        query.departArrive = params.arriveBy === 'true' ? 'ARRIVE' : params.arriveBy === 'false' ? 'DEPART' : 'NOW';
        break;

      case 'date':
        query.date = params.date || (0, _time.getCurrentDate)(config);
        break;

      case 'time':
        query.time = params.time || (0, _time.getCurrentTime)(config);
        break;

      default:
        if (!isNaN(params[key])) query[key] = parseFloat(params[key]);else query[key] = params[key];
    }
  }

  return query;
}
/**
 * OTP allows passing a location in the form '123 Main St::lat,lon', so we check
 * for the double colon and parse the coordinates accordingly.
 */


function parseLocationString(value) {
  var parts = value.split('::');
  var coordinates = parts[1] ? (0, _map.stringToCoords)(parts[1]) : (0, _map.stringToCoords)(parts[0]);
  var name = parts[1] ? parts[0] : (0, _map.coordsToString)(coordinates);
  return coordinates.length === 2 ? {
    name: name || null,
    lat: coordinates[0] || null,
    lon: coordinates[1] || null
  } : null;
}

//# sourceMappingURL=query.js