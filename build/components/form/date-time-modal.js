"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.array.find");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _dateTimeSelector = _interopRequireDefault(require("./date-time-selector"));

var _form = require("../../actions/form");

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

// Define default routingType labels and components
var rtDefaults = [{
  key: 'ITINERARY',
  text: 'Itinerary',
  component: _react.default.createElement(_dateTimeSelector.default, null)
}, {
  key: 'PROFILE',
  text: 'Profile',
  component: _react.default.createElement(_dateTimeSelector.default, {
    profile: true
  })
}];

var DateTimeModal =
/*#__PURE__*/
function (_Component) {
  _inherits(DateTimeModal, _Component);

  function DateTimeModal() {
    _classCallCheck(this, DateTimeModal);

    return _possibleConstructorReturn(this, _getPrototypeOf(DateTimeModal).apply(this, arguments));
  }

  _createClass(DateTimeModal, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          config = _this$props.config,
          routingType = _this$props.routingType,
          setQueryParam = _this$props.setQueryParam;
      return _react.default.createElement("div", {
        className: "date-time-modal"
      }, config.routingTypes.length > 1 && _react.default.createElement("div", {
        className: "button-row"
      }, _react.default.createElement(_reactBootstrap.ButtonGroup, {
        justified: true
      }, config.routingTypes.map(function (rtConfig) {
        return _react.default.createElement(_reactBootstrap.ButtonGroup, {
          key: rtConfig.key
        }, _react.default.createElement(_reactBootstrap.Button, {
          className: rtConfig.key === routingType ? 'selected' : '',
          onClick: function onClick() {
            setQueryParam({
              routingType: rtConfig.key
            });
          }
        }, rtConfig.text || rtDefaults.find(function (d) {
          return d.key === rtConfig.key;
        }).text));
      }))), _react.default.createElement("div", {
        className: "main-panel"
      }, rtDefaults.find(function (d) {
        return d.key === routingType;
      }).component));
    }
  }]);

  return DateTimeModal;
}(_react.Component);

_defineProperty(DateTimeModal, "propTypes", {
  routingType: _propTypes.default.string,
  setQueryParam: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      departArrive = _state$otp$currentQue.departArrive,
      date = _state$otp$currentQue.date,
      time = _state$otp$currentQue.time,
      routingType = _state$otp$currentQue.routingType;
  return {
    config: state.otp.config,
    departArrive: departArrive,
    date: date,
    time: time,
    routingType: routingType
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimeModal);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=date-time-modal.js