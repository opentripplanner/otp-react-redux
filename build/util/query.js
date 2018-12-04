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
exports.updateOtpUrlParams = updateOtpUrlParams;
exports.updateUiUrlParams = updateUiUrlParams;
exports.getUiUrlParams = getUiUrlParams;

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _itinerary = require('./itinerary');

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

/**
 * Update the OTP Query parameters in the URL. Leaves any other existing URL
 * parameters unchanged.
 */

function updateOtpUrlParams(otpParams) {
  var params = {};

  // Get all non-OTP params, which will be retained unchanged in the URL
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

//# sourceMappingURL=query.js