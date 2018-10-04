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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLeaflet = require('react-leaflet');

var _reactRedux = require('react-redux');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseLayers = function (_Component) {
  (0, _inherits3.default)(BaseLayers, _Component);

  function BaseLayers() {
    (0, _classCallCheck3.default)(this, BaseLayers);
    return (0, _possibleConstructorReturn3.default)(this, (BaseLayers.__proto__ || (0, _getPrototypeOf2.default)(BaseLayers)).apply(this, arguments));
  }

  (0, _createClass3.default)(BaseLayers, [{
    key: 'render',
    value: function render() {
      var _props$config$map = this.props.config.map,
          baseLayers = _props$config$map.baseLayers,
          overlays = _props$config$map.overlays;
      var BaseLayer = _reactLeaflet.LayersControl.BaseLayer,
          Overlay = _reactLeaflet.LayersControl.Overlay;

      return _react2.default.createElement(
        _reactLeaflet.LayersControl,
        null,
        baseLayers && baseLayers.map(function (l, i) {
          return _react2.default.createElement(
            BaseLayer,
            {
              name: l.name,
              checked: i === 0,
              key: i },
            _react2.default.createElement(_reactLeaflet.TileLayer, {
              url: l.url,
              attribution: l.attribution,
              detectRetina: true })
          );
        }),
        overlays && overlays.map(function (l, i) {
          return _react2.default.createElement(
            Overlay,
            {
              name: l.name,
              key: i },
            _react2.default.createElement(_reactLeaflet.TileLayer, {
              url: l.url,
              attribution: l.attribution,
              detectRetina: true })
          );
        })
      );
    }
  }]);
  return BaseLayers;
}(_react.Component);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(BaseLayers);
module.exports = exports['default'];

//# sourceMappingURL=base-layers.js