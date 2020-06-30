"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

var _moment = _interopRequireDefault(require("moment"));

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var _coreUtils$time = _coreUtils.default.time,
    OTP_API_DATE_FORMAT = _coreUtils$time.OTP_API_DATE_FORMAT,
    OTP_API_TIME_FORMAT = _coreUtils$time.OTP_API_TIME_FORMAT,
    getTimeFormat = _coreUtils$time.getTimeFormat,
    getDateFormat = _coreUtils$time.getDateFormat;

var DateTimePreview =
/*#__PURE__*/
function (_Component) {
  _inherits(DateTimePreview, _Component);

  function DateTimePreview() {
    _classCallCheck(this, DateTimePreview);

    return _possibleConstructorReturn(this, _getPrototypeOf(DateTimePreview).apply(this, arguments));
  }

  _createClass(DateTimePreview, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          caret = _this$props.caret,
          date = _this$props.date,
          editButtonText = _this$props.editButtonText,
          time = _this$props.time,
          departArrive = _this$props.departArrive,
          routingType = _this$props.routingType,
          startTime = _this$props.startTime,
          endTime = _this$props.endTime,
          timeFormat = _this$props.timeFormat,
          dateFormat = _this$props.dateFormat;
      var timeStr;

      var formattedTime = _moment.default.utc(time, OTP_API_TIME_FORMAT).format(timeFormat);

      if (routingType === 'ITINERARY') {
        if (departArrive === 'NOW') timeStr = 'Leave now';else if (departArrive === 'ARRIVE') timeStr = 'Arrive ' + formattedTime;else if (departArrive === 'DEPART') timeStr = 'Depart ' + formattedTime;
      } else if (routingType === 'PROFILE') {
        timeStr = startTime + ' to ' + endTime;
      }

      var summary = _react.default.createElement("div", {
        className: "summary"
      }, _react.default.createElement("i", {
        className: "fa fa-calendar"
      }), " ", (0, _moment.default)(date, OTP_API_DATE_FORMAT).calendar(null, {
        sameElse: dateFormat
      }).split(' at')[0], _react.default.createElement("br", null), _react.default.createElement("i", {
        className: "fa fa-clock-o"
      }), " ", timeStr);

      var button = _react.default.createElement("div", {
        className: "button-container"
      }, _react.default.createElement(_reactBootstrap.Button, {
        onClick: this.props.onClick
      }, editButtonText, caret && _react.default.createElement("span", null, " ", _react.default.createElement("i", {
        className: "fa fa-caret-".concat(caret)
      }))));

      return _react.default.createElement("div", {
        className: "settings-preview",
        onClick: this.props.onClick
      }, summary, button, _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      }));
    }
  }]);

  return DateTimePreview;
}(_react.Component);

_defineProperty(DateTimePreview, "propTypes", {
  caret: _propTypes.default.string,
  compressed: _propTypes.default.bool,
  date: _propTypes.default.string,
  departArrive: _propTypes.default.string,
  editButtonText: _propTypes.default.element,
  time: _propTypes.default.string,
  onClick: _propTypes.default.func,
  routingType: _propTypes.default.string
});

_defineProperty(DateTimePreview, "defaultProps", {
  editButtonText: _react.default.createElement("i", {
    className: "fa fa-pencil"
  })
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      departArrive = _state$otp$currentQue.departArrive,
      date = _state$otp$currentQue.date,
      time = _state$otp$currentQue.time,
      routingType = _state$otp$currentQue.routingType,
      startTime = _state$otp$currentQue.startTime,
      endTime = _state$otp$currentQue.endTime;
  var config = state.otp.config;
  return {
    config: config,
    routingType: routingType,
    departArrive: departArrive,
    date: date,
    time: time,
    startTime: startTime,
    endTime: endTime,
    timeFormat: getTimeFormat(config),
    dateFormat: getDateFormat(config)
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimePreview);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=date-time-preview.js