'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setElevationPoint = exports.showLegDiagram = exports.switchingLocations = exports.settingLocation = exports.clearingLocation = undefined;

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

exports.clearLocation = clearLocation;
exports.setLocation = setLocation;
exports.setLocationToCurrent = setLocationToCurrent;
exports.switchLocations = switchLocations;

var _isomorphicMapzenSearch = require('isomorphic-mapzen-search');

var _reduxActions = require('redux-actions');

var _form = require('./form');

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

var clearingLocation = exports.clearingLocation = (0, _reduxActions.createAction)('CLEAR_LOCATION');
var settingLocation = exports.settingLocation = (0, _reduxActions.createAction)('SET_LOCATION');
var switchingLocations = exports.switchingLocations = (0, _reduxActions.createAction)('SWITCH_LOCATIONS');

function clearLocation(payload) {
  return function (dispatch, getState) {
    dispatch(clearingLocation(payload));
    dispatch((0, _form.formChanged)());
  };
}

function setLocation(payload) {
  return function (dispatch, getState) {
    var otpState = getState().otp;

    // reverse geocode point location if requested
    if (payload.reverseGeocode) {
      var _otpState$config$geoc = otpState.config.geocoder,
          MAPZEN_KEY = _otpState$config$geoc.MAPZEN_KEY,
          baseUrl = _otpState$config$geoc.baseUrl;
      var point = payload.location;

      (0, _isomorphicMapzenSearch.reverse)({
        apiKey: MAPZEN_KEY,
        point: point,
        format: true,
        url: baseUrl ? baseUrl + '/reverse' : null
      }).then(function (json) {
        // override location name if reverse geocode is successful
        payload.location.name = json[0].address;
        dispatch(settingLocation({
          type: payload.type,
          location: (0, _assign2.default)({}, payload.location, { name: json[0].address })
        }));
        // Trigger form change after reverse geocode so that OTP query contains
        // reverse geocoded place name
        dispatch((0, _form.formChanged)());
      }).catch(function (err) {
        dispatch(settingLocation({
          type: payload.type,
          location: payload.location
        }));
        dispatch((0, _form.formChanged)());
        console.warn(err);
      });
    } else {
      // update the location in the store
      dispatch(settingLocation(payload));
      dispatch((0, _form.formChanged)());
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
      name: '(Current Location)'
    };
    dispatch(settingLocation(payload));
    dispatch((0, _form.formChanged)());
  };
}

function switchLocations() {
  return function (dispatch, getState) {
    var _getState$otp$current = getState().otp.currentQuery,
        from = _getState$otp$current.from,
        to = _getState$otp$current.to;

    dispatch(settingLocation({
      type: 'from',
      location: to
    }));
    dispatch(settingLocation({
      type: 'to',
      location: from
    }));
    dispatch((0, _form.formChanged)());
  };
}

var showLegDiagram = exports.showLegDiagram = (0, _reduxActions.createAction)('SHOW_LEG_DIAGRAM');

var setElevationPoint = exports.setElevationPoint = (0, _reduxActions.createAction)('SET_ELEVATION_POINT');

//# sourceMappingURL=map.js