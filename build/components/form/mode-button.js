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

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModeButton = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ModeButton, _Component);

  function ModeButton() {
    (0, _classCallCheck3.default)(this, ModeButton);
    return (0, _possibleConstructorReturn3.default)(this, (ModeButton.__proto__ || (0, _getPrototypeOf2.default)(ModeButton)).apply(this, arguments));
  }

  (0, _createClass3.default)(ModeButton, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          active = _props.active,
          icons = _props.icons,
          label = _props.label,
          mode = _props.mode,
          onClick = _props.onClick;

      var buttonColor = active ? '#000' : '#bbb';
      return _react2.default.createElement(
        'div',
        { className: 'mode-button-container' },
        _react2.default.createElement(
          'button',
          {
            className: 'mode-button',
            onClick: onClick,
            title: label,
            style: { borderColor: buttonColor }
          },
          _react2.default.createElement(
            'div',
            {
              className: 'mode-icon',
              style: { fill: buttonColor } },
            (0, _itinerary.getModeIcon)(mode, icons)
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'mode-label', style: { color: buttonColor } },
          label
        ),
        active && _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            { className: 'mode-check', style: { color: 'white' } },
            _react2.default.createElement('i', { className: 'fa fa-circle' })
          ),
          _react2.default.createElement(
            'div',
            { className: 'mode-check', style: { color: 'green' } },
            _react2.default.createElement('i', { className: 'fa fa-check-circle' })
          )
        )
      );
    }
  }]);
  return ModeButton;
}(_react.Component), _class.propTypes = {
  active: _react.PropTypes.bool,
  label: _react.PropTypes.string,
  mode: _react.PropTypes.any, // currently a mode object or string
  icons: _react.PropTypes.object,
  onClick: _react.PropTypes.func
}, _temp);
exports.default = ModeButton;
module.exports = exports['default'];

//# sourceMappingURL=mode-button.js