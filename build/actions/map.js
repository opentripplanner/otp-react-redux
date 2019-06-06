'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setMapPopupLocation = exports.setElevationPoint = exports.showLegDiagram = exports.rememberPlace = exports.forgetPlace = exports.switchingLocations = exports.settingLocation = exports.clearingLocation = undefined;
exports.clearLocation = clearLocation;
exports.setLocation = setLocation;
exports.setLocationToCurrent = setLocationToCurrent;
exports.switchLocations = switchLocations;
exports.setMapPopupLocationAndGeocode = setMapPopupLocationAndGeocode;

var _reduxActions = require('redux-actions');

var _geocoder = require('../util/geocoder');

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

var forgetPlace = exports.forgetPlace = (0, _reduxActions.createAction)('FORGET_PLACE');
var rememberPlace = exports.rememberPlace = (0, _reduxActions.createAction)('REMEMBER_PLACE');

function clearLocation(payload) {
  return function (dispatch, getState) {
    dispatch(clearingLocation(payload));
  };
}

function setLocation(payload) {
  return function (dispatch, getState) {
    var otpState = getState().otp;

    // reverse geocode point location if requested
    if (payload.reverseGeocode) {
      (0, _geocoder.reverse)(payload.location, otpState.config.geocoder).then(function (location) {
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
        to = _getState$otp$current.to;

    dispatch(settingLocation({
      type: 'from',
      location: to
    }));
    dispatch(settingLocation({
      type: 'to',
      location: from
    }));
  };
}

var showLegDiagram = exports.showLegDiagram = (0, _reduxActions.createAction)('SHOW_LEG_DIAGRAM');

var setElevationPoint = exports.setElevationPoint = (0, _reduxActions.createAction)('SET_ELEVATION_POINT');

var setMapPopupLocation = exports.setMapPopupLocation = (0, _reduxActions.createAction)('SET_MAP_POPUP_LOCATION');

function setMapPopupLocationAndGeocode(payload) {
  return function (dispatch, getState) {
    dispatch(setMapPopupLocation(payload));
    (0, _geocoder.reverse)(payload.location, getState().otp.config.geocoder).then(function (location) {
      dispatch(setMapPopupLocation({ location: location }));
    }).catch(function (err) {
      console.warn(err);
    });
  };
}

//# sourceMappingURL=map.js