"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

var _locationIcon = _interopRequireDefault(require("@opentripplanner/location-icon"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _viewStopButton = _interopRequireDefault(require("../../viewers/view-stop-button"));

var _itinerary = require("../../../util/itinerary");

var _time = require("../../../util/time");

var _transitLegBody = _interopRequireDefault(require("./transit-leg-body"));

var _accessLegBody = _interopRequireDefault(require("./access-leg-body"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

// TODO: make this a prop
var defaultRouteColor = '#008';

var PlaceRow =
/*#__PURE__*/
function (_Component) {
  _inherits(PlaceRow, _Component);

  function PlaceRow() {
    _classCallCheck(this, PlaceRow);

    return _possibleConstructorReturn(this, _getPrototypeOf(PlaceRow).apply(this, arguments));
  }

  _createClass(PlaceRow, [{
    key: "_createLegLine",
    value: function _createLegLine(leg) {
      switch (leg.mode) {
        case 'WALK':
          return _react.default.createElement("div", {
            className: "leg-line leg-line-walk"
          });

        case 'BICYCLE':
        case 'BICYCLE_RENT':
          return _react.default.createElement("div", {
            className: "leg-line leg-line-bicycle"
          });

        case 'CAR':
          return _react.default.createElement("div", {
            className: "leg-line leg-line-car"
          });

        case 'MICROMOBILITY':
        case 'MICROMOBILITY_RENT':
          return _react.default.createElement("div", {
            className: "leg-line leg-line-micromobility"
          });

        default:
          return _react.default.createElement("div", {
            className: "leg-line leg-line-transit",
            style: {
              backgroundColor: leg.routeColor ? '#' + leg.routeColor : defaultRouteColor
            }
          });
      }
    }
    /* eslint-disable complexity */

  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          config = _this$props.config,
          customIcons = _this$props.customIcons,
          leg = _this$props.leg,
          legIndex = _this$props.legIndex,
          place = _this$props.place,
          time = _this$props.time,
          timeOptions = _this$props.timeOptions,
          followsTransit = _this$props.followsTransit;

      var stackIcon = function stackIcon(name, color, size) {
        return _react.default.createElement("i", {
          className: "fa fa-".concat(name, " fa-stack-1x"),
          style: {
            color: color,
            fontSize: size + 'px'
          }
        });
      };

      var icon;

      if (!leg) {
        // This is the itinerary destination
        icon = _react.default.createElement("span", {
          className: "fa-stack place-icon-group"
        }, stackIcon('circle', 'white', 26), _react.default.createElement(_locationIcon.default, {
          type: "to",
          className: "fa-stack-1x",
          style: {
            fontSize: 20
          }
        }));
      } else if (legIndex === 0) {
        // The is the origin
        icon = _react.default.createElement("span", {
          className: "fa-stack place-icon-group"
        }, stackIcon('circle', 'white', 26), _react.default.createElement(_locationIcon.default, {
          type: "from",
          className: "fa-stack-1x",
          style: {
            fontSize: 20
          }
        }));
      } else {
        // This is an intermediate place
        icon = _react.default.createElement("span", {
          className: "fa-stack place-icon-group"
        }, stackIcon('circle', 'white', 22), stackIcon('circle-o', 'black', 22));
      } // NOTE: Previously there was a check for itineraries that changed vehicles
      // at a single stop, which would render the stop place the same as the
      // interline stop. However, this prevents the user from being able to click
      // on the stop viewer in this case, which they may want to do in order to
      // check the real-time arrival information for the next leg of their journey.


      var interline = leg && leg.interlineWithPreviousLeg;
      return _react.default.createElement("div", {
        className: "place-row",
        key: this.rowKey++
      }, _react.default.createElement("div", {
        className: "time"
      }, time && (0, _time.formatTime)(time, timeOptions)), _react.default.createElement("div", {
        className: "line-container"
      }, leg && this._createLegLine(leg), _react.default.createElement("div", null, !interline && icon)), _react.default.createElement("div", {
        className: "place-details"
      }, interline && _react.default.createElement("div", {
        className: "interline-dot"
      }, "\u2022"), _react.default.createElement("div", {
        className: "place-name"
      }, interline ? _react.default.createElement("div", {
        className: "interline-name"
      }, "Stay on Board at ", _react.default.createElement("b", null, place.name)) : _react.default.createElement("div", null, (0, _itinerary.getPlaceName)(place, config.companies))), place.stopId && !interline && _react.default.createElement("div", {
        className: "place-subheader"
      }, _react.default.createElement("span", null, "Stop ID ", place.stopId.split(':')[1]), _react.default.createElement(_viewStopButton.default, {
        stopId: place.stopId
      })), leg && (leg.rentedVehicle || leg.rentedBike || leg.rentedCar) && _react.default.createElement(RentedVehicleLeg, {
        config: config,
        leg: leg
      }), leg && (leg.transitLeg ?
      /* This is a transit leg */
      _react.default.createElement(_transitLegBody.default, {
        leg: leg,
        legIndex: legIndex,
        setActiveLeg: this.props.setActiveLeg,
        customIcons: customIcons
      }) :
      /* This is an access (e.g. walk/bike/etc.) leg */
      _react.default.createElement(_accessLegBody.default, {
        config: config,
        customIcons: customIcons,
        followsTransit: followsTransit,
        leg: leg,
        legIndex: legIndex,
        routingType: this.props.routingType,
        setActiveLeg: this.props.setActiveLeg,
        timeOptions: timeOptions
      }))));
    }
  }]);

  return PlaceRow;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    // Pass config in order to give access to companies definition (used to
    // determine proper place names for rental vehicles).
    config: state.otp.config
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PlaceRow);
/**
 * A component to display vehicle rental data. The word "Vehicle" has been used
 * because a future refactor is intended to combine car rental, bike rental
 * and micromobility rental all within this component. The future refactor is
 * assuming that the leg.rentedCar and leg.rentedBike response elements from OTP
 * will eventually be merged into the leg.rentedVehicle element.
 */


exports.default = _default;

var RentedVehicleLeg =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(RentedVehicleLeg, _PureComponent);

  function RentedVehicleLeg() {
    _classCallCheck(this, RentedVehicleLeg);

    return _possibleConstructorReturn(this, _getPrototypeOf(RentedVehicleLeg).apply(this, arguments));
  }

  _createClass(RentedVehicleLeg, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          config = _this$props2.config,
          leg = _this$props2.leg;
      var configCompanies = config.companies || []; // Sometimes rented vehicles can be walked over things like stairs or other
      // ways that forbid the main mode of travel.

      if (leg.mode === 'WALK') {
        return _react.default.createElement("div", {
          className: "place-subheader"
        }, "Walk vehicle along ", leg.from.name);
      }

      var rentalDescription = 'Pick up';

      if (leg.rentedBike) {
        // TODO: Special case for TriMet may need to be refactored.
        rentalDescription += " shared bike";
      } else {
        // Add company and vehicle labels.
        var vehicleName = ''; // TODO allow more flexibility in customizing these mode strings

        var modeString = leg.rentedVehicle ? 'E-scooter' : leg.rentedBike ? 'bike' : 'car'; // The networks attribute of the from data will only appear at the very
        // beginning of the rental. It is possible that there will be some forced
        // walking that occurs in the middle of the rental, so once the main mode
        // resumes there won't be any network info. In that case we simply return
        // that the rental is continuing.

        if (leg.from.networks) {
          var companiesLabel = (0, _itinerary.getCompaniesLabelFromNetworks)(leg.from.networks, configCompanies);
          rentalDescription += " ".concat(companiesLabel); // Only show vehicle name for car rentals. For bikes and E-scooters, these
          // IDs/names tend to be less relevant (or entirely useless) in this context.

          if (leg.rentedCar && leg.from.name) {
            vehicleName = leg.from.name;
          }

          modeString = (0, _itinerary.getModeForPlace)(leg.from);
        } else {
          rentalDescription = 'Continue using rental';
        }

        rentalDescription += " ".concat(modeString, " ").concat(vehicleName);
      } // e.g., Pick up REACHNOW rented car XYZNDB OR
      //       Pick up SPIN E-scooter
      //       Pick up shared bike


      return _react.default.createElement("div", {
        className: "place-subheader"
      }, rentalDescription);
    }
  }]);

  return RentedVehicleLeg;
}(_react.PureComponent);

module.exports = exports.default;

//# sourceMappingURL=place-row.js