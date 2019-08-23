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

var _container = _interopRequireDefault(require("./container"));

var _locationField = _interopRequireDefault(require("../form/location-field"));

var _userSettings = _interopRequireDefault(require("../form/user-settings"));

var _defaultMap = _interopRequireDefault(require("../map/default-map"));

var _navigationBar = _interopRequireDefault(require("./navigation-bar"));

var _ui = require("../../actions/ui");

var _map = require("../../actions/map");

var _state = require("../../util/state");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var MobileWelcomeScreen =
/*#__PURE__*/
function (_Component) {
  _inherits(MobileWelcomeScreen, _Component);

  function MobileWelcomeScreen() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, MobileWelcomeScreen);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(MobileWelcomeScreen)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_toFieldClicked", function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_INITIAL_LOCATION);
    });

    _defineProperty(_assertThisInitialized(_this), "_locationSetFromPopup", function (selection) {
      // If the tapped location was selected as the 'from' endpoint, set the 'to'
      // endpoint to be the current user location. (If selected as the 'to' point,
      // no action is needed since 'from' is the current location by default.)
      if (selection.type === 'from') {
        _this.props.setLocationToCurrent({
          type: 'to'
        });
      }
    });

    return _this;
  }

  _createClass(MobileWelcomeScreen, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          showUserSettings = _this$props.showUserSettings,
          title = _this$props.title;
      return _react.default.createElement(_container.default, null, _react.default.createElement(_navigationBar.default, {
        title: title
      }), _react.default.createElement("div", {
        className: "welcome-location mobile-padding"
      }, _react.default.createElement(_locationField.default, {
        type: "to",
        label: "Where do you want to go?",
        onClick: this._toFieldClicked,
        showClearButton: false
      })), _react.default.createElement("div", {
        className: "welcome-map"
      }, _react.default.createElement(_defaultMap.default, {
        onSetLocation: this._locationSetFromPopup
      }), showUserSettings ? _react.default.createElement(_userSettings.default, null) : null));
    }
  }]);

  return MobileWelcomeScreen;
}(_react.Component); // connect to the redux store


_defineProperty(MobileWelcomeScreen, "propTypes", {
  map: _propTypes.default.element,
  setLocationToCurrent: _propTypes.default.func,
  setMobileScreen: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var showUserSettings = (0, _state.getShowUserSettings)(state.otp);
  return {
    showUserSettings: showUserSettings
  };
};

var mapDispatchToProps = {
  setLocationToCurrent: _map.setLocationToCurrent,
  setMobileScreen: _ui.setMobileScreen
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileWelcomeScreen);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=welcome-screen.js