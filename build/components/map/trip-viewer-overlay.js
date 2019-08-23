"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactLeaflet = require("react-leaflet");

var _polyline = _interopRequireDefault(require("@mapbox/polyline"));

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

var TripViewerOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(TripViewerOverlay, _MapLayer);

  function TripViewerOverlay() {
    _classCallCheck(this, TripViewerOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(TripViewerOverlay).apply(this, arguments));
  }

  _createClass(TripViewerOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {} // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      var oldGeometry = this.props.tripData && this.props.tripData.geometry;
      var newGeometry = nextProps.tripData && nextProps.tripData.geometry;
      if (oldGeometry === newGeometry || !newGeometry) return;

      var pts = _polyline.default.decode(newGeometry.points);

      this.props.leaflet.map.fitBounds(pts);
    }
  }, {
    key: "createLeafletElement",
    value: function createLeafletElement() {}
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement() {}
  }, {
    key: "render",
    value: function render() {
      var tripData = this.props.tripData;
      if (!tripData || !tripData.geometry) return _react.default.createElement(_reactLeaflet.FeatureGroup, null);

      var pts = _polyline.default.decode(tripData.geometry.points);

      return _react.default.createElement(_reactLeaflet.FeatureGroup, null, _react.default.createElement(_reactLeaflet.Polyline, {
        positions: pts,
        weight: 8,
        color: "#00bfff",
        opacity: 0.6
      }));
    }
  }]);

  return TripViewerOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(TripViewerOverlay, "propTypes", {
  tripData: _propTypes.default.object,
  viewedTrip: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedTrip = state.otp.ui.viewedTrip;
  return {
    viewedTrip: viewedTrip,
    tripData: viewedTrip ? state.otp.transitIndex.trips[viewedTrip.tripId] : null
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(TripViewerOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=trip-viewer-overlay.js