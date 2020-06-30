"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/es6.function.name");

var _react = _interopRequireDefault(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactLeaflet = require("react-leaflet");

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

var StopViewerOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(StopViewerOverlay, _MapLayer);

  function StopViewerOverlay() {
    _classCallCheck(this, StopViewerOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(StopViewerOverlay).apply(this, arguments));
  }

  _createClass(StopViewerOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {} // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
    /**
     * Only reset map view if a new stop is selected. This prevents resetting the
     * bounds if, for example, the arrival times have changed for the same stop
     * in the viewer.
     */

  }, {
    key: "componentDidUpdate",
    value: function componentDidUpdate(prevProps) {
      var nextStop = this.props.stopData;
      var oldStopId = prevProps.stopData && prevProps.stopData.id;
      var hasNewStopId = nextStop && nextStop.id !== oldStopId;
      if (hasNewStopId) this.props.leaflet.map.setView([nextStop.lat, nextStop.lon]);
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
      var _this$props = this.props,
          viewedStop = _this$props.viewedStop,
          stopData = _this$props.stopData;
      if (!viewedStop || !stopData) return _react.default.createElement(_reactLeaflet.FeatureGroup, null);
      return _react.default.createElement(_reactLeaflet.FeatureGroup, null, _react.default.createElement(_reactLeaflet.CircleMarker, {
        key: stopData.id,
        center: [stopData.lat, stopData.lon],
        radius: 9,
        fillOpacity: 1,
        fillColor: "cyan",
        color: "#000",
        weight: 3
      }, _react.default.createElement(_reactLeaflet.Popup, null, _react.default.createElement("div", null, stopData.name))));
    }
  }]);

  return StopViewerOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(StopViewerOverlay, "propTypes", {
  stopData: _propTypes.default.object,
  viewedStop: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedStop = state.otp.ui.viewedStop;
  return {
    viewedStop: viewedStop,
    stopData: viewedStop ? state.otp.transitIndex.stops[viewedStop.stopId] : null
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(StopViewerOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=stop-viewer-overlay.js