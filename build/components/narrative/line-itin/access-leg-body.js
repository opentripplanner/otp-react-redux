"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _velocityReact = require("velocity-react");

var _currencyFormatter = _interopRequireDefault(require("currency-formatter"));

var _legDiagramPreview = _interopRequireDefault(require("../leg-diagram-preview"));

var _distance = require("../../../util/distance");

var _itinerary = require("../../../util/itinerary");

var _time = require("../../../util/time");

var _ui = require("../../../util/ui");

var _directionIcon = _interopRequireDefault(require("../../icons/direction-icon"));

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

/**
 * Component for access (e.g. walk/bike/etc.) leg in narrative itinerary. This
 * particular component is used in the line-itin (i.e., trimet-mod-otp) version
 * of the narrative itinerary.
 */
var AccessLegBody =
/*#__PURE__*/
function (_Component) {
  _inherits(AccessLegBody, _Component);

  function AccessLegBody(props) {
    var _this;

    _classCallCheck(this, AccessLegBody);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(AccessLegBody).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_onStepsHeaderClick", function () {
      _this.setState({
        expanded: !_this.state.expanded
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onSummaryClick", function () {
      _this.props.setActiveLeg(_this.props.legIndex, _this.props.leg);
    });

    _this.state = {
      expanded: false
    };
    return _this;
  }

  _createClass(AccessLegBody, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          config = _this$props.config,
          customIcons = _this$props.customIcons,
          followsTransit = _this$props.followsTransit,
          leg = _this$props.leg,
          timeOptions = _this$props.timeOptions;

      if (leg.mode === 'CAR' && leg.hailedCar) {
        return _react.default.createElement(TNCLeg, {
          config: config,
          leg: leg,
          onSummaryClick: this._onSummaryClick,
          timeOptions: timeOptions,
          followsTransit: followsTransit,
          customIcons: customIcons
        });
      }

      return _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement(AccessLegSummary, {
        config: config,
        leg: leg,
        onSummaryClick: this._onSummaryClick,
        customIcons: customIcons
      }), _react.default.createElement("div", {
        onClick: this._onStepsHeaderClick,
        className: "steps-header"
      }, (0, _time.formatDuration)(leg.duration), leg.steps && _react.default.createElement("span", null, " ", _react.default.createElement("i", {
        className: "fa fa-caret-".concat(this.state.expanded ? 'up' : 'down')
      }))), this.props.routingType === 'ITINERARY' && _react.default.createElement(_legDiagramPreview.default, {
        leg: leg
      }), _react.default.createElement(_velocityReact.VelocityTransitionGroup, {
        enter: {
          animation: 'slideDown'
        },
        leave: {
          animation: 'slideUp'
        }
      }, this.state.expanded && _react.default.createElement(AccessLegSteps, {
        steps: leg.steps
      })));
    }
  }]);

  return AccessLegBody;
}(_react.Component);

exports.default = AccessLegBody;

_defineProperty(AccessLegBody, "propTypes", {
  leg: _propTypes.default.object,
  routingType: _propTypes.default.string
});

var TNCLeg =
/*#__PURE__*/
function (_Component2) {
  _inherits(TNCLeg, _Component2);

  function TNCLeg() {
    _classCallCheck(this, TNCLeg);

    return _possibleConstructorReturn(this, _getPrototypeOf(TNCLeg).apply(this, arguments));
  }

  _createClass(TNCLeg, [{
    key: "render",
    value: function render() {
      // TODO: ensure that client ID fields are populated
      var _this$props2 = this.props,
          config = _this$props2.config,
          LYFT_CLIENT_ID = _this$props2.LYFT_CLIENT_ID,
          UBER_CLIENT_ID = _this$props2.UBER_CLIENT_ID,
          customIcons = _this$props2.customIcons,
          followsTransit = _this$props2.followsTransit,
          leg = _this$props2.leg,
          timeOptions = _this$props2.timeOptions;
      var universalLinks = {
        'UBER': "https://m.uber.com/".concat((0, _ui.isMobile)() ? 'ul/' : '', "?client_id=").concat(UBER_CLIENT_ID, "&action=setPickup&pickup[latitude]=").concat(leg.from.lat, "&pickup[longitude]=").concat(leg.from.lon, "&pickup[formatted_address]=").concat(encodeURI(leg.from.name), "&dropoff[latitude]=").concat(leg.to.lat, "&dropoff[longitude]=").concat(leg.to.lon, "&dropoff[formatted_address]=").concat(encodeURI(leg.to.name)),
        'LYFT': "https://lyft.com/ride?id=lyft&partner=".concat(LYFT_CLIENT_ID, "&pickup[latitude]=").concat(leg.from.lat, "&pickup[longitude]=").concat(leg.from.lon, "&destination[latitude]=").concat(leg.to.lat, "&destination[longitude]=").concat(leg.to.lon)
      };
      var tncData = leg.tncData;
      if (!tncData || !tncData.estimatedArrival) return null;
      return _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "place-subheader"
      }, "Wait ", !followsTransit && _react.default.createElement("span", null, Math.round(tncData.estimatedArrival / 60), " minutes "), "for ", tncData.displayName, " pickup"), _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement(AccessLegSummary, {
        config: config,
        leg: leg,
        onSummaryClick: this.props.onSummaryClick,
        customIcons: customIcons
      }), _react.default.createElement("div", {
        style: {
          marginTop: 10,
          marginBottom: 10,
          height: 32,
          position: 'relative'
        }
      }, _react.default.createElement("a", {
        className: "btn btn-default",
        href: universalLinks[tncData.company],
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          height: 32,
          paddingTop: 4,
          width: 90,
          textAlign: 'center'
        },
        target: (0, _ui.isMobile)() ? '_self' : '_blank'
      }, "Book Ride"), followsTransit && _react.default.createElement("div", {
        style: {
          position: 'absolute',
          top: 0,
          left: 94,
          width: 0,
          height: 0,
          borderTop: '16px solid transparent',
          borderBottom: '16px solid transparent',
          borderRight: '16px solid #fcf9d3'
        }
      }), followsTransit && _react.default.createElement("div", {
        style: {
          position: 'absolute',
          top: 0,
          left: 110,
          right: 0,
          bottom: 0
        }
      }, _react.default.createElement("div", {
        style: {
          display: 'table',
          backgroundColor: '#fcf9d3',
          width: '100%',
          height: '100%'
        }
      }, _react.default.createElement("div", {
        style: {
          padding: '0px 2px',
          display: 'table-cell',
          verticalAlign: 'middle',
          color: '#444',
          fontStyle: 'italic',
          lineHeight: 0.95
        }
      }, "Wait until ", (0, _time.formatTime)(leg.startTime - tncData.estimatedArrival * 1000, timeOptions), " to book")))), _react.default.createElement("div", {
        className: "steps-header"
      }, "Estimated travel time: ", (0, _time.formatDuration)(leg.duration), " (does not account for traffic)"), tncData.minCost && _react.default.createElement("p", null, "Estimated cost: ", "".concat(_currencyFormatter.default.format(tncData.minCost, {
        code: tncData.currency
      }), " - ").concat(_currencyFormatter.default.format(tncData.maxCost, {
        code: tncData.currency
      })))));
    }
  }]);

  return TNCLeg;
}(_react.Component);

var AccessLegSummary =
/*#__PURE__*/
function (_Component3) {
  _inherits(AccessLegSummary, _Component3);

  function AccessLegSummary() {
    _classCallCheck(this, AccessLegSummary);

    return _possibleConstructorReturn(this, _getPrototypeOf(AccessLegSummary).apply(this, arguments));
  }

  _createClass(AccessLegSummary, [{
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          config = _this$props3.config,
          customIcons = _this$props3.customIcons,
          leg = _this$props3.leg;
      return _react.default.createElement("div", {
        className: "summary leg-description",
        onClick: this.props.onSummaryClick
      }, _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "icon"
      }, (0, _itinerary.getLegIcon)(leg, customIcons))), _react.default.createElement("div", null, (0, _itinerary.getLegModeLabel)(leg), ' ', leg.distance > 0 && _react.default.createElement("span", null, " ", (0, _distance.distanceString)(leg.distance)), " to ".concat((0, _itinerary.getPlaceName)(leg.to, config.companies))));
    }
  }]);

  return AccessLegSummary;
}(_react.Component);

var AccessLegSteps =
/*#__PURE__*/
function (_Component4) {
  _inherits(AccessLegSteps, _Component4);

  function AccessLegSteps() {
    _classCallCheck(this, AccessLegSteps);

    return _possibleConstructorReturn(this, _getPrototypeOf(AccessLegSteps).apply(this, arguments));
  }

  _createClass(AccessLegSteps, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        className: "steps"
      }, this.props.steps.map(function (step, k) {
        return _react.default.createElement("div", {
          className: "step-row",
          key: k
        }, _react.default.createElement("div", {
          style: {
            width: 16,
            height: 16,
            float: 'left',
            fill: '#999999'
          }
        }, _react.default.createElement(_directionIcon.default, {
          relativeDirection: step.relativeDirection
        })), _react.default.createElement("div", {
          style: {
            marginLeft: 24,
            lineHeight: 1.25,
            paddingTop: 1
          }
        }, (0, _itinerary.getStepDirection)(step), _react.default.createElement("span", null, step.relativeDirection === 'ELEVATOR' ? ' to ' : ' on '), _react.default.createElement("span", {
          style: {
            fontWeight: 500
          }
        }, (0, _itinerary.getStepStreetName)(step))));
      }));
    }
  }]);

  return AccessLegSteps;
}(_react.Component);

_defineProperty(AccessLegSteps, "propTypes", {
  steps: _propTypes.default.array
});

module.exports = exports.default;

//# sourceMappingURL=access-leg-body.js