"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireDefault(require("react"));

var _narrativeItinerary = _interopRequireDefault(require("../narrative-itinerary"));

var _simpleRealtimeAnnotation = _interopRequireDefault(require("../simple-realtime-annotation"));

var _itinerary = require("../../../util/itinerary");

var _itinSummary = _interopRequireDefault(require("./itin-summary"));

var _itinBody = _interopRequireDefault(require("./itin-body"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var LineItinerary =
/*#__PURE__*/
function (_NarrativeItinerary) {
  _inherits(LineItinerary, _NarrativeItinerary);

  function LineItinerary() {
    _classCallCheck(this, LineItinerary);

    return _possibleConstructorReturn(this, _getPrototypeOf(LineItinerary).apply(this, arguments));
  }

  _createClass(LineItinerary, [{
    key: "_headerText",
    value: function _headerText() {
      var itinerary = this.props.itinerary;
      return itinerary.summary || this._getSummary(itinerary);
    }
  }, {
    key: "_getSummary",
    value: function _getSummary(itinerary) {
      var summary = '';
      var transitModes = [];
      itinerary.legs.forEach(function (leg, index) {
        if ((0, _itinerary.isTransit)(leg.mode)) {
          var modeStr = (0, _itinerary.getLegModeLabel)(leg);
          if (transitModes.indexOf(modeStr) === -1) transitModes.push(modeStr);
        }
      }); // check for access mode

      if (!(0, _itinerary.isTransit)(itinerary.legs[0].mode)) {
        summary += (0, _itinerary.getLegModeLabel)(itinerary.legs[0]);
      } // append transit modes, if applicable


      if (transitModes.length > 0) {
        summary += ' to ' + transitModes.join(', ');
      }

      return summary;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          active = _this$props.active,
          companies = _this$props.companies,
          customIcons = _this$props.customIcons,
          expanded = _this$props.expanded,
          itinerary = _this$props.itinerary,
          itineraryFooter = _this$props.itineraryFooter,
          showRealtimeAnnotation = _this$props.showRealtimeAnnotation,
          onClick = _this$props.onClick,
          timeFormat = _this$props.timeFormat;

      if (!itinerary) {
        return _react.default.createElement("div", null, "No Itinerary!");
      }

      var timeOptions = {
        format: timeFormat,
        offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
      };
      return _react.default.createElement("div", {
        className: "line-itin"
      }, _react.default.createElement(_itinSummary.default, {
        companies: companies,
        itinerary: itinerary,
        timeOptions: timeOptions,
        onClick: onClick,
        customIcons: customIcons
      }), showRealtimeAnnotation && _react.default.createElement(_simpleRealtimeAnnotation.default, null), active || expanded ? _react.default.createElement(_itinBody.default, _extends({}, this.props, {
        itinerary: itinerary,
        timeOptions: timeOptions
      })) : null, itineraryFooter);
    }
  }]);

  return LineItinerary;
}(_narrativeItinerary.default);

exports.default = LineItinerary;
module.exports = exports.default;

//# sourceMappingURL=line-itinerary.js