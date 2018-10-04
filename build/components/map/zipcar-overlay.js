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

var _zipcar = require('../../actions/zipcar');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var zipcarIcon = '<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120.09 120.1"><defs><style>.cls-1{fill:#59ad46;}.cls-2{fill:#fff;}.cls-3{fill:#5c5d5f;}</style></defs><title>zipcar-icon</title><path class="cls-1" d="M246.37,396.78a60,60,0,1,1,60,60,60.05,60.05,0,0,1-60-60" transform="translate(-246.37 -336.74)"/><path class="cls-2" d="M363.6,418.66q0.47-1.28.9-2.58H314.16l2.46-3.15h34.87a1.27,1.27,0,1,0,0-2.53H318.6l2.42-3.09h17.74a1.31,1.31,0,0,0,0-2.58H291.69l28.85-37.59H273.06v10.27h25.28l-26.48,34.34-5.45,6.9h21a12,12,0,0,1,22.29,0H363.6" transform="translate(-246.37 -336.74)"/><path class="cls-3" d="M307.84,423.3a9.27,9.27,0,1,1-9.27-9.27,9.27,9.27,0,0,1,9.27,9.27" transform="translate(-246.37 -336.74)"/></svg>';

var ZipcarOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(ZipcarOverlay, _MapLayer);

  function ZipcarOverlay() {
    (0, _classCallCheck3.default)(this, ZipcarOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (ZipcarOverlay.__proto__ || (0, _getPrototypeOf2.default)(ZipcarOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(ZipcarOverlay, [{
    key: '_startRefreshing',
    value: function _startRefreshing() {
      var _this2 = this;

      // ititial station retrieval
      this.props.zipcarLocationsQuery();

      // set up timer to refresh stations periodically
      this._refreshTimer = setInterval(function () {
        _this2.props.zipcarLocationsQuery();
      }, 30000); // defaults to every 30 sec. TODO: make this configurable?*/
    }
  }, {
    key: '_stopRefreshing',
    value: function _stopRefreshing() {
      if (this._refreshTimer) clearInterval(this._refreshTimer);
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      if (this.props.visible) this._startRefreshing();
    }
  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      this._stopRefreshing();
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (!this.props.visible && nextProps.visible) {
        this._startRefreshing();
      } else if (this.props.visible && !nextProps.visible) {
        this._stopRefreshing();
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
      var _this3 = this;

      var locations = this.props.locations;

      if (!locations || locations.length === 0) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      var markerIcon = (0, _leaflet.divIcon)({
        iconSize: [24, 24],
        popupAnchor: [0, -12],
        html: zipcarIcon,
        className: ''
      });

      var bulletIconStyle = {
        color: 'gray',
        fontSize: 12,
        width: 15
      };

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        locations.map(function (location) {
          return _react2.default.createElement(
            _reactLeaflet.Marker,
            {
              icon: markerIcon,
              key: location.location_id,
              position: [location.coordinates.lat, location.coordinates.lng]
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
                  'Zipcar Location'
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement('i', { className: 'fa fa-map-marker', style: bulletIconStyle }),
                  ' ',
                  location.display_name
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement('i', { className: 'fa fa-car', style: bulletIconStyle }),
                  ' ',
                  location.num_vehicles,
                  ' Vehicles'
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement(_setFromTo2.default, {
                    map: _this3.context.map,
                    location: {
                      lat: location.coordinates.lat,
                      lon: location.coordinates.lng,
                      name: location.display_name
                    },
                    setLocation: _this3.props.setLocation
                  })
                )
              )
            )
          );
        })
      );
    }
  }]);
  return ZipcarOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  locations: _react.PropTypes.array,
  zipcarLocationsQuery: _react.PropTypes.func,
  setLocation: _react.PropTypes.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    locations: state.otp.overlay.zipcar && state.otp.overlay.zipcar.locations
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  zipcarLocationsQuery: _zipcar.zipcarLocationsQuery
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ZipcarOverlay);
module.exports = exports['default'];

//# sourceMappingURL=zipcar-overlay.js