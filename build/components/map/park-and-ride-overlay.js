"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

require("core-js/modules/es6.string.starts-with");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactLeaflet = require("react-leaflet");

var _leaflet = require("leaflet");

var _setFromTo = _interopRequireDefault(require("./set-from-to"));

var _map = require("../../actions/map");

var _api = require("../../actions/api");

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ParkAndRideOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(ParkAndRideOverlay, _MapLayer);

  function ParkAndRideOverlay() {
    _classCallCheck(this, ParkAndRideOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(ParkAndRideOverlay).apply(this, arguments));
  }

  _createClass(ParkAndRideOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var params = {};

      if (this.props.maxTransitDistance) {
        params['maxTransitDistance'] = this.props.maxTransitDistance;
      } // TODO: support config-defined bounding envelope


      this.props.parkAndRideQuery(params);
    }
  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "createLeafletElement",
    value: function createLeafletElement() {}
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement() {}
  }, {
    key: "render",
    value: function render() {
      var _this = this;

      var locations = this.props.locations;
      if (!locations || locations.length === 0) return _react.default.createElement(_reactLeaflet.FeatureGroup, null);
      var markerIcon = (0, _leaflet.divIcon)({
        iconSize: [20, 20],
        popupAnchor: [0, -10],
        html: '<div style="width: 20px; height: 20px; background: #000; color: #fff; border-radius: 10px; font-weight: bold; font-size: 16px; padding-left: 4px; padding-top: 10px; line-height: 0px;">P</div>',
        className: ''
      });
      return _react.default.createElement(_reactLeaflet.FeatureGroup, null, locations.map(function (location, k) {
        var name = location.name.startsWith('P+R ') ? location.name.substring(4) : location.name;
        return _react.default.createElement(_reactLeaflet.Marker, {
          icon: markerIcon,
          key: k,
          position: [location.y, location.x]
        }, _react.default.createElement(_reactLeaflet.Popup, null, _react.default.createElement("div", {
          className: "map-overlay-popup"
        }, _react.default.createElement("div", {
          className: "popup-title"
        }, name), _react.default.createElement("div", {
          className: "popup-row"
        }, _react.default.createElement(_setFromTo.default, {
          map: _this.props.leaflet.map,
          location: {
            lat: location.y,
            lon: location.x,
            name: name
          },
          setLocation: _this.props.setLocation
        })))));
      }));
    }
  }]);

  return ParkAndRideOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(ParkAndRideOverlay, "propTypes", {
  locations: _propTypes.default.array,
  zipcarLocationsQuery: _propTypes.default.func,
  setLocation: _propTypes.default.func
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    locations: state.otp.overlay.parkAndRide && state.otp.overlay.parkAndRide.locations
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  parkAndRideQuery: _api.parkAndRideQuery
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(ParkAndRideOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=park-and-ride-overlay.js