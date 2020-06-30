"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _react = _interopRequireDefault(require("react"));

var _narrativeItinerary = _interopRequireDefault(require("../narrative-itinerary"));

var _itinerarySummary = _interopRequireDefault(require("./itinerary-summary"));

var _itineraryDetails = _interopRequireDefault(require("./itinerary-details"));

var _connectedTripDetails = _interopRequireDefault(require("../connected-trip-details"));

var _tripTools = _interopRequireDefault(require("../trip-tools"));

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

var _coreUtils$time = _coreUtils.default.time,
    formatDuration = _coreUtils$time.formatDuration,
    formatTime = _coreUtils$time.formatTime;

var DefaultItinerary =
/*#__PURE__*/
function (_NarrativeItinerary) {
  _inherits(DefaultItinerary, _NarrativeItinerary);

  function DefaultItinerary() {
    _classCallCheck(this, DefaultItinerary);

    return _possibleConstructorReturn(this, _getPrototypeOf(DefaultItinerary).apply(this, arguments));
  }

  _createClass(DefaultItinerary, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          active = _this$props.active,
          activeLeg = _this$props.activeLeg,
          activeStep = _this$props.activeStep,
          expanded = _this$props.expanded,
          index = _this$props.index,
          itinerary = _this$props.itinerary,
          LegIcon = _this$props.LegIcon,
          setActiveLeg = _this$props.setActiveLeg,
          setActiveStep = _this$props.setActiveStep;
      return _react.default.createElement("div", {
        className: "option default-itin".concat(active ? ' active' : '')
      }, _react.default.createElement("button", {
        className: "header",
        onClick: this._onHeaderClick
      }, _react.default.createElement("span", {
        className: "title"
      }, "Itinerary ", index + 1), ' ', _react.default.createElement("span", {
        className: "duration pull-right"
      }, formatDuration(itinerary.duration)), ' ', _react.default.createElement("span", {
        className: "arrivalTime"
      }, formatTime(itinerary.startTime), "\u2014", formatTime(itinerary.endTime)), _react.default.createElement(_itinerarySummary.default, {
        itinerary: itinerary,
        LegIcon: LegIcon
      })), (active || expanded) && _react.default.createElement("div", {
        className: "body"
      }, _react.default.createElement(_itineraryDetails.default, {
        itinerary: itinerary,
        activeLeg: activeLeg,
        activeStep: activeStep,
        setActiveLeg: setActiveLeg,
        setActiveStep: setActiveStep,
        LegIcon: LegIcon
      }), _react.default.createElement(_connectedTripDetails.default, {
        itinerary: itinerary
      }), _react.default.createElement(_tripTools.default, {
        itinerary: itinerary
      })));
    }
  }]);

  return DefaultItinerary;
}(_narrativeItinerary.default);

exports.default = DefaultItinerary;
module.exports = exports.default;

//# sourceMappingURL=default-itinerary.js