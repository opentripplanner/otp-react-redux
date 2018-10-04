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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var StopViewerOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(StopViewerOverlay, _MapLayer);

  function StopViewerOverlay() {
    (0, _classCallCheck3.default)(this, StopViewerOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (StopViewerOverlay.__proto__ || (0, _getPrototypeOf2.default)(StopViewerOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(StopViewerOverlay, [{
    key: 'componentDidMount',
    value: function componentDidMount() {}

    // TODO: determine why the default MapLayer componentWillUnmount() method throws an error

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      if (this.props.stopData === nextProps.stopData || !nextProps.stopData) return;
      this.context.map.setView([nextProps.stopData.lat, nextProps.stopData.lon]);
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
          viewedStop = _props.viewedStop,
          stopData = _props.stopData;


      if (!viewedStop || !stopData) return _react2.default.createElement(_reactLeaflet.FeatureGroup, null);

      return _react2.default.createElement(
        _reactLeaflet.FeatureGroup,
        null,
        _react2.default.createElement(
          _reactLeaflet.CircleMarker,
          {
            key: stopData.id,
            center: [stopData.lat, stopData.lon],
            radius: 9,
            fillOpacity: 1,
            fillColor: 'cyan',
            color: '#000',
            weight: 3
          },
          _react2.default.createElement(
            _reactLeaflet.Popup,
            null,
            _react2.default.createElement(
              'div',
              null,
              stopData.name
            )
          )
        )
      );
    }
  }]);
  return StopViewerOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  stopData: _react.PropTypes.object,
  viewedStop: _react.PropTypes.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedStop = state.otp.ui.viewedStop;
  return {
    viewedStop: viewedStop,
    stopData: viewedStop ? state.otp.transitIndex.stops[viewedStop.stopId] : null
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StopViewerOverlay);
module.exports = exports['default'];

//# sourceMappingURL=stop-viewer-overlay.js