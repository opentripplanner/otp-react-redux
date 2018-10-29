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
          enabled = _props.enabled,
          icons = _props.icons,
          label = _props.label,
          mode = _props.mode,
          onClick = _props.onClick,
          inlineLabel = _props.inlineLabel,
          showPlusTransit = _props.showPlusTransit;

      var height = this.props.height || 48;
      var iconSize = height - 20;

      var iconColor = enabled ? '#000' : '#ccc';
      var modeStr = mode.mode || mode;
      var buttonStyle = { height: height };

      if (modeStr !== 'TRANSIT' && (0, _itinerary.isTransit)(modeStr)) {
        buttonStyle.width = height;
        buttonStyle.border = '2px solid ' + (enabled ? active ? '#000' : '#bbb' : '#ddd');
        if (active && enabled) buttonStyle.backgroundColor = '#fff';
        buttonStyle.borderRadius = height / 2;
      } else {
        buttonStyle.border = active ? '2px solid #000' : '1px solid #bbb';
        if (active) buttonStyle.backgroundColor = '#add8e6';
      }

      return _react2.default.createElement(
        'div',
        { className: 'mode-button-container ' + (enabled ? 'enabled' : 'disabled'), style: { height: height + (inlineLabel ? 8 : 24), textAlign: 'center' } },
        _react2.default.createElement(
          'button',
          {
            className: 'mode-button',
            onClick: onClick,
            title: label,
            style: buttonStyle,
            disabled: !enabled
          },
          _react2.default.createElement(
            'div',
            {
              className: 'mode-icon',
              style: { display: 'inline-block', fill: iconColor, width: iconSize, height: iconSize, verticalAlign: 'middle' } },
            (0, _itinerary.getModeIcon)(mode, icons)
          ),
          showPlusTransit && _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement('i', { className: 'fa fa-plus', style: { verticalAlign: 'middle', color: iconColor, margin: '0px 5px', fontSize: 14 } }),
            _react2.default.createElement(
              'div',
              { style: { display: 'inline-block', width: iconSize, height: iconSize, verticalAlign: 'middle' } },
              enabled ? (0, _itinerary.getModeIcon)('TRANSIT', icons) : _react2.default.createElement('div', { style: { width: iconSize, height: iconSize, backgroundColor: iconColor, borderRadius: iconSize / 2 } })
            )
          ),
          inlineLabel && _react2.default.createElement(
            'span',
            { style: { fontSize: iconSize * 0.8, marginLeft: 10, verticalAlign: 'middle', fontWeight: active ? 600 : 300 } },
            label
          )
        ),
        !inlineLabel && _react2.default.createElement(
          'div',
          { className: 'mode-label', style: { color: iconColor, fontWeight: active ? 600 : 300 } },
          label
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