"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.object.assign");

var _baseMap = _interopRequireDefault(require("@opentripplanner/base-map"));

var _react = _interopRequireWildcard(require("react"));

var _reactRedux = require("react-redux");

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _api = require("../../actions/api");

var _map = require("../../actions/map");

var _boundsUpdatingOverlay = _interopRequireDefault(require("./bounds-updating-overlay"));

var _connectedEndpointsOverlay = _interopRequireDefault(require("./connected-endpoints-overlay"));

var _connectedParkAndRideOverlay = _interopRequireDefault(require("./connected-park-and-ride-overlay"));

var _connectedRouteViewerOverlay = _interopRequireDefault(require("./connected-route-viewer-overlay"));

var _connectedStopViewerOverlay = _interopRequireDefault(require("./connected-stop-viewer-overlay"));

var _connectedStopsOverlay = _interopRequireDefault(require("./connected-stops-overlay"));

var _connectedTransitiveOverlay = _interopRequireDefault(require("./connected-transitive-overlay"));

var _connectedTripViewerOverlay = _interopRequireDefault(require("./connected-trip-viewer-overlay"));

var _connectedVehicleRentalOverlay = _interopRequireDefault(require("./connected-vehicle-rental-overlay"));

var _elevationPointMarker = _interopRequireDefault(require("./elevation-point-marker"));

var _pointPopup = _interopRequireDefault(require("./point-popup"));

var _tileOverlay = _interopRequireDefault(require("./tile-overlay"));

var _zipcarOverlay = _interopRequireDefault(require("./zipcar-overlay"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _extends() { _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; }; return _extends.apply(this, arguments); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  height: 100%;\n  width: 100%;\n\n  .map {\n    height: 100%;\n    width: 100%;\n  }\n\n  * {\n    box-sizing: unset;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

var MapContainer = _styledComponents.default.div(_templateObject());

var DefaultMap =
/*#__PURE__*/
function (_Component) {
  _inherits(DefaultMap, _Component);

  function DefaultMap() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, DefaultMap);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(DefaultMap)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "onMapClick", function (e) {
      _this.props.setMapPopupLocationAndGeocode(e);
    });

    _defineProperty(_assertThisInitialized(_this), "onPopupClosed", function () {
      _this.props.setMapPopupLocation({
        location: null
      });
    });

    _defineProperty(_assertThisInitialized(_this), "onSetLocationFromPopup", function (payload) {
      var _this$props = _this.props,
          setLocation = _this$props.setLocation,
          setMapPopupLocation = _this$props.setMapPopupLocation;
      setMapPopupLocation({
        location: null
      });
      setLocation(payload);
    });

    return _this;
  }

  _createClass(DefaultMap, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          bikeRentalQuery = _this$props2.bikeRentalQuery,
          bikeRentalStations = _this$props2.bikeRentalStations,
          carRentalQuery = _this$props2.carRentalQuery,
          carRentalStations = _this$props2.carRentalStations,
          mapConfig = _this$props2.mapConfig,
          mapPopupLocation = _this$props2.mapPopupLocation,
          vehicleRentalQuery = _this$props2.vehicleRentalQuery,
          vehicleRentalStations = _this$props2.vehicleRentalStations;
      var center = mapConfig && mapConfig.initLat && mapConfig.initLon ? [mapConfig.initLat, mapConfig.initLon] : null;
      var popup = mapPopupLocation && {
        contents: _react.default.createElement(_pointPopup.default, {
          mapPopupLocation: mapPopupLocation,
          onSetLocationFromPopup: this.onSetLocationFromPopup
        }),
        location: [mapPopupLocation.lat, mapPopupLocation.lon]
      };
      return _react.default.createElement(MapContainer, null, _react.default.createElement(_baseMap.default, {
        baseLayers: mapConfig.baseLayers,
        center: center,
        maxZoom: mapConfig.maxZoom,
        onClick: this.onMapClick,
        popup: popup,
        onPopupClosed: this.onPopupClosed,
        zoom: mapConfig.initZoom || 13
      }, _react.default.createElement(_boundsUpdatingOverlay.default, null), _react.default.createElement(_connectedEndpointsOverlay.default, null), _react.default.createElement(_connectedRouteViewerOverlay.default, null), _react.default.createElement(_connectedStopViewerOverlay.default, null), _react.default.createElement(_connectedTransitiveOverlay.default, null), _react.default.createElement(_connectedTripViewerOverlay.default, null), _react.default.createElement(_elevationPointMarker.default, null), mapConfig.overlays && mapConfig.overlays.map(function (overlayConfig, k) {
        switch (overlayConfig.type) {
          case 'bike-rental':
            return _react.default.createElement(_connectedVehicleRentalOverlay.default, _extends({
              key: k
            }, overlayConfig, {
              refreshVehicles: bikeRentalQuery,
              stations: bikeRentalStations
            }));

          case 'car-rental':
            return _react.default.createElement(_connectedVehicleRentalOverlay.default, _extends({
              key: k
            }, overlayConfig, {
              refreshVehicles: carRentalQuery,
              stations: carRentalStations
            }));

          case 'park-and-ride':
            return _react.default.createElement(_connectedParkAndRideOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'stops':
            return _react.default.createElement(_connectedStopsOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'tile':
            return _react.default.createElement(_tileOverlay.default, _extends({
              key: k
            }, overlayConfig));

          case 'micromobility-rental':
            return _react.default.createElement(_connectedVehicleRentalOverlay.default, _extends({
              key: k
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
      })));
    }
  }]);

  return DefaultMap;
}(_react.Component); // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    bikeRentalStations: state.otp.overlay.bikeRental.stations,
    carRentalStations: state.otp.overlay.carRental.stations,
    mapConfig: state.otp.config.map,
    mapPopupLocation: state.otp.ui.mapPopupLocation,
    vehicleRentalStations: state.otp.overlay.vehicleRental.stations
  };
};

var mapDispatchToProps = {
  bikeRentalQuery: _api.bikeRentalQuery,
  carRentalQuery: _api.carRentalQuery,
  setLocation: _map.setLocation,
  setMapPopupLocation: _map.setMapPopupLocation,
  setMapPopupLocationAndGeocode: _map.setMapPopupLocationAndGeocode,
  vehicleRentalQuery: _api.vehicleRentalQuery
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DefaultMap);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=default-map.js