"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _api = require("../../actions/api");

var _baseMap = _interopRequireDefault(require("./base-map"));

var _endpointsOverlay = _interopRequireDefault(require("./endpoints-overlay"));

var _parkAndRideOverlay = _interopRequireDefault(require("./park-and-ride-overlay"));

var _stopsOverlay = _interopRequireDefault(require("./stops-overlay"));

var _stopViewerOverlay = _interopRequireDefault(require("./stop-viewer-overlay"));

var _tileOverlay = _interopRequireDefault(require("./tile-overlay"));

var _transitiveOverlay = _interopRequireDefault(require("./transitive-overlay"));

var _tripViewerOverlay = _interopRequireDefault(require("./trip-viewer-overlay"));

var _routeViewerOverlay = _interopRequireDefault(require("./route-viewer-overlay"));

var _vehicleRentalOverlay = _interopRequireDefault(require("./vehicle-rental-overlay"));

var _zipcarOverlay = _interopRequireDefault(require("./zipcar-overlay"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

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

var DefaultMap =
/*#__PURE__*/
function (_Component) {
  _inherits(DefaultMap, _Component);

  function DefaultMap() {
    _classCallCheck(this, DefaultMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(DefaultMap).apply(this, arguments));
  }

  _createClass(DefaultMap, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          bikeRentalQuery = _this$props.bikeRentalQuery,
          bikeRentalStations = _this$props.bikeRentalStations,
          carRentalQuery = _this$props.carRentalQuery,
          carRentalStations = _this$props.carRentalStations,
          mapConfig = _this$props.mapConfig,
          vehicleRentalQuery = _this$props.vehicleRentalQuery,
          vehicleRentalStations = _this$props.vehicleRentalStations;
      return _react.default.createElement(_baseMap.default, _extends({
        toggleLabel: _react.default.createElement("span", null, _react.default.createElement("i", {
          className: "fa fa-map"
        }), " Map View")
      }, this.props), _react.default.createElement(_tripViewerOverlay.default, null), _react.default.createElement(_stopViewerOverlay.default, null), _react.default.createElement(_routeViewerOverlay.default, null), _react.default.createElement(_transitiveOverlay.default, null), _react.default.createElement(_endpointsOverlay.default, null), mapConfig.overlays && mapConfig.overlays.map(function (overlayConfig, k) {
        switch (overlayConfig.type) {
          case 'bike-rental':
            return _react.default.createElement(_vehicleRentalOverlay.default, _extends({
              key: k
            }, overlayConfig, {
              refreshVehicles: bikeRentalQuery,
              stations: bikeRentalStations
            }));

          case 'car-rental':
            return _react.default.createElement(_vehicleRentalOverlay.default, _extends({
              key: k,
              baseIconClass: "car-rental-icon"
            }, overlayConfig, {
              refreshVehicles: carRentalQuery,
              stations: carRentalStations
            }));

          case 'park-and-ride':
            return _react.default.createElement(_parkAndRideOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'stops':
            return _react.default.createElement(_stopsOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'tile':
            return _react.default.createElement(_tileOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'micromobility-rental':
            return _react.default.createElement(_vehicleRentalOverlay.default, _extends({
              key: k,
              baseIconClass: "micromobility-rental-icon"
            }, overlayConfig, {
              refreshVehicles: vehicleRentalQuery,
              stations: vehicleRentalStations
            }));

          case 'zipcar':
            return _react.default.createElement(_zipcarOverlay.default, _extends({
              key: k
            }, overlayConfig));

          default:
            return null;
        }
      }));
    }
  }]);

  return DefaultMap;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    bikeRentalStations: state.otp.overlay.bikeRental.stations,
    carRentalStations: state.otp.overlay.carRental.stations,
    mapConfig: state.otp.config.map,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  };
};

var mapDispatchToProps = {
  bikeRentalQuery: _api.bikeRentalQuery,
  carRentalQuery: _api.carRentalQuery,
  vehicleRentalQuery: _api.vehicleRentalQuery
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DefaultMap);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=default-map.js