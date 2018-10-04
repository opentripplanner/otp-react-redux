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

var RoutesOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(RoutesOverlay, _Component);

  function RoutesOverlay() {
    (0, _classCallCheck3.default)(this, RoutesOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (RoutesOverlay.__proto__ || (0, _getPrototypeOf2.default)(RoutesOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(RoutesOverlay, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'render',
    value: function render() {
      return this.props.tileUrl ? _react2.default.createElement(_reactLeaflet.TileLayer, { url: this.props.tileUrl }) : null;
    }
  }]);
  return RoutesOverlay;
}(_react.Component), _class.propTypes = {
  tileUrl: _react.PropTypes.string
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  // TODO: pass in tileset via config
  return {
    tileUrl: state.otp.config.map && state.otp.config.map.routesOverlay && state.otp.config.map.routesOverlay.tileUrl ? state.otp.config.map.routesOverlay.tileUrl : null
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(RoutesOverlay);
module.exports = exports['default'];

//# sourceMappingURL=routes-overlay.js