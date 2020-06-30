"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.array.includes");

require("core-js/modules/es6.string.includes");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.regexp.replace");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _icon = _interopRequireDefault(require("../icon"));

var _viewTripButton = _interopRequireDefault(require("../../viewers/view-trip-button"));

var _viewStopButton = _interopRequireDefault(require("../../viewers/view-stop-button"));

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

var getMapColor = _coreUtils.default.itinerary.getMapColor;
var _coreUtils$time = _coreUtils.default.time,
    formatDuration = _coreUtils$time.formatDuration,
    formatTime = _coreUtils$time.formatTime;

var TransitLeg =
/*#__PURE__*/
function (_Component) {
  _inherits(TransitLeg, _Component);

  function TransitLeg(props) {
    var _this;

    _classCallCheck(this, TransitLeg);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(TransitLeg).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_onClick", function () {
      _this.setState({
        expanded: !_this.state.expanded
      });
    });

    _this.state = {
      expanded: false
    };
    return _this;
  }

  _createClass(TransitLeg, [{
    key: "_onLegClick",
    value: function _onLegClick(e, leg, index) {
      if (this.props.active) {
        this.props.setActiveLeg(null);
      } else {
        this.props.setActiveLeg(index, leg);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          active = _this$props.active,
          index = _this$props.index,
          leg = _this$props.leg,
          LegIcon = _this$props.LegIcon;
      var expanded = this.state.expanded;
      var numStops = leg.to.stopIndex - leg.from.stopIndex - 1;
      return _react.default.createElement("div", {
        className: "leg".concat(active ? ' active' : '', " transit-leg")
      }, _react.default.createElement("button", {
        className: "header",
        onClick: function onClick(e) {
          return _this2._onLegClick(e, leg, index);
        }
      }, _react.default.createElement("div", {
        className: "mode-icon-container"
      }, _react.default.createElement(LegIcon, {
        leg: leg
      })), _react.default.createElement("div", {
        className: "route-name"
      }, _react.default.createElement("div", null, leg.routeShortName && _react.default.createElement("span", {
        className: "route-short-name"
      }, leg.routeShortName), leg.routeLongName && _react.default.createElement("span", {
        className: "route-long-name"
      }, leg.routeLongName)), leg.headsign && _react.default.createElement("div", {
        className: "headsign"
      }, "To ", leg.headsign)), leg.realTime ? _react.default.createElement(_icon.default, {
        type: "rss"
      }) : null), _react.default.createElement("div", {
        className: "step-by-step"
      }, _react.default.createElement("div", {
        className: "transit-leg-body"
      }, _react.default.createElement("div", {
        className: "from-row"
      }, _react.default.createElement("div", {
        className: "time-cell"
      }, formatTime(leg.startTime)), _react.default.createElement("div", {
        className: "trip-line-cell"
      }, _react.default.createElement("div", {
        className: "trip-line-top",
        style: {
          backgroundColor: getMapColor(leg.mode)
        }
      }), _react.default.createElement("div", {
        className: "stop-bubble"
      })), _react.default.createElement("div", {
        className: "stop-name-cell"
      }, _react.default.createElement("div", {
        style: {
          float: 'right'
        }
      }, _react.default.createElement(_viewStopButton.default, {
        stopId: leg.from.stopId
      })), formatLocation(leg.from.name))), _react.default.createElement("div", {
        className: "trip-details-row"
      }, _react.default.createElement("div", {
        className: "time-cell"
      }), _react.default.createElement("div", {
        className: "trip-line-cell"
      }, _react.default.createElement("div", {
        className: "trip-line-middle",
        style: {
          backgroundColor: getMapColor(leg.mode)
        }
      })), _react.default.createElement("div", {
        className: "trip-details-cell"
      }, _react.default.createElement("div", {
        className: "intermediate-stops"
      }, _react.default.createElement("div", null, _react.default.createElement("div", {
        style: {
          float: 'right'
        }
      }, _react.default.createElement(_viewTripButton.default, {
        tripId: leg.tripId,
        fromIndex: leg.from.stopIndex,
        toIndex: leg.to.stopIndex
      })), _react.default.createElement("button", {
        className: "clear-button-formatting",
        onClick: this._onClick
      }, _react.default.createElement(_icon.default, {
        type: "caret-".concat(expanded ? 'down' : 'right')
      }), _react.default.createElement("span", {
        className: "transit-duration"
      }, formatDuration(leg.duration)), ' ', "(", numStops ? "".concat(numStops, " stops") : 'non-stop', ")"), _react.default.createElement("div", {
        style: {
          clear: 'both'
        }
      })), expanded && _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "stop-list"
      }, leg.intermediateStops.map(function (s, i) {
        return _react.default.createElement("div", {
          key: i,
          className: "stop-item item"
        }, _react.default.createElement("div", {
          className: "trip-line-stop",
          style: {
            backgroundColor: getMapColor(leg.mode)
          }
        }), _react.default.createElement("span", {
          className: "stop-name"
        }, formatLocation(s.name)));
      })))), leg.alerts && _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "item"
      }, _react.default.createElement(_icon.default, {
        type: "exclamation-circle"
      }), " Information"), expanded && _react.default.createElement("div", null, leg.alerts.map(function (alert, i) {
        return _react.default.createElement("div", {
          className: "alert-item item",
          key: i
        }, alert.alertDescriptionText, ' ', alert.alertUrl ? _react.default.createElement("a", {
          target: "_blank",
          href: alert.alertUrl
        }, "more info") : null);
      }))), _react.default.createElement("div", {
        className: "item info-item"
      }, _react.default.createElement("span", {
        className: "agency-info"
      }, "Service operated by ", _react.default.createElement("a", {
        href: leg.agencyUrl
      }, leg.agencyName))))), _react.default.createElement("div", {
        className: "to-row"
      }, _react.default.createElement("div", {
        className: "time-cell"
      }, formatTime(leg.endTime)), _react.default.createElement("div", {
        className: "trip-line-cell"
      }, _react.default.createElement("div", {
        className: "trip-line-bottom",
        style: {
          backgroundColor: getMapColor(leg.mode)
        }
      }), _react.default.createElement("div", {
        className: "stop-bubble"
      })), _react.default.createElement("div", {
        className: "stop-name-cell"
      }, _react.default.createElement("div", {
        style: {
          float: 'right'
        }
      }, _react.default.createElement(_viewStopButton.default, {
        stopId: leg.to.stopId
      })), formatLocation(leg.to.name))))));
    }
  }]);

  return TransitLeg;
}(_react.Component);

exports.default = TransitLeg;

_defineProperty(TransitLeg, "propTypes", {
  itinerary: _propTypes.default.object,
  LegIcon: _propTypes.default.elementType.isRequired
});

function formatLocation(str) {
  return str.trim().toLowerCase().replace('/', ' / ').replace('-', ' - ').replace('@', ' @ ').replace('(', '( ').replace('  ', ' ').split(' ').map(function (s) {
    if (['ne', 'sw', 'nw', 'se'].includes(s)) return s.toUpperCase();
    return capitalizeFirst(s);
  }).join(' ').replace('( ', '(');
}

function capitalizeFirst(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = exports.default;

//# sourceMappingURL=transit-leg.js