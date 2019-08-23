"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _viewerContainer = _interopRequireDefault(require("../viewers/viewer-container"));

var _defaultSearchForm = _interopRequireDefault(require("../form/default-search-form"));

var _planTripButton = _interopRequireDefault(require("../form/plan-trip-button"));

var _userSettings = _interopRequireDefault(require("../form/user-settings"));

var _narrativeRoutingResults = _interopRequireDefault(require("../narrative/narrative-routing-results"));

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

var DefaultMainPanel =
/*#__PURE__*/
function (_Component) {
  _inherits(DefaultMainPanel, _Component);

  function DefaultMainPanel() {
    _classCallCheck(this, DefaultMainPanel);

    return _possibleConstructorReturn(this, _getPrototypeOf(DefaultMainPanel).apply(this, arguments));
  }

  _createClass(DefaultMainPanel, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          activeSearch = _this$props.activeSearch,
          currentQuery = _this$props.currentQuery,
          customIcons = _this$props.customIcons,
          itineraryClass = _this$props.itineraryClass,
          itineraryFooter = _this$props.itineraryFooter,
          mainPanelContent = _this$props.mainPanelContent,
          showUserSettings = _this$props.showUserSettings;
      var showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' || mainPanelContent === 'EDIT_SETTINGS';
      var mostRecentQuery = activeSearch ? activeSearch.query : null;
      var planDisabled = (0, _lodash.default)(currentQuery, mostRecentQuery);
      return _react.default.createElement(_viewerContainer.default, null, _react.default.createElement("div", {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: showPlanTripButton ? 55 : 0,
          paddingBottom: 15,
          overflow: 'auto'
        }
      }, _react.default.createElement(_defaultSearchForm.default, {
        icons: customIcons
      }), !activeSearch && !showPlanTripButton && showUserSettings && _react.default.createElement(_userSettings.default, null), _react.default.createElement("div", {
        className: "desktop-narrative-container"
      }, _react.default.createElement(_narrativeRoutingResults.default, {
        itineraryClass: itineraryClass,
        itineraryFooter: itineraryFooter,
        customIcons: customIcons
      }))), showPlanTripButton && _react.default.createElement("div", {
        style: {
          position: 'absolute',
          left: 0,
          right: 10,
          bottom: 55,
          height: 15
        },
        className: "white-fade"
      }), showPlanTripButton && _react.default.createElement("div", {
        className: "bottom-fixed"
      }, _react.default.createElement(_planTripButton.default, {
        disabled: planDisabled
      })));
    }
  }]);

  return DefaultMainPanel;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  return {
    activeSearch: (0, _state.getActiveSearch)(state.otp),
    currentQuery: state.otp.currentQuery,
    mainPanelContent: state.otp.ui.mainPanelContent,
    showUserSettings: showUserSettings
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DefaultMainPanel);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=default-main-panel.js