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

var _class, _temp, _class2, _temp3;

var _leaflet = require('leaflet');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactLeaflet = require('react-leaflet');

var _reactBootstrap = require('react-bootstrap');

var _setFromTo = require('./set-from-to');

var _setFromTo2 = _interopRequireDefault(_setFromTo);

var _itinerary = require('../../util/itinerary');

var _ui = require('../../util/ui');

var _api = require('../../actions/api');

var _map = require('../../actions/map');

var _ui2 = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StopsOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(StopsOverlay, _MapLayer);

  function StopsOverlay() {
    (0, _classCallCheck3.default)(this, StopsOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (StopsOverlay.__proto__ || (0, _getPrototypeOf2.default)(StopsOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(StopsOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      // set up pan/zoom listener
      this.context.map.on('moveend', function () {
        _this2._refreshStops();
      });
    }

    // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: '_refreshStops',
    value: function _refreshStops() {
      var _this3 = this;

      if (this.context.map.getZoom() < this.props.minZoom) {
        this.forceUpdate();
        return;
      }

      var bounds = this.context.map.getBounds();
      if (!bounds.equals(this.lastBounds)) {
        setTimeout(function () {
          _this3.props.refreshStops({
            minLat: bounds.getSouth(),
            maxLat: bounds.getNorth(),
            minLon: bounds.getWest(),
            maxLon: bounds.getEast()
          });
          _this3.lastBounds = bounds;
        }, 300);
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
      var _props = this.props,
          minZoom = _props.minZoom,
          queryMode = _props.queryMode,
          setLocation = _props.setLocation,
          setViewedStop = _props.setViewedStop,
          setMainPanelContent = _props.setMainPanelContent,
          stops = _props.stops,
          languageConfig = _props.languageConfig;

      var mobileView = (0, _ui.isMobile)();
      // don't render if below zoom threshold or transit not currently selected
      if (this.context.map.getZoom() < minZoom || !(0, _itinerary.hasTransit)(queryMode) || !stops || stops.length === 0) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        stops.map(function (stop) {
          return _react2.default.createElement(StopMarker, {
            key: stop.id,
            stop: stop,
            mobileView: mobileView,
            setLocation: setLocation,
            setViewedStop: setViewedStop,
            setMainPanelContent: setMainPanelContent,
            languageConfig: languageConfig
          });
        })
      );
    }
  }]);
  return StopsOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  minZoom: _react.PropTypes.number,
  queryMode: _react.PropTypes.string,
  stops: _react.PropTypes.array,
  refreshStops: _react.PropTypes.func
}, _class.defaultProps = {
  minZoom: 15
}, _temp);
var StopMarker = (_temp3 = _class2 = function (_Component) {
  (0, _inherits3.default)(StopMarker, _Component);

  function StopMarker() {
    var _ref;

    var _temp2, _this4, _ret;

    (0, _classCallCheck3.default)(this, StopMarker);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp2 = (_this4 = (0, _possibleConstructorReturn3.default)(this, (_ref = StopMarker.__proto__ || (0, _getPrototypeOf2.default)(StopMarker)).call.apply(_ref, [this].concat(args))), _this4), _this4._onClickView = function () {
      _this4.props.setMainPanelContent(null);
      _this4.props.setViewedStop({ stopId: _this4.props.stop.id });
    }, _temp2), (0, _possibleConstructorReturn3.default)(_this4, _ret);
  }

  (0, _createClass3.default)(StopMarker, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          setLocation = _props2.setLocation,
          stop = _props2.stop,
          languageConfig = _props2.languageConfig;
      var id = stop.id,
          name = stop.name,
          lat = stop.lat,
          lon = stop.lon;

      var idArr = id.split(':');
      var radius = 20;
      var half = radius / 2;
      var quarter = radius / 4;
      var html = '<div class="stop-overlay-icon" style="height: ' + half + 'px; width: ' + half + 'px; margin-left: ' + quarter + 'px; margin-top: ' + quarter + 'px;" />';
      var icon = (0, _leaflet.divIcon)({
        html: html,
        className: 'stop-overlay-bg',
        iconSize: radius
      });

      return _react2.default.createElement(
        _reactLeaflet.Marker,
        {
          position: [lat, lon],
          icon: icon
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
              _react2.default.createElement(
                'b',
                null,
                'Agency:'
              ),
              ' ',
              idArr[0]
            ),
            _react2.default.createElement(
              'div',
              { className: 'popup-row' },
              _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                  'b',
                  null,
                  'Stop ID:'
                ),
                ' ',
                idArr[1]
              ),
              _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  className: 'view-stop-button',
                  bsSize: 'xsmall',
                  onClick: this._onClickView
                },
                languageConfig.stopViewer || 'Stop Viewer'
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'popup-row' },
              _react2.default.createElement(_setFromTo2.default, {
                map: this.context.map,
                location: { lat: lat, lon: lon, name: name },
                setLocation: setLocation
              })
            )
          )
        )
      );
    }
  }]);
  return StopMarker;
}(_react.Component), _class2.propTypes = {
  mobileView: _react.PropTypes.bool,
  setLocation: _react.PropTypes.func,
  setViewedStop: _react.PropTypes.func,
  setMainPanelContent: _react.PropTypes.func,
  stop: _react.PropTypes.object
}, _temp3);

// connect to the redux store

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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StopsOverlay);
module.exports = exports['default'];

//# sourceMappingURL=stops-overlay.js