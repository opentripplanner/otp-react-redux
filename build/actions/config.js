"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.updateOverlayVisibility = exports.setRouterId = exports.setMapZoom = exports.setMapCenter = exports.setAutoPlan = void 0;

var _reduxActions = require("redux-actions");

var setAutoPlan = (0, _reduxActions.createAction)('SET_AUTOPLAN'); // TODO: this should eventually be handled via mapState

exports.setAutoPlan = setAutoPlan;
var setMapCenter = (0, _reduxActions.createAction)('SET_MAP_CENTER');
exports.setMapCenter = setMapCenter;
var setMapZoom = (0, _reduxActions.createAction)('SET_MAP_ZOOM');
exports.setMapZoom = setMapZoom;
var setRouterId = (0, _reduxActions.createAction)('SET_ROUTER_ID');
exports.setRouterId = setRouterId;
var updateOverlayVisibility = (0, _reduxActions.createAction)('UPDATE_OVERLAY_VISIBILITY');
exports.updateOverlayVisibility = updateOverlayVisibility;

//# sourceMappingURL=config.js