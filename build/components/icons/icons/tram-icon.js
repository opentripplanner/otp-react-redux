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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TramIcon = function (_Component) {
  (0, _inherits3.default)(TramIcon, _Component);

  function TramIcon() {
    (0, _classCallCheck3.default)(this, TramIcon);
    return (0, _possibleConstructorReturn3.default)(this, (TramIcon.__proto__ || (0, _getPrototypeOf2.default)(TramIcon)).apply(this, arguments));
  }

  (0, _createClass3.default)(TramIcon, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'svg',
        { version: '1.1', viewBox: '0 0 32 32', height: '100%', width: '100%' },
        _react2.default.createElement('path', { d: 'M9.9,27.2v3.2L8.5,32h1.8l0.8-1.1v-1.8H21v1.8l1,1.1h1.6l-1.4-1.7v-3.1h3.4l0.3-1.6V5.2h-3.2l-0.7-1.9h-5.3V2.6l2.7-1.7V0 h-6.5v1l2.6,1.6v0.7h-5.3L9.4,5.2H6.2l0,20.4l0.3,1.6H9.9z M22.9,8.1l1.8,1.1V16l-1.8,0.6V8.1z M14.7,0.9h2.7L16,1.8L14.7,0.9z M9.9,8.3c0-0.5,0.3-0.8,0.8-0.8h10.4c0.5,0,0.8,0.3,0.8,0.8v7.8c0,0.5-0.3,0.8-0.8,0.8H10.7c-0.5,0-0.8-0.3-0.8-0.8V8.3z M21.9,18.1V20h-3.2v-1.9H21.9z M13.2,18.1v1.8H10v-1.8H13.2z M22.8,21.1v1.6H8.9v-1.6H22.8z M7.2,9.1L9,8v8.6L7.2,16V9.1z' })
      );
    }
  }]);
  return TramIcon;
}(_react.Component);

exports.default = TramIcon;
module.exports = exports['default'];

//# sourceMappingURL=tram-icon.js