'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TileOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(TileOverlay, _Component);

  function TileOverlay() {
    (0, _classCallCheck3.default)(this, TileOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (TileOverlay.__proto__ || (0, _getPrototypeOf2.default)(TileOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(TileOverlay, [{
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {}
  }, {
    key: 'render',
    value: function render() {
      return this.props.tileUrl ? _react2.default.createElement(_reactLeaflet.TileLayer, { url: this.props.tileUrl }) : null;
    }
  }]);
  return TileOverlay;
}(_react.Component), _class.propTypes = {
  tileUrl: _react.PropTypes.string
}, _temp);
exports.default = TileOverlay;
module.exports = exports['default'];

//# sourceMappingURL=tile-overlay.js