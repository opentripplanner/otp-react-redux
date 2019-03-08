'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _dateTimeScreen = require('./date-time-screen');

var _dateTimeScreen2 = _interopRequireDefault(_dateTimeScreen);

var _optionsScreen = require('./options-screen');

var _optionsScreen2 = _interopRequireDefault(_optionsScreen);

var _locationSearch = require('./location-search');

var _locationSearch2 = _interopRequireDefault(_locationSearch);

var _welcomeScreen = require('./welcome-screen');

var _welcomeScreen2 = _interopRequireDefault(_welcomeScreen);

var _resultsScreen = require('./results-screen');

var _resultsScreen2 = _interopRequireDefault(_resultsScreen);

var _searchScreen = require('./search-screen');

var _searchScreen2 = _interopRequireDefault(_searchScreen);

var _stopViewer = require('./stop-viewer');

var _stopViewer2 = _interopRequireDefault(_stopViewer);

var _tripViewer = require('./trip-viewer');

var _tripViewer2 = _interopRequireDefault(_tripViewer);

var _routeViewer = require('./route-viewer');

var _routeViewer2 = _interopRequireDefault(_routeViewer);

var _ui = require('../../actions/ui');

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileMain = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(MobileMain, _Component);

  function MobileMain() {
    (0, _classCallCheck3.default)(this, MobileMain);
    return (0, _possibleConstructorReturn3.default)(this, (MobileMain.__proto__ || (0, _getPrototypeOf2.default)(MobileMain)).apply(this, arguments));
  }

  (0, _createClass3.default)(MobileMain, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // Check if we are in the welcome screen and both locations have been set OR
      // auto-detect is denied and one location is set
      if (this.props.uiState.mobileScreen === _ui.MobileScreens.WELCOME_SCREEN && (nextProps.currentQuery.from && nextProps.currentQuery.to || !nextProps.currentPosition.coords && (nextProps.currentQuery.from || nextProps.currentQuery.to))) {
        // If so, advance to main search screen
        this.props.setMobileScreen(_ui.MobileScreens.SEARCH_FORM);
      }

      if (!this.props.activeItinerary && nextProps.activeItinerary) {
        this.props.setMobileScreen(_ui.MobileScreens.RESULTS_SUMMARY);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          icons = _props.icons,
          itineraryClass = _props.itineraryClass,
          map = _props.map,
          title = _props.title,
          uiState = _props.uiState;

      // check for route viewer

      if (uiState.mainPanelContent === _ui.MainPanelContent.ROUTE_VIEWER) {
        return _react2.default.createElement(_routeViewer2.default, null);
      }

      // check for viewed stop
      if (uiState.viewedStop) return _react2.default.createElement(_stopViewer2.default, null);

      // check for viewed trip
      if (uiState.viewedTrip) return _react2.default.createElement(_tripViewer2.default, null);

      switch (uiState.mobileScreen) {
        case _ui.MobileScreens.WELCOME_SCREEN:
          return _react2.default.createElement(_welcomeScreen2.default, { map: map, title: title });

        case _ui.MobileScreens.SET_INITIAL_LOCATION:
          return _react2.default.createElement(_locationSearch2.default, {
            locationType: 'to',
            backScreen: _ui.MobileScreens.WELCOME_SCREEN
          });

        case _ui.MobileScreens.SEARCH_FORM:
          return _react2.default.createElement(_searchScreen2.default, {
            icons: icons,
            map: map,
            newScreen: this.newScreen
          });

        case _ui.MobileScreens.SET_FROM_LOCATION:
          return _react2.default.createElement(_locationSearch2.default, {
            locationType: 'from',
            backScreen: _ui.MobileScreens.SEARCH_FORM
          });

        case _ui.MobileScreens.SET_TO_LOCATION:
          return _react2.default.createElement(_locationSearch2.default, {
            locationType: 'to',
            backScreen: _ui.MobileScreens.SEARCH_FORM
          });

        case _ui.MobileScreens.SET_DATETIME:
          return _react2.default.createElement(_dateTimeScreen2.default, null);

        case _ui.MobileScreens.SET_OPTIONS:
          return _react2.default.createElement(_optionsScreen2.default, { icons: icons });

        case _ui.MobileScreens.RESULTS_SUMMARY:
          return _react2.default.createElement(_resultsScreen2.default, { map: map, itineraryClass: itineraryClass });

        default:
          return _react2.default.createElement(
            'p',
            null,
            'Invalid mobile screen'
          );
      }
    }
  }]);
  return MobileMain;
}(_react.Component), _class.propTypes = {
  currentQuery: _propTypes2.default.object,
  icons: _propTypes2.default.object,
  itineraryClass: _propTypes2.default.func,
  map: _propTypes2.default.element,
  setMobileScreen: _propTypes2.default.func,
  title: _propTypes2.default.element,
  uiState: _propTypes2.default.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    uiState: state.otp.ui,
    currentQuery: state.otp.currentQuery,
    currentPosition: state.otp.location.currentPosition,
    activeItinerary: (0, _state.getActiveItinerary)(state.otp)
  };
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileMain);
module.exports = exports['default'];

//# sourceMappingURL=main.js