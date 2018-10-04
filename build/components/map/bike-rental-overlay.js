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

var _api = require('../../actions/api');

var _setFromTo = require('./set-from-to');

var _setFromTo2 = _interopRequireDefault(_setFromTo);

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BikeRentalOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(BikeRentalOverlay, _Component);

  function BikeRentalOverlay() {
    (0, _classCallCheck3.default)(this, BikeRentalOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (BikeRentalOverlay.__proto__ || (0, _getPrototypeOf2.default)(BikeRentalOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(BikeRentalOverlay, [{
    key: '_startRefreshing',
    value: function _startRefreshing() {
      var _this2 = this;

      // ititial station retrieval
      this.props.refreshStations();

      // set up timer to refresh stations periodically
      this._refreshTimer = setInterval(function () {
        _this2.props.refreshStations();
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

      var stations = this.props.stations;


      if (!stations || stations.length === 0) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        stations.map(function (station) {
          var icon = void 0;
          if (station.isFloatingBike) {
            icon = (0, _leaflet.divIcon)({
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -12],
              html: '<div class="bike-rental-hub-icon bike-rental-out-of-hub"></div>',
              className: ''
            });
          } else {
            var pctFull = station.bikesAvailable / (station.bikesAvailable + station.spacesAvailable);
            var i = Math.round(pctFull * 9);
            icon = (0, _leaflet.divIcon)({
              iconSize: [24, 24],
              iconAnchor: [12, 24],
              popupAnchor: [0, -12],
              html: '<div class="bike-rental-hub-icon bike-rental-hub-icon-' + i + '"></div>',
              className: ''
            });
          }
          return _react2.default.createElement(
            _reactLeaflet.Marker,
            {
              icon: icon,
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
                  station.isFloatingBike ? _react2.default.createElement(
                    'span',
                    null,
                    'Floating bike: ',
                    station.name
                  ) : _react2.default.createElement(
                    'span',
                    null,
                    station.name
                  )
                ),
                !station.isFloatingBike && _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement(
                    'div',
                    null,
                    'Available bikes: ',
                    station.bikesAvailable
                  ),
                  _react2.default.createElement(
                    'div',
                    null,
                    'Available docks: ',
                    station.spacesAvailable
                  )
                ),
                _react2.default.createElement(
                  'div',
                  { className: 'popup-row' },
                  _react2.default.createElement(_setFromTo2.default, {
                    map: _this3.context.map,
                    location: {
                      lat: station.y,
                      lon: station.x,
                      name: station.name
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
  return BikeRentalOverlay;
}(_react.Component), _class.propTypes = {
  queryMode: _react.PropTypes.string,
  stations: _react.PropTypes.array,
  refreshStations: _react.PropTypes.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    stations: state.otp.overlay.bikeRental.stations
  };
};

var mapDispatchToProps = {
  refreshStations: _api.bikeRentalQuery,
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BikeRentalOverlay);
module.exports = exports['default'];

//# sourceMappingURL=bike-rental-overlay.js