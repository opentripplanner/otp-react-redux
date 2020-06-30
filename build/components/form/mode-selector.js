"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _form = require("../../actions/form");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ModeSelector =
/*#__PURE__*/
function (_Component) {
  _inherits(ModeSelector, _Component);

  function ModeSelector() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, ModeSelector);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(ModeSelector)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_onChange", function (evt) {
      return _this.props.setQueryParam({
        mode: evt.target.value
      });
    });

    return _this;
  }

  _createClass(ModeSelector, [{
    key: "_getDisplayText",
    value: function _getDisplayText(mode) {
      switch (mode) {
        case 'TRANSIT,WALK':
          return 'Walk to Transit';

        case 'TRANSIT,BICYCLE':
          return 'Bike to Transit';

        case 'WALK':
          return 'Walk Only';

        case 'BICYCLE':
          return 'Bike Only';
      }

      return mode;
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props = this.props,
          config = _this$props.config,
          mode = _this$props.mode,
          label = _this$props.label,
          showLabel = _this$props.showLabel;
      return _react.default.createElement("form", null, _react.default.createElement(_reactBootstrap.FormGroup, {
        className: "mode-selector"
      }, showLabel ? _react.default.createElement(_reactBootstrap.ControlLabel, null, label) : null, _react.default.createElement(_reactBootstrap.FormControl, {
        componentClass: "select",
        value: mode,
        onChange: this._onChange
      }, config.modes.map(function (m, i) {
        return _react.default.createElement("option", {
          key: i,
          value: m
        }, _this2._getDisplayText(m));
      }))));
    }
  }]);

  return ModeSelector;
}(_react.Component);

_defineProperty(ModeSelector, "propTypes", {
  config: _propTypes.default.object,
  label: _propTypes.default.string,
  mode: _propTypes.default.string,
  setQueryParam: _propTypes.default.func,
  showLabel: _propTypes.default.bool
});

_defineProperty(ModeSelector, "defaultProps", {
  label: 'Mode',
  showLabel: true
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    mode: state.otp.currentQuery.mode
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ModeSelector);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=mode-selector.js