"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _reactBootstrap = require("react-bootstrap");

var _velocityReact = require("velocity-react");

var _moment = _interopRequireDefault(require("moment"));

var _itinerary = require("../../util/itinerary");

var _time = require("../../util/time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var TripDetails =
/*#__PURE__*/
function (_Component) {
  _inherits(TripDetails, _Component);

  function TripDetails() {
    _classCallCheck(this, TripDetails);

    return _possibleConstructorReturn(this, _getPrototypeOf(TripDetails).apply(this, arguments));
  }

  _createClass(TripDetails, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          itinerary = _this$props.itinerary,
          timeFormat = _this$props.timeFormat,
          longDateFormat = _this$props.longDateFormat;
      var date = (0, _moment.default)(itinerary.startTime); // process the transit fare

      var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
          centsToString = _calculateFares.centsToString,
          dollarsToString = _calculateFares.dollarsToString,
          maxTNCFare = _calculateFares.maxTNCFare,
          minTNCFare = _calculateFares.minTNCFare,
          transitFare = _calculateFares.transitFare;

      var companies;
      itinerary.legs.forEach(function (leg) {
        if (leg.tncData) {
          companies = leg.tncData.company;
        }
      });
      var fare;

      if (transitFare || minTNCFare) {
        fare = _react.default.createElement("span", null, transitFare && _react.default.createElement("span", null, "Transit Fare: ", _react.default.createElement("b", null, centsToString(transitFare))), minTNCFare !== 0 && _react.default.createElement("span", null, _react.default.createElement("br", null), _react.default.createElement("span", {
          style: {
            textTransform: 'capitalize'
          }
        }, companies.toLowerCase()), ' ', "Fare: ", _react.default.createElement("b", null, dollarsToString(minTNCFare), " - ", dollarsToString(maxTNCFare))));
      } // Compute calories burned.


      var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
          bikeDuration = _calculatePhysicalAct.bikeDuration,
          caloriesBurned = _calculatePhysicalAct.caloriesBurned,
          walkDuration = _calculatePhysicalAct.walkDuration;

      var timeOptions = {
        format: timeFormat,
        offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
      };
      return _react.default.createElement("div", {
        className: "trip-details"
      }, _react.default.createElement("div", {
        className: "trip-details-header"
      }, "Trip Details"), _react.default.createElement("div", {
        className: "trip-details-body"
      }, _react.default.createElement(TripDetail, {
        icon: _react.default.createElement("i", {
          className: "fa fa-calendar"
        }),
        summary: _react.default.createElement("span", null, _react.default.createElement("span", null, "Depart ", _react.default.createElement("b", null, date.format(longDateFormat))), this.props.routingType === 'ITINERARY' && _react.default.createElement("span", null, " at ", _react.default.createElement("b", null, (0, _time.formatTime)(itinerary.startTime, timeOptions))))
      }), fare && _react.default.createElement(TripDetail, {
        icon: _react.default.createElement("i", {
          className: "fa fa-money"
        }),
        summary: fare
      }), caloriesBurned > 0 && _react.default.createElement(TripDetail, {
        icon: _react.default.createElement("i", {
          className: "fa fa-heartbeat"
        }),
        summary: _react.default.createElement("span", null, "Calories Burned: ", _react.default.createElement("b", null, Math.round(caloriesBurned))),
        description: _react.default.createElement("span", null, "Calories burned is based on ", _react.default.createElement("b", null, Math.round(walkDuration / 60), " minute(s)"), ' ', "spent walking and ", _react.default.createElement("b", null, Math.round(bikeDuration / 60), " minute(s)"), ' ', "spent biking during this trip. Adapted from", ' ', _react.default.createElement("a", {
          href: "https://health.gov/dietaryguidelines/dga2005/document/html/chapter3.htm#table4",
          target: "_blank"
        }, "Dietary Guidelines for Americans 2005, page 16, Table 4"), ".")
      })));
    }
  }]);

  return TripDetails;
}(_react.Component);

var TripDetail =
/*#__PURE__*/
function (_Component2) {
  _inherits(TripDetail, _Component2);

  function TripDetail(props) {
    var _this;

    _classCallCheck(this, TripDetail);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TripDetail).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_toggle", function () {
      return _this.state.expanded ? _this._onHideClick() : _this._onExpandClick();
    });

    _defineProperty(_assertThisInitialized(_this), "_onExpandClick", function () {
      _this.setState({
        expanded: true
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onHideClick", function () {
      _this.setState({
        expanded: false
      });
    });

    _this.state = {
      expanded: false
    };
    return _this;
  }

  _createClass(TripDetail, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          icon = _this$props2.icon,
          summary = _this$props2.summary,
          description = _this$props2.description;
      return _react.default.createElement("div", {
        className: "trip-detail"
      }, _react.default.createElement("div", {
        className: "icon"
      }, icon), _react.default.createElement("div", {
        className: "summary"
      }, summary, description && _react.default.createElement(_reactBootstrap.Button, {
        className: "expand-button clear-button-formatting",
        onClick: this._toggle
      }, _react.default.createElement("i", {
        className: "fa fa-question-circle"
      })), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, this.state.expanded && _react.default.createElement("div", {
        className: "description"
      }, _react.default.createElement(_reactBootstrap.Button, {
        className: "hide-button clear-button-formatting",
        onClick: this._onHideClick
      }, _react.default.createElement("i", {
        className: "fa fa-close"
      })), description))));
    }
  }]);

  return TripDetail;
}(_react.Component); // Connect main class to redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    routingType: state.otp.currentQuery.routingType,
    tnc: state.otp.tnc,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config),
    longDateFormat: (0, _time.getLongDateFormat)(state.otp.config)
  };
};

var _default = (0, _reactRedux.connect)(mapStateToProps)(TripDetails);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=trip-details.js