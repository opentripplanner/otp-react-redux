"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.string.starts-with");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

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

function _templateObject9() {
  var data = _taggedTemplateLiteral(["\n  background-color: ", ";\n  border-radius: 15px;\n  border: 2px solid white;\n  box-shadow: 0 0 0.5em #000;\n  color: white;\n  font-size: 15px;\n  font-weight: 500;\n  height: 30px;\n  margin-top: 6px;\n  overflow: hidden;\n  padding-top: 4px;\n  text-align: center;\n  text-overflow: ellipsis;\n  white-space: nowrap;\n  width: 30px;\n"]);

  _templateObject9 = function _templateObject9() {
    return data;
  };

  return data;
}

function _templateObject8() {
  var data = _taggedTemplateLiteral(["\n  display: table-cell;\n  text-align: right;\n"]);

  _templateObject8 = function _templateObject8() {
    return data;
  };

  return data;
}

function _templateObject7() {
  var data = _taggedTemplateLiteral(["\n  display: inline-block;\n  margin-left: 8px;\n  vertical-align: top;\n"]);

  _templateObject7 = function _templateObject7() {
    return data;
  };

  return data;
}

function _templateObject6() {
  var data = _taggedTemplateLiteral(["\n  height: 30px;\n  overflow: hidden\n"]);

  _templateObject6 = function _templateObject6() {
    return data;
  };

  return data;
}

function _templateObject5() {
  var data = _taggedTemplateLiteral(["\n  height: 30px;\n  width: 30px;\n"]);

  _templateObject5 = function _templateObject5() {
    return data;
  };

  return data;
}

function _templateObject4() {
  var data = _taggedTemplateLiteral(["\n  font-size: 18px;\n  font-weight: bold;\n  margin-top: -3px;\n"]);

  _templateObject4 = function _templateObject4() {
    return data;
  };

  return data;
}

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n  display: table-cell;\n  vertical-align: top;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  color: #999999;\n  font-size: 13px;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  display: ", ";\n  height: 60px;\n  margin-bottom: 15px;\n  padding-right: 5px;\n  width: 100%;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// TODO: make this a prop
var defaultRouteColor = '#008';

var Container = _styledComponents.default.div(_templateObject(), function () {
  return _coreUtils.default.ui.isMobile() ? 'table' : 'none';
});

var Detail = _styledComponents.default.div(_templateObject2());

var Details = _styledComponents.default.div(_templateObject3());

var Header = _styledComponents.default.div(_templateObject4());

var LegIconContainer = _styledComponents.default.div(_templateObject5());

var NonTransitSpacer = _styledComponents.default.div(_templateObject6());

var RoutePreview = _styledComponents.default.div(_templateObject7());

var Routes = _styledComponents.default.div(_templateObject8());

var ShortName = _styledComponents.default.div(_templateObject9(), function (props) {
  return getRouteColorForBadge(props.leg);
});

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
          itinerary = _this$props.itinerary,
          LegIcon = _this$props.LegIcon,
          timeOptions = _this$props.timeOptions;

      var _coreUtils$itinerary$ = _coreUtils.default.itinerary.calculateFares(itinerary),
          centsToString = _coreUtils$itinerary$.centsToString,
          maxTNCFare = _coreUtils$itinerary$.maxTNCFare,
          minTNCFare = _coreUtils$itinerary$.minTNCFare,
          transitFare = _coreUtils$itinerary$.transitFare; // TODO: support non-USD


      var minTotalFare = minTNCFare * 100 + transitFare;
      var maxTotalFare = maxTNCFare * 100 + transitFare;

      var _coreUtils$itinerary$2 = _coreUtils.default.itinerary.calculatePhysicalActivity(itinerary),
          caloriesBurned = _coreUtils$itinerary$2.caloriesBurned;

      return _react.default.createElement(Container, {
        onClick: this._onSummaryClicked
      }, _react.default.createElement(Details, null, _react.default.createElement(Header, null, _coreUtils.default.time.formatDuration(itinerary.duration)), _react.default.createElement(Detail, null, _coreUtils.default.time.formatTime(itinerary.startTime, timeOptions), " - ", _coreUtils.default.time.formatTime(itinerary.endTime, timeOptions)), _react.default.createElement(Detail, null, minTotalFare > 0 && _react.default.createElement("span", null, centsToString(minTotalFare), minTotalFare !== maxTotalFare && _react.default.createElement("span", null, " - ", centsToString(maxTotalFare)), _react.default.createElement("span", null, " \u2022 ")), Math.round(caloriesBurned), " Cals"), itinerary.transfers > 0 && _react.default.createElement(Detail, null, itinerary.transfers, " transfer", itinerary.transfers > 1 ? 's' : '')), _react.default.createElement(Routes, null, itinerary.legs.filter(function (leg) {
        return !(leg.mode === 'WALK' && itinerary.transitTime > 0);
      }).map(function (leg, k) {
        return _react.default.createElement(RoutePreview, {
          key: k
        }, _react.default.createElement(LegIconContainer, null, _react.default.createElement(LegIcon, {
          leg: leg
        })), _coreUtils.default.itinerary.isTransit(leg.mode) ? _react.default.createElement(ShortName, {
          leg: leg
        }, getRouteNameForBadge(leg)) : _react.default.createElement(NonTransitSpacer, null));
      })));
    }
  }]);

  return ItinerarySummary;
}(_react.Component); // Helper functions


exports.default = ItinerarySummary;

_defineProperty(ItinerarySummary, "propTypes", {
  itinerary: _propTypes.default.object,
  LegIcon: _propTypes.default.elementType.isRequired
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