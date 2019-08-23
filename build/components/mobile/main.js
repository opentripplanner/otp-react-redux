"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _dateTimeScreen = _interopRequireDefault(require("./date-time-screen"));

var _optionsScreen = _interopRequireDefault(require("./options-screen"));

var _locationSearch = _interopRequireDefault(require("./location-search"));

var _welcomeScreen = _interopRequireDefault(require("./welcome-screen"));

var _resultsScreen = _interopRequireDefault(require("./results-screen"));

var _searchScreen = _interopRequireDefault(require("./search-screen"));

var _stopViewer = _interopRequireDefault(require("./stop-viewer"));

var _tripViewer = _interopRequireDefault(require("./trip-viewer"));

var _routeViewer = _interopRequireDefault(require("./route-viewer"));

var _ui = require("../../actions/ui");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MobileMain =
/*#__PURE__*/
function (_Component) {
  _inherits(MobileMain, _Component);

  function MobileMain() {
    _classCallCheck(this, MobileMain);

    return _possibleConstructorReturn(this, _getPrototypeOf(MobileMain).apply(this, arguments));
  }

  _createClass(MobileMain, [{
    key: "componentWillReceiveProps",
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
    key: "render",
    value: function render() {
      var _this$props = this.props,
          icons = _this$props.icons,
          itineraryClass = _this$props.itineraryClass,
          itineraryFooter = _this$props.itineraryFooter,
          map = _this$props.map,
          title = _this$props.title,
          uiState = _this$props.uiState; // check for route viewer

      if (uiState.mainPanelContent === _ui.MainPanelContent.ROUTE_VIEWER) {
        return _react.default.createElement(_routeViewer.default, null);
      } // check for viewed stop


      if (uiState.viewedStop) return _react.default.createElement(_stopViewer.default, null); // check for viewed trip

      if (uiState.viewedTrip) return _react.default.createElement(_tripViewer.default, null);

      switch (uiState.mobileScreen) {
        case _ui.MobileScreens.WELCOME_SCREEN:
          return _react.default.createElement(_welcomeScreen.default, {
            map: map,
            title: title
          });

        case _ui.MobileScreens.SET_INITIAL_LOCATION:
          return _react.default.createElement(_locationSearch.default, {
            locationType: "to",
            backScreen: _ui.MobileScreens.WELCOME_SCREEN
          });

        case _ui.MobileScreens.SEARCH_FORM:
          return _react.default.createElement(_searchScreen.default, {
            icons: icons,
            map: map,
            newScreen: this.newScreen
          });

        case _ui.MobileScreens.SET_FROM_LOCATION:
          return _react.default.createElement(_locationSearch.default, {
            locationType: "from",
            backScreen: _ui.MobileScreens.SEARCH_FORM
          });

        case _ui.MobileScreens.SET_TO_LOCATION:
          return _react.default.createElement(_locationSearch.default, {
            locationType: "to",
            backScreen: _ui.MobileScreens.SEARCH_FORM
          });

        case _ui.MobileScreens.SET_DATETIME:
          return _react.default.createElement(_dateTimeScreen.default, null);

        case _ui.MobileScreens.SET_OPTIONS:
          return _react.default.createElement(_optionsScreen.default, {
            icons: icons
          });

        case _ui.MobileScreens.RESULTS_SUMMARY:
          return _react.default.createElement(_resultsScreen.default, {
            map: map,
            itineraryClass: itineraryClass,
            itineraryFooter: itineraryFooter,
            icons: icons
          });

        default:
          return _react.default.createElement("p", null, "Invalid mobile screen");
      }
    }
  }]);

  return MobileMain;
}(_react.Component); // connect to the redux store


_defineProperty(MobileMain, "propTypes", {
  currentQuery: _propTypes.default.object,
  icons: _propTypes.default.object,
  itineraryClass: _propTypes.default.func,
  map: _propTypes.default.element,
  setMobileScreen: _propTypes.default.func,
  title: _propTypes.default.element,
  uiState: _propTypes.default.object
});

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

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileMain);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=main.js