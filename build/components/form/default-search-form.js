"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _connectedLocationField = _interopRequireDefault(require("./connected-location-field"));

var _tabbedFormPanel = _interopRequireDefault(require("./tabbed-form-panel"));

var _switchButton = _interopRequireDefault(require("./switch-button"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var DefaultSearchForm =
/*#__PURE__*/
function (_Component) {
  _inherits(DefaultSearchForm, _Component);

  function DefaultSearchForm() {
    var _this;

    _classCallCheck(this, DefaultSearchForm);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DefaultSearchForm).call(this));
    _this.state = {
      desktopDateTimeExpanded: false,
      desktopSettingsExpanded: false
    };
    return _this;
  }

  _createClass(DefaultSearchForm, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          mobile = _this$props.mobile,
          ModeIcon = _this$props.ModeIcon;
      var actionText = mobile ? 'tap' : 'click';
      return _react.default.createElement("div", null, _react.default.createElement("div", {
        className: "locations"
      }, _react.default.createElement(_connectedLocationField.default, {
        inputPlaceholder: "Enter start location or ".concat(actionText, " on map..."),
        locationType: "from",
        showClearButton: true
      }), _react.default.createElement(_connectedLocationField.default, {
        inputPlaceholder: "Enter destination or ".concat(actionText, " on map..."),
        locationType: "to",
        showClearButton: !mobile
      }), _react.default.createElement("div", {
        className: "switch-button-container"
      }, _react.default.createElement(_switchButton.default, {
        content: _react.default.createElement("i", {
          className: "fa fa-exchange fa-rotate-90"
        })
      }))), _react.default.createElement(_tabbedFormPanel.default, {
        ModeIcon: ModeIcon
      }));
    }
  }]);

  return DefaultSearchForm;
}(_react.Component);

exports.default = DefaultSearchForm;

_defineProperty(DefaultSearchForm, "propTypes", {
  mobile: _propTypes.default.bool,
  ModeIcon: _propTypes.default.elementType.isRequired
});

_defineProperty(DefaultSearchForm, "defaultProps", {
  showFrom: true,
  showTo: true
});

module.exports = exports.default;

//# sourceMappingURL=default-search-form.js