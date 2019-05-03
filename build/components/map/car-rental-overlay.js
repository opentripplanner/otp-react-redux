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

var _api = require('../../actions/api');

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CarRentalOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(CarRentalOverlay, _Component);

  function CarRentalOverlay() {
    (0, _classCallCheck3.default)(this, CarRentalOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (CarRentalOverlay.__proto__ || (0, _getPrototypeOf2.default)(CarRentalOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(CarRentalOverlay, [{
    key: '_startRefreshing',
    value: function _startRefreshing() {
      var _this2 = this;

      // ititial station retrieval
      this.props.refreshVehicles();

      // set up timer to refresh stations periodically
      this._refreshTimer = setInterval(function () {
        _this2.props.refreshVehicles();
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
    key: 'render',
    value: function render() {
      var _this3 = this;

      var _props = this.props,
          stations = _props.stations,
          companies = _props.companies;


      var filteredStations = stations;
      if (companies) {
        filteredStations = stations.filter(function (station) {
          return station.networks.filter(function (value) {
            return companies.includes(value);
          }).length > 0;
        });
      }

      if (!filteredStations || filteredStations.length === 0) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      // Default icon is gray, styling can be overridden by network-specific classes
      var bulletIconStyle = {
        color: 'gray',
        fontSize: 12,
        width: 10
      };

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        filteredStations.map(function (station) {
          var stationName = station.networks.join('/') + ' ' + (station.name || station.id);

          var className = 'fa fa-map-marker car-rental-icon';
          // If this station is exclusive to a single network, apply the the class for that network
          if (station.networks.length === 1) className += ' car-rental-icon-' + station.networks[0].toLowerCase();
          var markerIcon = (0, _leaflet.divIcon)({
            iconSize: [11, 16],
            popupAnchor: [0, -6],
            html: '<i />',
            className: className
          });

          return _react2.default.createElement(
            _reactLeaflet.Marker,
            {
              icon: markerIcon,
              key: station.id,
              position: [station.y, station.x]
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
                  stationName
                ),
                station.address && _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement('i', { className: 'fa fa-map-marker', style: bulletIconStyle }),
                  ' ',
                  station.address.split(',')[0]
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement(_setFromTo2.default, {
                    map: _this3.context.map,
                    location: {
                      lat: station.y,
                      lon: station.x,
                      name: stationName
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
  return CarRentalOverlay;
}(_react.Component), _class.propTypes = {
  queryMode: _react.PropTypes.string,
  vehicles: _react.PropTypes.array,
  refreshVehicles: _react.PropTypes.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    stations: state.otp.overlay.carRental.stations
  };
};

var mapDispatchToProps = {
  refreshVehicles: _api.carRentalQuery,
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(CarRentalOverlay);
module.exports = exports['default'];

//# sourceMappingURL=car-rental-overlay.js