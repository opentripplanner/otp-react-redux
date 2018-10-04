'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.MobileScreens = exports.MainPanelContent = exports.setViewedRoute = exports.clearViewedTrip = exports.setViewedTrip = exports.clearViewedStop = exports.setViewedStop = exports.setMainPanelContent = exports.setMobileScreen = undefined;

var _reduxActions = require('redux-actions');

var setMobileScreen = exports.setMobileScreen = (0, _reduxActions.createAction)('SET_MOBILE_SCREEN');

var setMainPanelContent = exports.setMainPanelContent = (0, _reduxActions.createAction)('SET_MAIN_PANEL_CONTENT');

// Stop Viewer actions

var setViewedStop = exports.setViewedStop = (0, _reduxActions.createAction)('SET_VIEWED_STOP');

var clearViewedStop = exports.clearViewedStop = (0, _reduxActions.createAction)('CLEAR_VIEWED_STOP');

// Trip Viewer actions

var setViewedTrip = exports.setViewedTrip = (0, _reduxActions.createAction)('SET_VIEWED_TRIP');

var clearViewedTrip = exports.clearViewedTrip = (0, _reduxActions.createAction)('CLEAR_VIEWED_TRIP');

// Route Viewer actions

var setViewedRoute = exports.setViewedRoute = (0, _reduxActions.createAction)('SET_VIEWED_ROUTE');

// UI state enums

var MainPanelContent = exports.MainPanelContent = {
  ROUTE_VIEWER: 1
};

var MobileScreens = exports.MobileScreens = {
  WELCOME_SCREEN: 1,
  SET_INITIAL_LOCATION: 2,
  SEARCH_FORM: 3,
  SET_FROM_LOCATION: 4,
  SET_TO_LOCATION: 5,
  SET_OPTIONS: 6,
  SET_DATETIME: 7,
  RESULTS_SUMMARY: 8
};

//# sourceMappingURL=ui.js