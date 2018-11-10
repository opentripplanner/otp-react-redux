'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _baseMap = require('./base-map');

var _baseMap2 = _interopRequireDefault(_baseMap);

var _bikeRentalOverlay = require('./bike-rental-overlay');

var _bikeRentalOverlay2 = _interopRequireDefault(_bikeRentalOverlay);

var _carRentalOverlay = require('./car-rental-overlay');

var _carRentalOverlay2 = _interopRequireDefault(_carRentalOverlay);

var _currentPositionMarker = require('./current-position-marker');

var _currentPositionMarker2 = _interopRequireDefault(_currentPositionMarker);

var _endpointsOverlay = require('./endpoints-overlay');

var _endpointsOverlay2 = _interopRequireDefault(_endpointsOverlay);

var _parkAndRideOverlay = require('./park-and-ride-overlay');

var _parkAndRideOverlay2 = _interopRequireDefault(_parkAndRideOverlay);

var _routesOverlay = require('./routes-overlay');

var _routesOverlay2 = _interopRequireDefault(_routesOverlay);

var _stopsOverlay = require('./stops-overlay');

var _stopsOverlay2 = _interopRequireDefault(_stopsOverlay);

var _stopViewerOverlay = require('./stop-viewer-overlay');

var _stopViewerOverlay2 = _interopRequireDefault(_stopViewerOverlay);

var _transitiveOverlay = require('./transitive-overlay');

var _transitiveOverlay2 = _interopRequireDefault(_transitiveOverlay);

var _tripViewerOverlay = require('./trip-viewer-overlay');

var _tripViewerOverlay2 = _interopRequireDefault(_tripViewerOverlay);

var _routeViewerOverlay = require('./route-viewer-overlay');

var _routeViewerOverlay2 = _interopRequireDefault(_routeViewerOverlay);

var _distanceMeasure = require('./distance-measure');

var _distanceMeasure2 = _interopRequireDefault(_distanceMeasure);

var _zipcarOverlay = require('./zipcar-overlay');

var _zipcarOverlay2 = _interopRequireDefault(_zipcarOverlay);

var _ui = require('../../util/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultMap = function (_Component) {
  (0, _inherits3.default)(DefaultMap, _Component);

  function DefaultMap() {
    (0, _classCallCheck3.default)(this, DefaultMap);
    return (0, _possibleConstructorReturn3.default)(this, (DefaultMap.__proto__ || (0, _getPrototypeOf2.default)(DefaultMap)).apply(this, arguments));
  }

  (0, _createClass3.default)(DefaultMap, [{
    key: 'render',
    value: function render() {
      var mapConfig = this.props.mapConfig;

      return _react2.default.createElement(
        _baseMap2.default,
        (0, _extends3.default)({
          toggleLabel: _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-map' }),
            ' Map View'
          )
        }, this.props),
        _react2.default.createElement(_tripViewerOverlay2.default, null),
        _react2.default.createElement(_bikeRentalOverlay2.default, { controlName: 'Bike Stations' }),
        mapConfig.carRentalOverlay && _react2.default.createElement(_carRentalOverlay2.default, { controlName: mapConfig.carRentalOverlay.name }),
        mapConfig.zipcarOverlay && _react2.default.createElement(_zipcarOverlay2.default, { controlName: 'Zipcar Locations' }),
        mapConfig.parkAndRideOverlay && _react2.default.createElement(_parkAndRideOverlay2.default, { controlName: 'Park & Ride Locations' }),
        _react2.default.createElement(_transitiveOverlay2.default, null),
        _react2.default.createElement(_routesOverlay2.default, { controlName: 'Transit Routes' }),
        _react2.default.createElement(_endpointsOverlay2.default, null),
        _react2.default.createElement(_stopsOverlay2.default, { controlName: 'Transit Stops', visible: true }),
        _react2.default.createElement(_stopViewerOverlay2.default, null),
        _react2.default.createElement(_routeViewerOverlay2.default, null),
        (0, _ui.isMobile)() && _react2.default.createElement(_currentPositionMarker2.default, null),
        !(0, _ui.isMobile)() && _react2.default.createElement(_distanceMeasure2.default, null)
      );
    }
  }]);
  return DefaultMap;
}(_react.Component);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    mapConfig: state.otp.config.map
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(DefaultMap);
module.exports = exports['default'];

//# sourceMappingURL=default-map2.js