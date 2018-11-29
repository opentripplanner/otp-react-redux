'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.changingForm = exports.settingQueryParam = undefined;

var _keys = require('babel-runtime/core-js/object/keys');

var _keys2 = _interopRequireDefault(_keys);

exports.setQueryParam = setQueryParam;
exports.parseUrlQueryString = parseUrlQueryString;
exports.formChanged = formChanged;

var _lodash = require('lodash.debounce');

var _lodash2 = _interopRequireDefault(_lodash);

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reduxActions = require('redux-actions');

var _api = require('./api');

var _map = require('../util/map');

var _state = require('../util/state');

var _time = require('../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var settingQueryParam = exports.settingQueryParam = (0, _reduxActions.createAction)('SET_QUERY_PARAM');
var changingForm = exports.changingForm = (0, _reduxActions.createAction)('FORM_CHANGED');

/**
 * Action to update any specified query parameter. Replaces previous series of
 * parameter-specific actions.
 */
function setQueryParam(payload) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload));
    dispatch(formChanged());
  };
}

function parseUrlQueryString(queryString) {
  return function (dispatch, getState) {
    // Trim the leading question mark
    var params = _qs2.default.parse(queryString.substring(1));
    // Filter out the OTP (i.e. non-UI) params and set the initial query
    var planParams = {};
    (0, _keys2.default)(params).forEach(function (key) {
      if (!key.startsWith('ui_')) planParams[key] = params[key];
    });
    // Convert strings to numbers/objects and dispatch
    dispatch(setQueryParam(planParamsToQuery(planParams)));
  };
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

function planParamsToQuery(params) {
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
        query.date = params.date || (0, _time.getCurrentDate)();
        break;
      case 'time':
        query.time = params.time || (0, _time.getCurrentTime)();
        break;
      default:
        if (!isNaN(params[key])) query[key] = parseFloat(params[key]);else query[key] = params[key];
    }
  }
  return query;
}

var debouncedPlanTrip = void 0; // store as variable here, so it can be reused.
var lastDebouncePlanTimeMs = void 0;

function formChanged() {
  return function (dispatch, getState) {
    var otpState = getState().otp;
    // If departArrive is set to 'NOW', update the query time to current
    if (otpState.currentQuery && otpState.currentQuery.departArrive === 'NOW') {
      dispatch(settingQueryParam({ time: (0, _moment2.default)().format('HH:mm') }));
    }

    dispatch(changingForm());
    var _otpState$config = otpState.config,
        autoPlan = _otpState$config.autoPlan,
        debouncePlanTimeMs = _otpState$config.debouncePlanTimeMs;
    // check if a trip plan should be made

    if (autoPlan && (0, _state.queryIsValid)(otpState)) {
      // trip plan should be made

      // check if debouncing function needs to be (re)created
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = (0, _lodash2.default)(function () {
          return dispatch((0, _api.routingQuery)());
        }, debouncePlanTimeMs);
        lastDebouncePlanTimeMs = debouncePlanTimeMs;
      }
      debouncedPlanTrip();
    }
  };
}

//# sourceMappingURL=form.js