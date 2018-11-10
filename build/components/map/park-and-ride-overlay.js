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

var _leaflet = require('leaflet');

var _setFromTo = require('./set-from-to');

var _setFromTo2 = _interopRequireDefault(_setFromTo);

var _map = require('../../actions/map');

var _api = require('../../actions/api');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ParkAndRideOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(ParkAndRideOverlay, _MapLayer);

  function ParkAndRideOverlay() {
    (0, _classCallCheck3.default)(this, ParkAndRideOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (ParkAndRideOverlay.__proto__ || (0, _getPrototypeOf2.default)(ParkAndRideOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(ParkAndRideOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var params = {};
      if (this.props.maxTransitDistance) {
        params['maxTransitDistance'] = this.props.maxTransitDistance;
      }
      // TODO: support config-defined bounding envelope

      this.props.parkAndRideQuery(params);
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'createLeafletElement',
    value: function createLeafletElement() {}
  }, {
    key: 'updateLeafletElement',
    value: function updateLeafletElement() {}
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var locations = this.props.locations;

      if (!locations || locations.length === 0) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      var markerIcon = (0, _leaflet.divIcon)({
        iconSize: [20, 20],
        popupAnchor: [0, -10],
        html: '<div style="width: 20px; height: 20px; background: #000; color: #fff; border-radius: 10px; font-weight: bold; font-size: 16px; padding-left: 4px; padding-top: 10px; line-height: 0px;">P</div>',
        className: ''
      });

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        locations.map(function (location, k) {
          var name = location.name.startsWith('P+R ') ? location.name.substring(4) : location.name;
          return _react2.default.createElement(
            _reactLeaflet.Marker,
            {
              icon: markerIcon,
              key: k,
              position: [location.y, location.x]
            },
            _react2.default.createElement(
              _reactLeaflet.Popup,
              null,
              _react2.default.createElement(
                'div',
                { className: 'map-overlay-popup' },
                _react2.default.createElement(
                  'div',
                  { className: 'popup-title' },
                  name
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement(_setFromTo2.default, {
                    map: _this2.context.map,
                    location: {
                      lat: location.y,
                      lon: location.x,
                      name: name
                    },
                    setLocation: _this2.props.setLocation
                  })
                )
              )
            )
          );
        })
      );
    }
  }]);
  return ParkAndRideOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  locations: _react.PropTypes.array,
  zipcarLocationsQuery: _react.PropTypes.func,
  setLocation: _react.PropTypes.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    locations: state.otp.overlay.parkAndRide && state.otp.overlay.parkAndRide.locations
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  parkAndRideQuery: _api.parkAndRideQuery
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ParkAndRideOverlay);
module.exports = exports['default'];

//# sourceMappingURL=park-and-ride-overlay.js