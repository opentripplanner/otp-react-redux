'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setUseRealtimeResponse = exports.setActiveStep = exports.setActiveLeg = exports.setActiveItinerary = undefined;

var _reduxActions = require('redux-actions');

var setActiveItinerary = exports.setActiveItinerary = (0, _reduxActions.createAction)('SET_ACTIVE_ITINERARY');
var setActiveLeg = exports.setActiveLeg = (0, _reduxActions.createAction)('SET_ACTIVE_LEG');
var setActiveStep = exports.setActiveStep = (0, _reduxActions.createAction)('SET_ACTIVE_STEP');
var setUseRealtimeResponse = exports.setUseRealtimeResponse = (0, _reduxActions.createAction)('SET_USE_REALTIME_RESPONSE');

//# sourceMappingURL=narrative.js