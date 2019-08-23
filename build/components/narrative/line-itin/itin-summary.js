"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _itinerary = require("../../../util/itinerary");

var _time = require("../../../util/time");

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

// TODO: make this a prop
var defaultRouteColor = '#008';

var ItinerarySummary =
/*#__PURE__*/
function (_Component) {
  _inherits(ItinerarySummary, _Component);

  function ItinerarySummary() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, ItinerarySummary);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(ItinerarySummary)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_onSummaryClicked", function () {
      if (typeof _this.props.onClick === 'function') _this.props.onClick();
    });

    return _this;
  }

  _createClass(ItinerarySummary, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          customIcons = _this$props.customIcons,
          itinerary = _this$props.itinerary,
          timeOptions = _this$props.timeOptions;

      var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
          centsToString = _calculateFares.centsToString,
          maxTNCFare = _calculateFares.maxTNCFare,
          minTNCFare = _calculateFares.minTNCFare,
          transitFare = _calculateFares.transitFare; // TODO: support non-USD


      var minTotalFare = minTNCFare * 100 + transitFare;
      var maxTotalFare = maxTNCFare * 100 + transitFare;

      var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
          caloriesBurned = _calculatePhysicalAct.caloriesBurned;

      return _react.default.createElement("div", {
        className: "itin-summary",
        onClick: this._onSummaryClicked
      }, _react.default.createElement("div", {
        className: "details"
      }, _react.default.createElement("div", {
        className: "header"
      }, (0, _time.formatDuration)(itinerary.duration)), _react.default.createElement("div", {
        className: "detail"
      }, (0, _time.formatTime)(itinerary.startTime, timeOptions), " - ", (0, _time.formatTime)(itinerary.endTime, timeOptions)), _react.default.createElement("div", {
        className: "detail"
      }, minTotalFare > 0 && _react.default.createElement("span", null, centsToString(minTotalFare), minTotalFare !== maxTotalFare && _react.default.createElement("span", null, " - ", centsToString(maxTotalFare)), _react.default.createElement("span", null, " \u2022 ")), Math.round(caloriesBurned), " Cals"), itinerary.transfers > 0 && _react.default.createElement("div", {
        className: "detail"
      }, itinerary.transfers, " transfer", itinerary.transfers > 1 ? 's' : '')), _react.default.createElement("div", {
        className: "routes"
      }, itinerary.legs.filter(function (leg) {
        return !(leg.mode === 'WALK' && itinerary.transitTime > 0);
      }).map(function (leg, k) {
        return _react.default.createElement("div", {
          className: "route-preview",
          key: k
        }, _react.default.createElement("div", {
          className: "mode-icon"
        }, (0, _itinerary.getLegIcon)(leg, customIcons)), (0, _itinerary.isTransit)(leg.mode) ? _react.default.createElement("div", {
          className: "short-name",
          style: {
            backgroundColor: getRouteColorForBadge(leg)
          }
        }, getRouteNameForBadge(leg)) : _react.default.createElement("div", {
          style: {
            height: 30,
            overflow: 'hidden'
          }
        }));
      })));
    }
  }]);

  return ItinerarySummary;
}(_react.Component); // Helper functions


exports.default = ItinerarySummary;

_defineProperty(ItinerarySummary, "propTypes", {
  itinerary: _propTypes.default.object
});

function getRouteLongName(leg) {
  return leg.routes && leg.routes.length > 0 ? leg.routes[0].longName : leg.routeLongName;
}

function getRouteNameForBadge(leg) {
  var shortName = leg.routes && leg.routes.length > 0 ? leg.routes[0].shortName : leg.routeShortName;
  var longName = getRouteLongName(leg); // check for max

  if (longName && longName.toLowerCase().startsWith('max')) return null; // check for streetcar

  if (longName && longName.startsWith('Portland Streetcar')) return longName.split('-')[1].trim().split(' ')[0];
  return shortName || longName;
}

function getRouteColorForBadge(leg) {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor;
}

module.exports = exports.default;

//# sourceMappingURL=itin-summary.js