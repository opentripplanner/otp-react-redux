"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  height: 150px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var allowedNotificationChannels = [{
  type: 'email',
  text: 'Email'
}, {
  type: 'sms',
  text: 'SMS'
}, {
  type: 'none',
  text: 'Don\'t notify me'
}]; // Styles
// HACK: Preverve container height.

var Details = _styledComponents.default.div(_templateObject());
/**
 * User notification preferences pane.
 */


var NotificationPrefsPane =
/*#__PURE__*/
function (_Component) {
  _inherits(NotificationPrefsPane, _Component);

  function NotificationPrefsPane() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, NotificationPrefsPane);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(NotificationPrefsPane)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_handleNotificationChannelChange", function (e) {
      var onUserDataChange = _this.props.onUserDataChange;
      onUserDataChange({
        notificationChannel: e
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_handlePhoneNumberChange", function (e) {
      var onUserDataChange = _this.props.onUserDataChange;
      onUserDataChange({
        phoneNumber: e.target.value
      });
    });

    return _this;
  }

  _createClass(NotificationPrefsPane, [{
    key: "render",
    value: function render() {
      var userData = this.props.userData;
      var email = userData.email,
          notificationChannel = userData.notificationChannel,
          phoneNumber = userData.phoneNumber;
      return _react.default.createElement("div", null, _react.default.createElement("p", null, "You can receive notifications about trips you frequently take."), _react.default.createElement(_reactBootstrap.FormGroup, null, _react.default.createElement(_reactBootstrap.ControlLabel, null, "How would you like to receive notifications?"), _react.default.createElement(_reactBootstrap.ButtonToolbar, null, _react.default.createElement(_reactBootstrap.ToggleButtonGroup, {
        name: "notificationChannels",
        onChange: this._handleNotificationChannelChange,
        type: "radio",
        value: notificationChannel
      }, allowedNotificationChannels.map(function (_ref, index) {
        var type = _ref.type,
            text = _ref.text;
        return _react.default.createElement(_reactBootstrap.ToggleButton, {
          bsStyle: notificationChannel === type ? 'primary' : 'default',
          key: index,
          value: type
        }, text);
      })))), _react.default.createElement(Details, null, notificationChannel === 'email' && _react.default.createElement(_reactBootstrap.FormGroup, null, _react.default.createElement(_reactBootstrap.ControlLabel, null, "Notification emails will be sent out to:"), _react.default.createElement(_reactBootstrap.FormControl, {
        disabled: true,
        type: "text",
        value: email
      })), notificationChannel === 'sms' && _react.default.createElement(_reactBootstrap.FormGroup, null, _react.default.createElement(_reactBootstrap.ControlLabel, null, "Enter your phone number for SMS notifications:"), _react.default.createElement(_reactBootstrap.FormControl, {
        onChange: this._handlePhoneNumberChange,
        type: "tel",
        value: phoneNumber
      }))));
    }
  }]);

  return NotificationPrefsPane;
}(_react.Component);

_defineProperty(NotificationPrefsPane, "propTypes", {
  onUserDataChange: _propTypes.default.func.isRequired,
  userData: _propTypes.default.object.isRequired
});

var _default = NotificationPrefsPane;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=notification-prefs-pane.js