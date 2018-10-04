'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setMapZoom = exports.setMapCenter = exports.setAutoPlan = undefined;

var _reduxActions = require('redux-actions');

var setAutoPlan = exports.setAutoPlan = (0, _reduxActions.createAction)('SET_AUTOPLAN');

// TODO: this should eventually be handled via mapState
var setMapCenter = exports.setMapCenter = (0, _reduxActions.createAction)('SET_MAP_CENTER');
var setMapZoom = exports.setMapZoom = (0, _reduxActions.createAction)('SET_MAP_ZOOM');

//# sourceMappingURL=config.js