"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.clearLocation = clearLocation;
exports.setLocation = setLocation;
exports.setLocationToCurrent = setLocationToCurrent;
exports.switchLocations = switchLocations;
exports.setMapPopupLocationAndGeocode = setMapPopupLocationAndGeocode;
exports.setMapPopupLocation = exports.setElevationPoint = exports.showLegDiagram = exports.rememberStop = exports.forgetStop = exports.rememberPlace = exports.forgetPlace = void 0;

var _reduxActions = require("redux-actions");

var _api = require("./api");

var _form = require("./form");

var _geocoder = _interopRequireDefault(require("../util/geocoder"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* SET_LOCATION action creator. Updates a from or to location in the store
 *
 * payload format: {
 *   type: 'from' or 'to'
 *   location: {
 *     name: (string),
 *     lat: (number)
 *     lat: (number)
 *   }
 */
// Private actions
var clearingLocation = (0, _reduxActions.createAction)('CLEAR_LOCATION');
var settingLocation = (0, _reduxActions.createAction)('SET_LOCATION'); // Public actions

var forgetPlace = (0, _reduxActions.createAction)('FORGET_PLACE');
exports.forgetPlace = forgetPlace;
var rememberPlace = (0, _reduxActions.createAction)('REMEMBER_PLACE');
exports.rememberPlace = rememberPlace;
var forgetStop = (0, _reduxActions.createAction)('FORGET_STOP');
exports.forgetStop = forgetStop;
var rememberStop = (0, _reduxActions.createAction)('REMEMBER_STOP');
exports.rememberStop = rememberStop;

function clearLocation(payload) {
  return function (dispatch, getState) {
    // Dispatch the clear location action and then clear the active search (so
    // that the map and narrative are not showing a search when one or both
    // locations are not defined).
    dispatch(clearingLocation(payload));
    dispatch((0, _form.clearActiveSearch)());
  };
}

function setLocation(payload) {
  return function (dispatch, getState) {
    var otpState = getState().otp; // reverse geocode point location if requested

    if (payload.reverseGeocode) {
      (0, _geocoder.default)(otpState.config.geocoder).reverse({
        point: payload.location
      }).then(function (location) {
        dispatch(settingLocation({
          type: payload.type,
          location: location
        }));
      }).catch(function (err) {
        dispatch(settingLocation({
          type: payload.type,
          location: payload.location
        }));
        console.warn(err);
      });
    } else {
      // update the location in the store
      dispatch(settingLocation(payload));
    }
  };
}
/* payload is simply { type: 'from'|'to' }; location filled in automatically */


function setLocationToCurrent(payload) {
  return function (dispatch, getState) {
    var currentPosition = getState().otp.location.currentPosition;
    if (currentPosition.error || !currentPosition.coords) return;
    payload.location = {
      lat: currentPosition.coords.latitude,
      lon: currentPosition.coords.longitude,
      name: '(Current Location)',
      category: 'CURRENT_LOCATION'
    };
    dispatch(settingLocation(payload));
  };
}

function switchLocations() {
  return function (dispatch, getState) {
    var _getState$otp$current = getState().otp.currentQuery,
        from = _getState$otp$current.from,
        to = _getState$otp$current.to; // First, reverse the locations.

    dispatch(settingLocation({
      type: 'from',
      location: to
    }));
    dispatch(settingLocation({
      type: 'to',
      location: from
    })); // Then kick off a routing query (if the query is invalid, search will abort).

    dispatch((0, _api.routingQuery)());
  };
}

var showLegDiagram = (0, _reduxActions.createAction)('SHOW_LEG_DIAGRAM');
exports.showLegDiagram = showLegDiagram;
var setElevationPoint = (0, _reduxActions.createAction)('SET_ELEVATION_POINT');
exports.setElevationPoint = setElevationPoint;
var setMapPopupLocation = (0, _reduxActions.createAction)('SET_MAP_POPUP_LOCATION');
exports.setMapPopupLocation = setMapPopupLocation;

function setMapPopupLocationAndGeocode(payload) {
  return function (dispatch, getState) {
    dispatch(setMapPopupLocation(payload));
    (0, _geocoder.default)(getState().otp.config.geocoder).reverse({
      point: payload.location
    }).then(function (location) {
      dispatch(setMapPopupLocation({
        location: location
      }));
    }).catch(function (err) {
      console.warn(err);
    });
  };
}

//# sourceMappingURL=map.js