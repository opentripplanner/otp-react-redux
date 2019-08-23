"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.array.find");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _velocityReact = require("velocity-react");

var _moment = _interopRequireDefault(require("moment"));

var _viewTripButton = _interopRequireDefault(require("../../viewers/view-trip-button"));

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

// TODO: support multi-route legs for profile routing
var TransitLegBody =
/*#__PURE__*/
function (_Component) {
  _inherits(TransitLegBody, _Component);

  function TransitLegBody(props) {
    var _this;

    _classCallCheck(this, TransitLegBody);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TransitLegBody).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_onToggleStopsClick", function () {
      _this.setState({
        stopsExpanded: !_this.state.stopsExpanded
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onToggleAlertsClick", function () {
      _this.setState({
        alertsExpanded: !_this.state.alertsExpanded
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onSummaryClick", function () {
      _this.props.setActiveLeg(_this.props.legIndex, _this.props.leg);
    });

    _this.state = {
      alertsExpanded: false,
      stopsExpanded: false
    };
    return _this;
  }

  _createClass(TransitLegBody, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          customIcons = _this$props.customIcons,
          leg = _this$props.leg,
          longDateFormat = _this$props.longDateFormat,
          operator = _this$props.operator,
          timeFormat = _this$props.timeFormat;
      var agencyBrandingUrl = leg.agencyBrandingUrl,
          agencyName = leg.agencyName,
          agencyUrl = leg.agencyUrl,
          alerts = leg.alerts,
          mode = leg.mode,
          routeShortName = leg.routeShortName,
          routeLongName = leg.routeLongName,
          headsign = leg.headsign;
      var _this$state = this.state,
          alertsExpanded = _this$state.alertsExpanded,
          stopsExpanded = _this$state.stopsExpanded; // If the config contains an operator with a logo URL, prefer that over the
      // one provided by OTP (which is derived from agency.txt#agency_branding_url)

      var logoUrl = operator && operator.logo ? operator.logo : agencyBrandingUrl; // get the iconKey for the leg's icon

      var iconKey = mode;

      if (typeof customIcons.customIconForLeg === 'function') {
        var customIcon = customIcons.customIconForLeg(leg);
        if (customIcon) iconKey = customIcon;
      }

      return _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement("div", {
        className: "summary",
        onClick: this._onSummaryClick
      }, _react.default.createElement("div", {
        className: "route-name leg-description"
      }, _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "icon"
      }, (0, _itinerary.getIcon)(iconKey, customIcons))), routeShortName && _react.default.createElement("div", null, _react.default.createElement("span", {
        className: "route-short-name"
      }, routeShortName)), _react.default.createElement("div", {
        className: "route-long-name"
      }, routeLongName, headsign && _react.default.createElement("span", null, " ", _react.default.createElement("span", {
        style: {
          fontWeight: '200'
        }
      }, "to"), " ", headsign)))), _react.default.createElement("div", {
        className: "agency-info"
      }, "Service operated by", ' ', _react.default.createElement("a", {
        href: agencyUrl,
        target: "_blank"
      }, agencyName, logoUrl && _react.default.createElement("img", {
        src: logoUrl,
        height: 25,
        style: {
          marginLeft: '5px'
        }
      }))), alerts && alerts.length > 0 && _react.default.createElement("div", {
        onClick: this._onToggleAlertsClick,
        className: "transit-alerts-toggle"
      }, _react.default.createElement("i", {
        className: "fa fa-exclamation-triangle"
      }), " ", alerts.length, " ", pluralize('alert', alerts), ' ', _react.default.createElement("i", {
        className: "fa fa-caret-".concat(this.state.alertsExpanded ? 'up' : 'down')
      })), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, alertsExpanded && _react.default.createElement(AlertsBody, {
        alerts: leg.alerts,
        longDateFormat: longDateFormat,
        timeFormat: timeFormat
      })), leg.intermediateStops && leg.intermediateStops.length > 0 && _react.default.createElement("div", {
        className: "transit-leg-details"
      }, _react.default.createElement("div", {
        onClick: this._onToggleStopsClick,
        className: "header"
      }, leg.duration && _react.default.createElement("span", null, "Ride ", (0, _time.formatDuration)(leg.duration)), leg.intermediateStops && _react.default.createElement("span", null, ' / ', leg.intermediateStops.length + 1, ' stops ', _react.default.createElement("i", {
        className: "fa fa-caret-".concat(this.state.stopsExpanded ? 'up' : 'down')
      })), _react.default.createElement(_viewTripButton.default, {
        tripId: leg.tripId,
        fromIndex: leg.from.stopIndex,
        toIndex: leg.to.stopIndex
      })), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, stopsExpanded ? _react.default.createElement(IntermediateStops, {
        stops: leg.intermediateStops
      }) : null), leg.averageWait && _react.default.createElement("span", null, "Typical Wait: ", (0, _time.formatDuration)(leg.averageWait))));
    }
  }]);

  return TransitLegBody;
}(_react.Component); // Connect to the redux store


_defineProperty(TransitLegBody, "propTypes", {
  leg: _propTypes.default.object,
  legIndex: _propTypes.default.number,
  setActiveLeg: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    longDateFormat: (0, _time.getLongDateFormat)(state.otp.config),
    operator: state.otp.config.operators.find(function (operator) {
      return operator.id === ownProps.leg.agencyId;
    }),
    timeFormat: (0, _time.getTimeFormat)(state.otp.config)
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TransitLegBody);

exports.default = _default;

var IntermediateStops =
/*#__PURE__*/
function (_Component2) {
  _inherits(IntermediateStops, _Component2);

  function IntermediateStops() {
    _classCallCheck(this, IntermediateStops);

    return _possibleConstructorReturn(this, _getPrototypeOf(IntermediateStops).apply(this, arguments));
  }

  _createClass(IntermediateStops, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: "intermediate-stops"
      }, this.props.stops.map(function (stop, k) {
        return _react.default.createElement("div", {
          className: "stop-row",
          key: k
        }, _react.default.createElement("div", {
          className: "stop-marker"
        }, "\u2022"), _react.default.createElement("div", {
          className: "stop-name"
        }, stop.name));
      }));
    }
  }]);

  return IntermediateStops;
}(_react.Component);

_defineProperty(IntermediateStops, "propTypes", {
  stops: _propTypes.default.array
});

var AlertsBody =
/*#__PURE__*/
function (_Component3) {
  _inherits(AlertsBody, _Component3);

  function AlertsBody() {
    _classCallCheck(this, AlertsBody);

    return _possibleConstructorReturn(this, _getPrototypeOf(AlertsBody).apply(this, arguments));
  }

  _createClass(AlertsBody, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          longDateFormat = _this$props2.longDateFormat,
          timeFormat = _this$props2.timeFormat;
      return _react.default.createElement("div", {
        className: "transit-alerts"
      }, this.props.alerts.sort(function (a, b) {
        return b.effectiveStartDate - a.effectiveStartDate;
      }).map(function (alert, i) {
        // If alert is effective as of +/- one day, use today, tomorrow, or
        // yesterday with time. Otherwise, use long date format.
        var dateTimeString = (0, _moment.default)(alert.effectiveStartDate).calendar(null, {
          sameDay: "".concat(timeFormat, ", [Today]"),
          nextDay: "".concat(timeFormat, ", [Tomorrow]"),
          lastDay: "".concat(timeFormat, ", [Yesterday]"),
          lastWeek: "".concat(longDateFormat),
          sameElse: "".concat(longDateFormat)
        });
        var effectiveDateString = "Effective as of ".concat(dateTimeString);
        return _react.default.createElement("div", {
          key: i,
          className: "transit-alert"
        }, _react.default.createElement("div", {
          className: "alert-icon"
        }, _react.default.createElement("i", {
          className: "fa fa-exclamation-triangle"
        })), _react.default.createElement("div", {
          className: "alert-body"
        }, alert.alertDescriptionText), _react.default.createElement("div", {
          className: "effective-date"
        }, effectiveDateString));
      }));
    }
  }]);

  return AlertsBody;
}(_react.Component); // TODO use pluralize that for internationalization (and complex plurals, i.e., not just adding 's')


_defineProperty(AlertsBody, "propTypes", {
  alerts: _propTypes.default.array
});

function pluralize(str, list) {
  return "".concat(str).concat(list.length > 1 ? 's' : '');
}

module.exports = exports.default;

//# sourceMappingURL=transit-leg-body.js