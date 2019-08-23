"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

require("core-js/modules/web.dom.iterable");

require("core-js/modules/es6.array.iterator");

require("core-js/modules/es6.object.to-string");

require("core-js/modules/es7.object.values");

var _react = _interopRequireDefault(require("react"));

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

// helper fn to check if geometry has been populated for all patterns in route
var isGeomComplete = function isGeomComplete(routeData) {
  return routeData && routeData.patterns && Object.values(routeData.patterns).every(function (ptn) {
    return typeof ptn.geometry !== 'undefined';
  });
};

var RouteViewerOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(RouteViewerOverlay, _MapLayer);

  function RouteViewerOverlay() {
    _classCallCheck(this, RouteViewerOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(RouteViewerOverlay).apply(this, arguments));
  }

  _createClass(RouteViewerOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {} // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: "componentWillUnmount",
    value: function componentWillUnmount() {}
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      // if pattern geometry just finished populating, update the map points
      if (!isGeomComplete(this.props.routeData) && isGeomComplete(nextProps.routeData)) {
        var allPoints = Object.values(nextProps.routeData.patterns).reduce(function (acc, ptn) {
          return acc.concat(_polyline.default.decode(ptn.geometry.points));
        }, []);
        this.props.leaflet.map.fitBounds(allPoints);
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
      var routeData = this.props.routeData;
      if (!routeData || !routeData.patterns) return _react.default.createElement(_reactLeaflet.FeatureGroup, null);
      var routeColor = routeData.color ? "#".concat(routeData.color) : '#00bfff';
      var segments = [];
      Object.values(routeData.patterns).forEach(function (pattern) {
        if (!pattern.geometry) return;

        var pts = _polyline.default.decode(pattern.geometry.points);

        segments.push(_react.default.createElement(_reactLeaflet.Polyline, {
          positions: pts,
          weight: 4,
          color: routeColor,
          opacity: 1,
          key: pattern.id
        }));
      });
      return segments.length > 0 ? _react.default.createElement(_reactLeaflet.FeatureGroup, null, _react.default.createElement("div", null, segments)) : _react.default.createElement(_reactLeaflet.FeatureGroup, null);
    }
  }]);

  return RouteViewerOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(RouteViewerOverlay, "propTypes", {});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedRoute = state.otp.ui.viewedRoute;
  return {
    viewedRoute: viewedRoute,
    routeData: viewedRoute && state.otp.transitIndex.routes ? state.otp.transitIndex.routes[viewedRoute.routeId] : null
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(RouteViewerOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=route-viewer-overlay.js