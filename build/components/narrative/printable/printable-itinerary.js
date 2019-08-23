"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _tripDetails = _interopRequireDefault(require("../trip-details"));

var _distance = require("../../../util/distance");

var _time = require("../../../util/time");

var _itinerary = require("../../../util/itinerary");

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

var PrintableItinerary =
/*#__PURE__*/
function (_Component) {
  _inherits(PrintableItinerary, _Component);

  function PrintableItinerary() {
    _classCallCheck(this, PrintableItinerary);

    return _possibleConstructorReturn(this, _getPrototypeOf(PrintableItinerary).apply(this, arguments));
  }

  _createClass(PrintableItinerary, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          configCompanies = _this$props.configCompanies,
          customIcons = _this$props.customIcons,
          itinerary = _this$props.itinerary,
          timeFormat = _this$props.timeFormat;
      var timeOptions = {
        format: timeFormat,
        offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
      };
      return _react.default.createElement("div", {
        className: "printable-itinerary"
      }, itinerary.legs.length > 0 && _react.default.createElement("div", {
        className: "leg collapse-top"
      }, _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement("div", {
        className: "leg-header"
      }, _react.default.createElement("b", null, "Depart"), " from ", _react.default.createElement("b", null, itinerary.legs[0].from.name)))), itinerary.legs.map(function (leg, k) {
        return leg.transitLeg ? _react.default.createElement(TransitLeg, {
          key: k,
          customIcons: customIcons,
          interlineFollows: k < itinerary.legs.length - 1 && itinerary.legs[k + 1].interlineWithPreviousLeg,
          leg: leg,
          timeOptions: timeOptions
        }) : leg.hailedCar ? _react.default.createElement(TNCLeg, {
          customIcons: customIcons,
          leg: leg,
          timeOptions: timeOptions
        }) : _react.default.createElement(AccessLeg, {
          key: k,
          configCompanies: configCompanies,
          customIcons: customIcons,
          leg: leg,
          timeOptions: timeOptions
        });
      }), _react.default.createElement(_tripDetails.default, {
        itinerary: itinerary
      }));
    }
  }]);

  return PrintableItinerary;
}(_react.Component);

exports.default = PrintableItinerary;

_defineProperty(PrintableItinerary, "propTypes", {
  itinerary: _propTypes.default.object
});

var TransitLeg =
/*#__PURE__*/
function (_Component2) {
  _inherits(TransitLeg, _Component2);

  function TransitLeg() {
    _classCallCheck(this, TransitLeg);

    return _possibleConstructorReturn(this, _getPrototypeOf(TransitLeg).apply(this, arguments));
  }

  _createClass(TransitLeg, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          customIcons = _this$props2.customIcons,
          leg = _this$props2.leg,
          interlineFollows = _this$props2.interlineFollows,
          timeOptions = _this$props2.timeOptions; // Handle case of transit leg interlined w/ previous

      if (leg.interlineWithPreviousLeg) {
        return _react.default.createElement("div", {
          className: "leg collapse-top"
        }, _react.default.createElement("div", {
          className: "leg-body"
        }, _react.default.createElement("div", {
          className: "leg-header"
        }, "Continues as", ' ', _react.default.createElement("b", null, leg.routeShortName, " ", leg.routeLongName), ' ', "to ", _react.default.createElement("b", null, leg.to.name)), _react.default.createElement("div", {
          className: "leg-details"
        }, _react.default.createElement("div", {
          className: "leg-detail"
        }, "Get off at ", _react.default.createElement("b", null, leg.to.name), ' ', "at ", (0, _time.formatTime)(leg.endTime, timeOptions)))));
      }

      return _react.default.createElement("div", {
        className: "leg"
      }, _react.default.createElement("div", {
        className: "mode-icon"
      }, (0, _itinerary.getLegIcon)(leg, customIcons)), _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement("div", {
        className: "leg-header"
      }, _react.default.createElement("b", null, leg.routeShortName, " ", leg.routeLongName), " to ", _react.default.createElement("b", null, leg.to.name)), _react.default.createElement("div", {
        className: "leg-details"
      }, _react.default.createElement("div", {
        className: "leg-detail"
      }, "Board at ", _react.default.createElement("b", null, leg.from.name), ' ', "at ", (0, _time.formatTime)(leg.startTime, timeOptions)), _react.default.createElement("div", {
        className: "leg-detail"
      }, interlineFollows ? _react.default.createElement("span", null, "Stay on board at ", _react.default.createElement("b", null, leg.to.name)) : _react.default.createElement("span", null, "Get off at ", _react.default.createElement("b", null, leg.to.name), ' ', "at ", (0, _time.formatTime)(leg.endTime, timeOptions))))));
    }
  }]);

  return TransitLeg;
}(_react.Component);

_defineProperty(TransitLeg, "propTypes", {
  leg: _propTypes.default.object
});

var AccessLeg =
/*#__PURE__*/
function (_Component3) {
  _inherits(AccessLeg, _Component3);

  function AccessLeg() {
    _classCallCheck(this, AccessLeg);

    return _possibleConstructorReturn(this, _getPrototypeOf(AccessLeg).apply(this, arguments));
  }

  _createClass(AccessLeg, [{
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          configCompanies = _this$props3.configCompanies,
          customIcons = _this$props3.customIcons,
          leg = _this$props3.leg; // calculate leg mode label in a special way for this component

      var legModeLabel = (0, _itinerary.getLegModeLabel)(leg);

      if (leg.rentedBike) {
        // FIXME: Special case for TriMet that needs to be refactored to
        // incorporate actual company.
        legModeLabel = 'Ride BIKETOWN bike';
      } else if (leg.rentedCar) {
        // Add extra information to printview that would otherwise clutter up
        // other places that use the getLegModeLabel function
        var companiesLabel = (0, _itinerary.getCompaniesLabelFromNetworks)(leg.from.networks, configCompanies);
        legModeLabel = "Drive ".concat(companiesLabel, " ").concat(leg.from.name);
      } else if (leg.rentedVehicle) {
        var _companiesLabel = (0, _itinerary.getCompaniesLabelFromNetworks)(leg.from.networks, configCompanies);

        legModeLabel = "Ride ".concat(_companiesLabel, " eScooter");
      }

      return _react.default.createElement("div", {
        className: "leg"
      }, _react.default.createElement("div", {
        className: "mode-icon"
      }, (0, _itinerary.getLegIcon)(leg, customIcons)), _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement("div", {
        className: "leg-header"
      }, _react.default.createElement("b", null, legModeLabel), ' ', !leg.hailedCar && leg.distance > 0 && _react.default.createElement("span", null, " ", (0, _distance.distanceString)(leg.distance), " "), "to ", _react.default.createElement("b", null, (0, _itinerary.getPlaceName)(leg.to, configCompanies))), !leg.hailedCar && _react.default.createElement("div", {
        className: "leg-details"
      }, leg.steps.map(function (step, k) {
        return _react.default.createElement("div", {
          key: k,
          className: "leg-detail"
        }, (0, _itinerary.getStepDirection)(step), " on ", _react.default.createElement("b", null, (0, _itinerary.getStepStreetName)(step)));
      }))));
    }
  }]);

  return AccessLeg;
}(_react.Component);

_defineProperty(AccessLeg, "propTypes", {
  leg: _propTypes.default.object
});

var TNCLeg =
/*#__PURE__*/
function (_Component4) {
  _inherits(TNCLeg, _Component4);

  function TNCLeg() {
    _classCallCheck(this, TNCLeg);

    return _possibleConstructorReturn(this, _getPrototypeOf(TNCLeg).apply(this, arguments));
  }

  _createClass(TNCLeg, [{
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          customIcons = _this$props4.customIcons,
          leg = _this$props4.leg;
      var tncData = leg.tncData;
      if (!tncData) return null;
      return _react.default.createElement("div", {
        className: "leg"
      }, _react.default.createElement("div", {
        className: "mode-icon"
      }, (0, _itinerary.getLegIcon)(leg, customIcons)), _react.default.createElement("div", {
        className: "leg-body"
      }, _react.default.createElement("div", {
        className: "leg-header"
      }, _react.default.createElement("b", null, "Take ", tncData.displayName), " to ", _react.default.createElement("b", null, leg.to.name)), _react.default.createElement("div", {
        className: "leg-details"
      }, _react.default.createElement("div", {
        className: "leg-detail"
      }, "Estimated wait time for pickup:", ' ', _react.default.createElement("b", null, (0, _time.formatDuration)(tncData.estimatedArrival))), _react.default.createElement("div", {
        className: "leg-detail"
      }, "Estimated travel time:", ' ', _react.default.createElement("b", null, (0, _time.formatDuration)(leg.duration)), " (does not account for traffic)"))));
    }
  }]);

  return TNCLeg;
}(_react.Component);

_defineProperty(TNCLeg, "propTypes", {
  leg: _propTypes.default.object
});

module.exports = exports.default;

//# sourceMappingURL=printable-itinerary.js