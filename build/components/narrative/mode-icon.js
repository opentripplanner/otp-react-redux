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

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModeIcon = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ModeIcon, _Component);

  function ModeIcon() {
    (0, _classCallCheck3.default)(this, ModeIcon);
    return (0, _possibleConstructorReturn3.default)(this, (ModeIcon.__proto__ || (0, _getPrototypeOf2.default)(ModeIcon)).apply(this, arguments));
  }

  (0, _createClass3.default)(ModeIcon, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          mode = _props.mode,
          defaultToText = _props.defaultToText;

      switch (mode) {
        case 'BICYCLE':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'bicycle', type: 'bicycle' })
          );
        case 'BUS':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'bus', type: 'bus' })
          );
        case 'CAR':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'car', type: 'car' })
          );
        case 'TRAM':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'tram', type: 'train' })
          );
        case 'SUBWAY':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'subway', type: 'subway' })
          );
        case 'WALK':
          return _react2.default.createElement(
            'span',
            { className: 'mode-icon' },
            _react2.default.createElement(_icon2.default, { title: 'walk', type: 'male' })
          );
        default:
          return defaultToText ? _react2.default.createElement(
            'span',
            null,
            mode
          ) : null;
      }
    }
  }]);
  return ModeIcon;
}(_react.Component), _class.propTypes = {
  mode: _react.PropTypes.string
}, _temp);
exports.default = ModeIcon;
module.exports = exports['default'];

//# sourceMappingURL=mode-icon.js