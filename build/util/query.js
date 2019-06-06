'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.defaultParams = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.getQueryParamProperty = getQueryParamProperty;
exports.ensureSingleAccessMode = ensureSingleAccessMode;
exports.setUrlSearch = setUrlSearch;
exports.getUrlParams = getUrlParams;
exports.updateOtpUrlParams = updateOtpUrlParams;
exports.updateUiUrlParams = updateUiUrlParams;
exports.getUiUrlParams = getUiUrlParams;
exports.getJSONFromStorage = getJSONFromStorage;
exports.getTripOptionsFromQuery = getTripOptionsFromQuery;
exports.isNotDefaultQuery = isNotDefaultQuery;
exports.getDefaultQuery = getDefaultQuery;

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _itinerary = require('./itinerary');

var _queryParams = require('./query-params');

var _queryParams2 = _interopRequireDefault(_queryParams);

var _state = require('./state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* The list of default parameters considered in the settings panel */

var defaultParams = exports.defaultParams = ['wheelchair', 'maxWalkDistance', 'maxWalkTime', 'walkSpeed', 'maxBikeDistance', 'maxBikeTime', 'bikeSpeed', 'optimize', 'optimizeBike'];

/* A function to retrieve a property value from an entry in the query-params
 * table, checking for either a static value or a function */

function getQueryParamProperty(paramInfo, property, query) {
  return typeof paramInfo[property] === 'function' ? paramInfo[property](query) : paramInfo[property];
}

function ensureSingleAccessMode(queryModes) {
  // Count the number of access modes
  var accessCount = queryModes.filter(function (m) {
    return (0, _itinerary.isAccessMode)(m);
  }).length;

  // If multiple access modes are specified, keep only the first one
  if (accessCount > 1) {
    var firstAccess = queryModes.find(function (m) {
      return (0, _itinerary.isAccessMode)(m);
    });
    queryModes = queryModes.filter(function (m) {
      return !(0, _itinerary.isAccessMode)(m) || m === firstAccess;
    });

    // If no access modes are specified, add 'WALK' as the default
  } else if (accessCount === 0) {
    queryModes.push('WALK');
  }

  return queryModes;
}

/**
 * Update the browser/URL history with new parameters
 * NOTE: This has not been tested for profile-based journeys.
 * FIXME: Should we be using react-router-redux for this?
 */

function setUrlSearch(params) {
  var base = window.location.href.split('?')[0];
  window.history.pushState(params, '', base + '?' + _qs2.default.stringify(params));
}

function getUrlParams() {
  return _qs2.default.parse(window.location.href.split('?')[1]);
}

/**
 * Update the OTP Query parameters in the URL. Leaves any other existing URL
 * parameters unchanged.
 */

function updateOtpUrlParams(otpParams) {
  var params = {};

  // Get all OTP-specific params, which will be retained unchanged in the URL
  if (window.history.state) {
    (0, _keys2.default)(window.history.state).filter(function (key) {
      return key.indexOf('_') !== -1;
    }).forEach(function (key) {
      params[key] = window.history.state[key];
    });
  }

  // Merge in the provided OTP params and update the URL
  setUrlSearch((0, _assign2.default)(params, otpParams));
}

/**
 * Update the UI-state parameters in the URL. Leaves any other existing URL
 * parameters unchanged.
 */

function updateUiUrlParams(uiParams) {
  var params = {};

  // Get all non-OTP params, which will be retained unchanged in the URL
  if (window.history.state) {
    (0, _keys2.default)(window.history.state).filter(function (key) {
      return !key.startsWith('ui_');
    }).forEach(function (key) {
      params[key] = window.history.state[key];
    });
  }

  // Merge in the provided UI params and update the URL
  setUrlSearch((0, _assign2.default)(params, uiParams));
}

/**
 * Assemble any UI-state properties to be tracked via URL into a single object
 * TODO: Expand to include additional UI properties
 */

function getUiUrlParams(otpState) {
  var activeSearch = (0, _state.getActiveSearch)(otpState);
  var uiParams = {
    ui_activeItinerary: activeSearch ? activeSearch.activeItinerary : 0
  };
  return uiParams;
}

function getJSONFromStorage(name) {
  var nullIfNotFound = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var itemAsString = void 0;
  try {
    itemAsString = window.localStorage.getItem(name);
    var json = JSON.parse(itemAsString);
    if (json) return json;else return nullIfNotFound ? null : {};
  } catch (e) {
    // Catch any errors associated with parsing bad JSON.
    console.warn(e, itemAsString);
    return nullIfNotFound ? null : {};
  }
}

function getTripOptionsFromQuery(query) {
  var keepPlace = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

  var options = (0, _assign2.default)({}, query);
  // Delete time/date options and from/to
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
      var paramInfo = _queryParams2.default.find(function (qp) {
        return qp.name === param;
      });
      // Check that the parameter applies to the specified routingType
      if (!paramInfo.routingTypes.includes(query.routingType)) return;
      // Check that the applicability test (if provided) is satisfied
      if (typeof paramInfo.applicable === 'function' && !paramInfo.applicable(query, config)) return;
      if (query[param] !== paramInfo.default) {
        queryIsDifferent = true;
      }
    });
  }
  return queryIsDifferent;
}

function getDefaultQuery() {
  var defaultQuery = { routingType: 'ITINERARY' };
  _queryParams2.default.filter(function (qp) {
    return 'default' in qp;
  }).forEach(function (qp) {
    defaultQuery[qp.name] = qp.default;
  });
  return defaultQuery;
}

//# sourceMappingURL=query.js