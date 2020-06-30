"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _itinerary = require("../../util/itinerary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ModeButton =
/*#__PURE__*/
function (_Component) {
  _inherits(ModeButton, _Component);

  function ModeButton() {
    _classCallCheck(this, ModeButton);

    return _possibleConstructorReturn(this, _getPrototypeOf(ModeButton).apply(this, arguments));
  }

  _createClass(ModeButton, [{
    key: "_getButtonStyle",
    value: function _getButtonStyle(_ref) {
      var active = _ref.active,
          enabled = _ref.enabled,
          height = _ref.height,
          modeStr = _ref.modeStr;
      var buttonStyle = {
        height: height
      };

      if (modeStr !== 'TRANSIT' && (0, _itinerary.isTransit)(modeStr)) {
        buttonStyle.width = height;
        buttonStyle.border = "2px solid ".concat(enabled ? active ? '#000' : '#bbb' : '#ddd');
        if (active && enabled) buttonStyle.backgroundColor = '#fff';
        buttonStyle.borderRadius = height / 2;
      } else {
        buttonStyle.border = active ? '2px solid #000' : '1px solid #bbb';
        if (active) buttonStyle.backgroundColor = '#add8e6';
      }

      return buttonStyle;
    }
  }, {
    key: "render",
    value: function render() {
      var _this$props = this.props,
          active = _this$props.active,
          enabled = _this$props.enabled,
          icons = _this$props.icons,
          label = _this$props.label,
          mode = _this$props.mode,
          onClick = _this$props.onClick,
          inlineLabel = _this$props.inlineLabel,
          showPlusTransit = _this$props.showPlusTransit;
      var height = this.props.height || 48;
      var iconSize = height - 20;
      var iconColor = enabled ? '#000' : '#ccc';
      var modeStr = mode.company || mode.mode || mode;

      var buttonStyle = this._getButtonStyle({
        active: active,
        enabled: enabled,
        height: height,
        modeStr: modeStr
      });

      return _react.default.createElement("div", {
        className: "mode-button-container ".concat(enabled ? 'enabled' : 'disabled'),
        style: {
          height: height + (inlineLabel ? 8 : 24),
          textAlign: 'center'
        }
      }, _react.default.createElement("button", {
        className: "mode-button",
        onClick: onClick,
        title: label,
        style: buttonStyle,
        disabled: !enabled
      }, showPlusTransit && _react.default.createElement(PlusTransit, {
        enabled: enabled,
        iconColor: iconColor,
        icons: icons,
        iconSize: iconSize
      }), _react.default.createElement("div", {
        className: "mode-icon",
        style: {
          display: 'inline-block',
          fill: iconColor,
          width: iconSize,
          height: iconSize,
          verticalAlign: 'middle'
        }
      }, (0, _itinerary.getIcon)(modeStr, icons)), inlineLabel && _react.default.createElement("span", {
        style: {
          fontSize: iconSize * 0.8,
          marginLeft: 10,
          verticalAlign: 'middle',
          fontWeight: active ? 600 : 300
        }
      }, label)), !inlineLabel && _react.default.createElement("div", {
        className: "mode-label",
        style: {
          color: iconColor,
          fontWeight: active ? 600 : 300
        }
      }, label));
    }
  }]);

  return ModeButton;
}(_react.Component);

exports.default = ModeButton;

_defineProperty(ModeButton, "propTypes", {
  active: _propTypes.default.bool,
  label: _propTypes.default.string,
  mode: _propTypes.default.any,
  // currently a mode object or string
  icons: _propTypes.default.object,
  onClick: _propTypes.default.func
});

var PlusTransit =
/*#__PURE__*/
function (_PureComponent) {
  _inherits(PlusTransit, _PureComponent);

  function PlusTransit() {
    _classCallCheck(this, PlusTransit);

    return _possibleConstructorReturn(this, _getPrototypeOf(PlusTransit).apply(this, arguments));
  }

  _createClass(PlusTransit, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          enabled = _this$props2.enabled,
          iconColor = _this$props2.iconColor,
          icons = _this$props2.icons,
          iconSize = _this$props2.iconSize;
      return _react.default.createElement("span", null, _react.default.createElement("div", {
        style: {
          display: 'inline-block',
          width: iconSize,
          height: iconSize,
          verticalAlign: 'middle'
        }
      }, enabled ? (0, _itinerary.getIcon)('TRANSIT', icons) : _react.default.createElement("div", {
        style: {
          width: iconSize,
          height: iconSize,
          backgroundColor: iconColor,
          borderRadius: iconSize / 2
        }
      })), _react.default.createElement("i", {
        className: "fa fa-plus",
        style: {
          verticalAlign: 'middle',
          color: iconColor,
          margin: '0px 5px',
          fontSize: 14
        }
      }));
    }
  }]);

  return PlusTransit;
}(_react.PureComponent);

module.exports = exports.default;

//# sourceMappingURL=mode-button.js