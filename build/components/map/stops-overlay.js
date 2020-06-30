"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.regexp.split");

require("core-js/modules/es6.function.name");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _leaflet = require("leaflet");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactLeaflet = require("react-leaflet");

var _reactBootstrap = require("react-bootstrap");

var _setFromTo = _interopRequireDefault(require("./set-from-to"));

var _ui = require("../../util/ui");

var _api = require("../../actions/api");

var _map = require("../../actions/map");

var _ui2 = require("../../actions/ui");

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

var StopsOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(StopsOverlay, _MapLayer);

  function StopsOverlay() {
    _classCallCheck(this, StopsOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(StopsOverlay).apply(this, arguments));
  }

  _createClass(StopsOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this = this;

      // set up pan/zoom listener
      this.props.leaflet.map.on('moveend', function () {
        _this._refreshStops();
      });
    } // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "_refreshStops",
    value: function _refreshStops() {
      var _this2 = this;

      if (this.props.leaflet.map.getZoom() < this.props.minZoom) {
        this.forceUpdate();
        return;
      }

      var bounds = this.props.leaflet.map.getBounds();

      if (!bounds.equals(this.lastBounds)) {
        setTimeout(function () {
          _this2.props.refreshStops({
            minLat: bounds.getSouth(),
            maxLat: bounds.getNorth(),
            minLon: bounds.getWest(),
            maxLon: bounds.getEast()
          });

          _this2.lastBounds = bounds;
        }, 300);
      }
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
          leaflet = _this$props.leaflet,
          minZoom = _this$props.minZoom,
          setLocation = _this$props.setLocation,
          setViewedStop = _this$props.setViewedStop,
          setMainPanelContent = _this$props.setMainPanelContent,
          stops = _this$props.stops,
          languageConfig = _this$props.languageConfig;
      var mobileView = (0, _ui.isMobile)(); // Don't render if below zoom threshold or no stops visible

      if (this.props.leaflet.map.getZoom() < minZoom || !stops || stops.length === 0) {
        return _react.default.createElement(_reactLeaflet.FeatureGroup, null);
      } // Helper to create StopMarker from stop


      var createStopMarker = function createStopMarker(stop) {
        return _react.default.createElement(StopMarker, {
          key: stop.id,
          stop: stop,
          leaflet: leaflet,
          mobileView: mobileView,
          setLocation: setLocation,
          setViewedStop: setViewedStop,
          setMainPanelContent: setMainPanelContent,
          languageConfig: languageConfig
        });
      }; // Singleton case; return FeatureGroup with single StopMarker


      if (stops.length === 1) {
        return _react.default.createElement(_reactLeaflet.FeatureGroup, null, createStopMarker(stops[0]));
      } // Otherwise, return FeatureGroup with mapped array of StopMarkers


      return _react.default.createElement(_reactLeaflet.FeatureGroup, null, stops.map(function (stop) {
        return createStopMarker(stop);
      }));
    }
  }]);

  return StopsOverlay;
}(_reactLeaflet.MapLayer);

_defineProperty(StopsOverlay, "propTypes", {
  minZoom: _propTypes.default.number,
  queryMode: _propTypes.default.string,
  stops: _propTypes.default.array,
  refreshStops: _propTypes.default.func
});

_defineProperty(StopsOverlay, "defaultProps", {
  minZoom: 15
});

var StopMarker =
/*#__PURE__*/
function (_Component) {
  _inherits(StopMarker, _Component);

  function StopMarker() {
    var _getPrototypeOf2;

    var _this3;

    _classCallCheck(this, StopMarker);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this3 = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(StopMarker)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this3), "_onClickView", function () {
      _this3.props.setMainPanelContent(null);

      _this3.props.setViewedStop({
        stopId: _this3.props.stop.id
      });
    });

    return _this3;
  }

  _createClass(StopMarker, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          setLocation = _this$props2.setLocation,
          stop = _this$props2.stop,
          languageConfig = _this$props2.languageConfig;
      var id = stop.id,
          name = stop.name,
          lat = stop.lat,
          lon = stop.lon;
      var idArr = id.split(':');
      var radius = 20;
      var half = radius / 2;
      var quarter = radius / 4;
      var html = "<div class=\"stop-overlay-icon\" style=\"height: ".concat(half, "px; width: ").concat(half, "px; margin-left: ").concat(quarter, "px; margin-top: ").concat(quarter, "px;\" />");
      var icon = (0, _leaflet.divIcon)({
        html: html,
        className: 'stop-overlay-bg',
        iconSize: radius
      });
      return _react.default.createElement(_reactLeaflet.Marker, {
        position: [lat, lon],
        icon: icon
      }, _react.default.createElement(_reactLeaflet.Popup, null, _react.default.createElement("div", {
        className: "map-overlay-popup"
      }, _react.default.createElement("div", {
        className: "popup-title"
      }, name), _react.default.createElement("div", {
        className: "popup-row"
      }, _react.default.createElement("b", null, "Agency:"), " ", idArr[0]), _react.default.createElement("div", {
        className: "popup-row"
      }, _react.default.createElement("span", null, _react.default.createElement("b", null, "Stop ID:"), " ", idArr[1]), _react.default.createElement(_reactBootstrap.Button, {
        className: "view-stop-button",
        bsSize: "xsmall",
        onClick: this._onClickView
      }, languageConfig.stopViewer || 'Stop Viewer')), _react.default.createElement("div", {
        className: "popup-row"
      }, _react.default.createElement(_setFromTo.default, {
        map: this.props.leaflet.map,
        location: {
          lat: lat,
          lon: lon,
          name: name
        },
        setLocation: setLocation
      })))));
    }
  }]);

  return StopMarker;
}(_react.Component); // connect to the redux store


_defineProperty(StopMarker, "propTypes", {
  mobileView: _propTypes.default.bool,
  setLocation: _propTypes.default.func,
  setViewedStop: _propTypes.default.func,
  setMainPanelContent: _propTypes.default.func,
  stop: _propTypes.default.object
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    stops: state.otp.overlay.transit.stops,
    queryMode: state.otp.currentQuery.mode,
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  refreshStops: _api.findStopsWithinBBox,
  clearStops: _api.clearStops,
  setLocation: _map.setLocation,
  setViewedStop: _ui2.setViewedStop,
  setMainPanelContent: _ui2.setMainPanelContent
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(StopsOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=stops-overlay.js