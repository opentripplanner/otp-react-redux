"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.routeTo = routeTo;
exports.matchContentToUrl = matchContentToUrl;
exports.handleBackButtonPress = handleBackButtonPress;
exports.setMainPanelContent = setMainPanelContent;
exports.setViewedStop = setViewedStop;
exports.setViewedRoute = setViewedRoute;
exports.MobileScreens = exports.MainPanelContent = exports.toggleAutoRefresh = exports.setViewedTrip = exports.clearPanel = exports.setMobileScreen = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.search");

var _connectedReactRouter = require("connected-react-router");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _reduxActions = require("redux-actions");

var _reactRouter = require("react-router");

var _api = require("./api");

var _config = require("./config");

var _form = require("./form");

var _map = require("./map");

var _narrative = require("./narrative");

var _state = require("../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

/**
 * Wrapper function for history#push that preserves the current search or, if
 * replaceSearch is provided (including an empty string), replaces the search
 * when routing to a new URL path.
 * @param  {[type]} url           path to route to
 * @param  {string} replaceSearch optional search string to replace current one
 */
function routeTo(url, replaceSearch) {
  return function (dispatch, getState) {
    // Get search to preserve when routing to new path.
    var _getState = getState(),
        router = _getState.router;

    var search = router ? router.location.search : window.location.search;
    var path = url;

    if (replaceSearch || replaceSearch === '') {
      path = "".concat(path).concat(replaceSearch);
    } else {
      path = "".concat(path).concat(search);
    }

    dispatch((0, _connectedReactRouter.push)(path));
  };
}
/**
 * Checks URL and redirects app to appropriate content (e.g., viewed
 * route or stop).
 */


function matchContentToUrl(location) {
  return function (dispatch, getState) {
    // This is a bit of a hack to make up for the fact that react-router does
    // not always provide the match params as expected.
    // https://github.com/ReactTraining/react-router/issues/5870#issuecomment-394194338
    var root = location.pathname.split('/')[1];
    var match = (0, _reactRouter.matchPath)(location.pathname, {
      path: "/".concat(root, "/:id"),
      exact: true,
      strict: false
    });
    var id = match && match.params && match.params.id;

    switch (root) {
      case 'route':
        if (id) {
          dispatch((0, _api.findRoute)({
            routeId: id
          }));
          dispatch(setViewedRoute({
            routeId: id
          }));
        } else {
          dispatch(setViewedRoute(null));
          dispatch(setMainPanelContent(MainPanelContent.ROUTE_VIEWER));
        }

        break;

      case 'stop':
        if (id) {
          dispatch(setViewedStop({
            stopId: id
          }));
        } else {
          dispatch(setViewedStop(null));
          dispatch(setMainPanelContent(MainPanelContent.STOP_VIEWER));
        }

        break;

      case 'start':
      case '@':
        // Parse comma separated params (ensuring numbers are parsed correctly).
        var _ref = id ? idToParams(id) : [],
            _ref2 = _slicedToArray(_ref, 4),
            lat = _ref2[0],
            lon = _ref2[1],
            zoom = _ref2[2],
            routerId = _ref2[3];

        if (!lat || !lon) {
          // Attempt to parse path. (Legacy UI otp.js used slashes in the
          // pathname to specify lat, lon, etc.)
          var _idToParams = idToParams(location.pathname, '/');

          var _idToParams2 = _slicedToArray(_idToParams, 6);

          lat = _idToParams2[2];
          lon = _idToParams2[3];
          zoom = _idToParams2[4];
          routerId = _idToParams2[5];
        } // Update map location/zoom and optionally override router ID.


        dispatch((0, _config.setMapCenter)({
          lat: lat,
          lon: lon
        }));
        dispatch((0, _config.setMapZoom)({
          zoom: zoom
        }));
        if (routerId) dispatch((0, _config.setRouterId)(routerId));
        dispatch(setMainPanelContent(null));
        break;
      // For any other route path, just revert to default panel.

      default:
        dispatch(setMainPanelContent(null));
        break;
    }
  };
}

function idToParams(id) {
  var delimiter = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : ',';
  return id.split(delimiter).map(function (s) {
    return isNaN(s) ? s : +s;
  });
}
/**
 * Event listener for responsive webapp that handles a back button press and
 * sets the active search and itinerary according to the URL query params.
 */


function handleBackButtonPress(e) {
  return function (dispatch, getState) {
    var otpState = getState().otp;
    var activeSearchId = otpState.activeSearchId;
    var uiUrlParams = (0, _state.getUiUrlParams)(otpState); // Get new search ID from URL after back button pressed.
    // console.log('back button pressed', e)

    var urlParams = _coreUtils.default.query.getUrlParams();

    var previousSearchId = urlParams.ui_activeSearch;
    var previousItinIndex = +urlParams.ui_activeItinerary || 0;
    var previousSearch = otpState.searches[previousSearchId];

    if (previousSearch) {
      // If back button pressed and active search has changed, set search to
      // previous search ID.
      if (activeSearchId !== previousSearchId) {
        dispatch((0, _form.setActiveSearch)(previousSearchId));
      } else if (uiUrlParams.ui_activeItinerary !== previousItinIndex) {
        // Active itinerary index has changed.
        dispatch((0, _narrative.setActiveItinerary)({
          index: previousItinIndex
        }));
      }
    } else {
      // The back button was pressed, but there was no corresponding search
      // found for the previous search ID. Derive search from URL params.
      if (!previousSearchId && activeSearchId) {
        // There is no search ID. Clear active search and from/to
        dispatch((0, _form.clearActiveSearch)());
        dispatch((0, _map.clearLocation)({
          type: 'from'
        }));
        dispatch((0, _map.clearLocation)({
          type: 'to'
        }));
      } else if (previousSearchId) {
        console.warn("No search found in state history for search ID: ".concat(previousSearchId, ". Replanning...")); // Set query to the params found in the URL and perform routing query
        // for search ID.
        // Also, we don't want to update the URL here because that will funk with
        // the browser history.

        dispatch((0, _form.parseUrlQueryString)(urlParams));
      }
    }
  };
}

var setMobileScreen = (0, _reduxActions.createAction)('SET_MOBILE_SCREEN');
/**
 * Sets the main panel content according to the payload (one of the enum values
 * of MainPanelContent) and routes the application to the correct path.
 * @param {number} payload MainPanelContent value
 */

exports.setMobileScreen = setMobileScreen;

function setMainPanelContent(payload) {
  return function (dispatch, getState) {
    var _getState2 = getState(),
        otp = _getState2.otp,
        router = _getState2.router;

    if (otp.ui.mainPanelContent === payload) {
      console.warn("Attempt to route from ".concat(otp.ui.mainPanelContent, " to ").concat(payload, ". Doing nothing")); // Do nothing if the panel is already set. This will guard against over
      // enthusiastic routing and overwriting current/nested states.

      return;
    }

    dispatch(setPanel(payload));

    switch (payload) {
      case MainPanelContent.ROUTE_VIEWER:
        dispatch(routeTo('/route'));
        break;

      case MainPanelContent.STOP_VIEWER:
        dispatch(routeTo('/stop'));
        break;

      default:
        // Clear route, stop, and trip viewer focus and route to root
        dispatch(viewRoute(null));
        dispatch(viewStop(null));
        dispatch(setViewedTrip(null));
        if (router.location.pathname !== '/') dispatch(routeTo('/'));
        break;
    }
  };
}

var setPanel = (0, _reduxActions.createAction)('SET_MAIN_PANEL_CONTENT');
var clearPanel = (0, _reduxActions.createAction)('CLEAR_MAIN_PANEL'); // Stop/Route/Trip Viewer actions

exports.clearPanel = clearPanel;

function setViewedStop(payload) {
  return function (dispatch, getState) {
    dispatch(viewStop(payload));
    var path = payload && payload.stopId ? "/stop/".concat(payload.stopId) : '/stop';
    dispatch(routeTo(path));
  };
}

var viewStop = (0, _reduxActions.createAction)('SET_VIEWED_STOP');
var setViewedTrip = (0, _reduxActions.createAction)('SET_VIEWED_TRIP');
exports.setViewedTrip = setViewedTrip;

function setViewedRoute(payload) {
  return function (dispatch, getState) {
    dispatch(viewRoute(payload));
    var path = payload && payload.routeId ? "/route/".concat(payload.routeId) : '/route';
    dispatch(routeTo(path));
  };
}

var viewRoute = (0, _reduxActions.createAction)('SET_VIEWED_ROUTE');
var toggleAutoRefresh = (0, _reduxActions.createAction)('TOGGLE_AUTO_REFRESH'); // UI state enums

exports.toggleAutoRefresh = toggleAutoRefresh;
var MainPanelContent = {
  ROUTE_VIEWER: 1,
  STOP_VIEWER: 2
};
exports.MainPanelContent = MainPanelContent;
var MobileScreens = {
  WELCOME_SCREEN: 1,
  SET_INITIAL_LOCATION: 2,
  SEARCH_FORM: 3,
  SET_FROM_LOCATION: 4,
  SET_TO_LOCATION: 5,
  SET_OPTIONS: 6,
  SET_DATETIME: 7,
  RESULTS_SUMMARY: 8
};
exports.MobileScreens = MobileScreens;

//# sourceMappingURL=ui.js