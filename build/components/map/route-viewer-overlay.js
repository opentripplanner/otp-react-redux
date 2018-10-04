'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactLeaflet = require('react-leaflet');

var _polyline = require('@mapbox/polyline');

var _polyline2 = _interopRequireDefault(_polyline);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RouteViewerOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(RouteViewerOverlay, _MapLayer);

  function RouteViewerOverlay() {
    (0, _classCallCheck3.default)(this, RouteViewerOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (RouteViewerOverlay.__proto__ || (0, _getPrototypeOf2.default)(RouteViewerOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(RouteViewerOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}

    // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // helper fn to check if geometry has been populated for all patterns in route
      var isGeomComplete = function isGeomComplete(routeData) {
        return routeData && routeData.patterns && (0, _values2.default)(routeData.patterns).reduce(function (acc, ptn) {
          return acc && typeof ptn.geometry !== 'undefined';
        }, true);
      };

      // if pattern geometry just finished populating, update the map points
      if (!isGeomComplete(this.props.routeData) && isGeomComplete(nextProps.routeData)) {
        var allPoints = (0, _values2.default)(nextProps.routeData.patterns).reduce(function (acc, ptn) {
          return acc.concat(_polyline2.default.decode(ptn.geometry.points));
        }, []);
        this.context.map.fitBounds(allPoints);
      }
    }
  }, {
    key: 'createLeafletElement',
    value: function createLeafletElement() {}
  }, {
    key: 'updateLeafletElement',
    value: function updateLeafletElement() {}
  }, {
    key: 'render',
    value: function render() {
      var routeData = this.props.routeData;


      if (!routeData || !routeData.patterns) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      var routeColor = routeData.color ? '#' + routeData.color : '#00bfff';
      var segments = [];
      (0, _values2.default)(routeData.patterns).forEach(function (pattern) {
        if (!pattern.geometry) return;
        var pts = _polyline2.default.decode(pattern.geometry.points);
        segments.push(_react2.default.createElement(_reactLeaflet.Polyline, {
          positions: pts,
          weight: 4,
          color: routeColor,
          opacity: 1,
          key: pattern.id
        }));
      });

      return segments.length > 0 ? _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        _react2.default.createElement(
          'div',
          null,
          segments
        )
      ) : _react2.default.createElement(_reactLeaflet.FeatureGroup, null);
    }
  }]);
  return RouteViewerOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedRoute = state.otp.ui.viewedRoute;
  return {
    viewedRoute: viewedRoute,
    routeData: viewedRoute ? state.otp.transitIndex.routes[viewedRoute.routeId] : null
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(RouteViewerOverlay);
module.exports = exports['default'];

//# sourceMappingURL=route-viewer-overlay.js