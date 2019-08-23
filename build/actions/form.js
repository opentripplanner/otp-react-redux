"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.resetForm = resetForm;
exports.setQueryParam = setQueryParam;
exports.parseUrlQueryString = parseUrlQueryString;
exports.formChanged = formChanged;
exports.storeDefaultSettings = exports.clearDefaultSettings = exports.setActiveSearch = exports.clearActiveSearch = exports.settingQueryParam = void 0;

require("core-js/modules/es6.string.iterator");

require("core-js/modules/es6.array.from");

require("core-js/modules/es6.regexp.to-string");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es6.object.keys");

require("core-js/modules/es6.object.assign");

var _lodash = _interopRequireDefault(require("lodash.debounce"));

var _moment = _interopRequireDefault(require("moment"));

var _reduxActions = require("redux-actions");

var _lodash2 = _interopRequireDefault(require("lodash.isequal"));

var _query = require("../util/query");

var _storage = require("../util/storage");

var _state = require("../util/state");

var _time = require("../util/time");

var _ui = require("../util/ui");

var _ui2 = require("../actions/ui");

var _api = require("./api");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread(); }

function _nonIterableSpread() { throw new TypeError("Invalid attempt to spread non-iterable instance"); }

function _iterableToArray(iter) { if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter); }

function _arrayWithoutHoles(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } }

var settingQueryParam = (0, _reduxActions.createAction)('SET_QUERY_PARAM');
exports.settingQueryParam = settingQueryParam;
var clearActiveSearch = (0, _reduxActions.createAction)('CLEAR_ACTIVE_SEARCH');
exports.clearActiveSearch = clearActiveSearch;
var setActiveSearch = (0, _reduxActions.createAction)('SET_ACTIVE_SEARCH');
exports.setActiveSearch = setActiveSearch;
var clearDefaultSettings = (0, _reduxActions.createAction)('CLEAR_DEFAULT_SETTINGS');
exports.clearDefaultSettings = clearDefaultSettings;
var storeDefaultSettings = (0, _reduxActions.createAction)('STORE_DEFAULT_SETTINGS');
exports.storeDefaultSettings = storeDefaultSettings;

function resetForm() {
  return function (dispatch, getState) {
    var otpState = getState().otp;
    var transitModes = otpState.config.modes.transitModes;

    if (otpState.user.defaults) {
      dispatch(settingQueryParam(otpState.user.defaults));
    } else {
      // Get user overrides and apply to default query
      var userOverrides = (0, _storage.getItem)('defaultQuery', {});
      var defaultQuery = Object.assign((0, _query.getDefaultQuery)(otpState.config), userOverrides); // Filter out non-options (i.e., date, places).

      var options = (0, _query.getTripOptionsFromQuery)(defaultQuery); // Default mode is currently WALK,TRANSIT. We need to update this value
      // here to match the list of modes, otherwise the form will break.

      options.mode = ['WALK'].concat(_toConsumableArray(transitModes.map(function (m) {
        return m.mode;
      }))).join(',');
      dispatch(settingQueryParam(options));
    }
  };
}
/**
 * Action to update any specified query parameter. Replaces previous series of
 * parameter-specific actions. If a search ID is provided, a routing query (OTP
 * search) will be kicked off immediately.
 */


function setQueryParam(payload, searchId) {
  return function (dispatch, getState) {
    dispatch(settingQueryParam(payload));
    if (searchId) dispatch((0, _api.routingQuery)(searchId));
  };
}

function parseUrlQueryString() {
  var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : (0, _query.getUrlParams)();
  return function (dispatch, getState) {
    // Filter out the OTP (i.e. non-UI) params and set the initial query
    var planParams = {};
    Object.keys(params).forEach(function (key) {
      if (!key.startsWith('ui_')) planParams[key] = params[key];
    });
    var searchId = params.ui_activeSearch || (0, _storage.randId)(); // Convert strings to numbers/objects and dispatch

    dispatch(setQueryParam((0, _query.planParamsToQuery)(planParams, getState().otp.config), searchId));
  };
}

var debouncedPlanTrip; // store as variable here, so it can be reused.

var lastDebouncePlanTimeMs;

function formChanged(oldQuery, newQuery) {
  return function (dispatch, getState) {
    var otpState = getState().otp; // If departArrive is set to 'NOW', update the query time to current

    if (otpState.currentQuery && otpState.currentQuery.departArrive === 'NOW') {
      dispatch(settingQueryParam({
        time: (0, _moment.default)().format(_time.OTP_API_TIME_FORMAT)
      }));
    } // Determine if either from/to location has changed


    var fromChanged = !(0, _lodash2.default)(oldQuery.from, newQuery.from);
    var toChanged = !(0, _lodash2.default)(oldQuery.to, newQuery.to); // Only clear the main panel if a single location changed. This prevents
    // clearing the panel on load if the app is focused on a stop viewer but a
    // search query should also be visible.

    var oneLocationChanged = fromChanged && !toChanged || !fromChanged && toChanged;

    if (oneLocationChanged) {
      dispatch((0, _ui2.setMainPanelContent)(null));
    } // Clear the current search and return to search screen on mobile when
    // either location changes only if not currently on welcome screen (otherwise
    // when the current position is auto-set the screen will change unexpectedly).


    if ((0, _ui.isMobile)() && (fromChanged || toChanged) && otpState.ui.mobileScreen !== _ui2.MobileScreens.WELCOME_SCREEN) {
      dispatch(clearActiveSearch());
      dispatch((0, _ui2.setMobileScreen)(_ui2.MobileScreens.SEARCH_FORM));
    } // Check whether a trip should be auto-replanned


    var _otpState$config = otpState.config,
        autoPlan = _otpState$config.autoPlan,
        debouncePlanTimeMs = _otpState$config.debouncePlanTimeMs;
    var updatePlan = autoPlan || !(0, _ui.isMobile)() && oneLocationChanged || // TODO: make autoplan configurable at the parameter level?
    (0, _ui.isMobile)() && fromChanged && toChanged;

    if (updatePlan && (0, _state.queryIsValid)(otpState)) {
      // trip plan should be made
      // check if debouncing function needs to be (re)created
      if (!debouncedPlanTrip || lastDebouncePlanTimeMs !== debouncePlanTimeMs) {
        debouncedPlanTrip = (0, _lodash.default)(function () {
          return dispatch((0, _api.routingQuery)());
        }, debouncePlanTimeMs);
        lastDebouncePlanTimeMs = debouncePlanTimeMs;
      }

      debouncedPlanTrip();
    }
  };
}

//# sourceMappingURL=form.js