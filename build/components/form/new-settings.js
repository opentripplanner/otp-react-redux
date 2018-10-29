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

var _settings = require('./settings-6');

var _settings2 = _interopRequireDefault(_settings);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NewSettings = function (_Component) {
  (0, _inherits3.default)(NewSettings, _Component);

  function NewSettings() {
    (0, _classCallCheck3.default)(this, NewSettings);
    return (0, _possibleConstructorReturn3.default)(this, (NewSettings.__proto__ || (0, _getPrototypeOf2.default)(NewSettings)).apply(this, arguments));
  }

  (0, _createClass3.default)(NewSettings, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(_settings2.default, this.props);
    }
  }]);
  return NewSettings;
}(_react.Component);

exports.default = NewSettings;
module.exports = exports['default'];

//# sourceMappingURL=new-settings.js