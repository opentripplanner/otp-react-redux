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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLeaflet = require('react-leaflet');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var OsmBaseLayer = function (_Component) {
  (0, _inherits3.default)(OsmBaseLayer, _Component);

  function OsmBaseLayer() {
    (0, _classCallCheck3.default)(this, OsmBaseLayer);
    return (0, _possibleConstructorReturn3.default)(this, (OsmBaseLayer.__proto__ || (0, _getPrototypeOf2.default)(OsmBaseLayer)).apply(this, arguments));
  }

  (0, _createClass3.default)(OsmBaseLayer, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_reactLeaflet.TileLayer, {
        url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
        attribution: '\xA9 <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
        detectRetina: true
      });
    }
  }]);
  return OsmBaseLayer;
}(_react.Component);

exports.default = OsmBaseLayer;
module.exports = exports['default'];

//# sourceMappingURL=osm-base-layer.js