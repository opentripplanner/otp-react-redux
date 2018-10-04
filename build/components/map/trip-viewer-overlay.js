'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var TripViewerOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(TripViewerOverlay, _MapLayer);

  function TripViewerOverlay() {
    (0, _classCallCheck3.default)(this, TripViewerOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (TripViewerOverlay.__proto__ || (0, _getPrototypeOf2.default)(TripViewerOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(TripViewerOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}

    // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var oldGeometry = this.props.tripData && this.props.tripData.geometry;
      var newGeometry = nextProps.tripData && nextProps.tripData.geometry;
      if (oldGeometry === newGeometry || !newGeometry) return;
      var pts = _polyline2.default.decode(newGeometry.points);
      this.context.map.fitBounds(pts);
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
      var tripData = this.props.tripData;


      if (!tripData || !tripData.geometry) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      var pts = _polyline2.default.decode(tripData.geometry.points);
      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        _react2.default.createElement(_reactLeaflet.Polyline, { positions: pts, weight: 8, color: '#00bfff', opacity: 0.6 })
      );
    }
  }]);
  return TripViewerOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  tripData: _react.PropTypes.object,
  viewedTrip: _react.PropTypes.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedTrip = state.otp.ui.viewedTrip;
  return {
    viewedTrip: viewedTrip,
    tripData: viewedTrip ? state.otp.transitIndex.trips[viewedTrip.tripId] : null
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TripViewerOverlay);
module.exports = exports['default'];

//# sourceMappingURL=trip-viewer-overlay.js