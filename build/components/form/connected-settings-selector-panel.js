"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _form = require("../../actions/form");

var _state = require("../../util/state");

var _styled = require("./styled");

var _userTripSettings = _interopRequireDefault(require("./user-trip-settings"));

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

// TODO: Button title should be bold when button is selected.
var ConnectedSettingsSelectorPanel =
/*#__PURE__*/
function (_Component) {
  _inherits(ConnectedSettingsSelectorPanel, _Component);

  function ConnectedSettingsSelectorPanel() {
    _classCallCheck(this, ConnectedSettingsSelectorPanel);

    return _possibleConstructorReturn(this, _getPrototypeOf(ConnectedSettingsSelectorPanel).apply(this, arguments));
  }

  _createClass(ConnectedSettingsSelectorPanel, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          config = _this$props.config,
          ModeIcon = _this$props.ModeIcon,
          query = _this$props.query,
          setQueryParam = _this$props.setQueryParam,
          showUserSettings = _this$props.showUserSettings;
      return _react.default.createElement("div", {
        className: "settings-selector-panel"
      }, _react.default.createElement("div", {
        className: "modes-panel"
      }, showUserSettings && _react.default.createElement(_userTripSettings.default, null), _react.default.createElement(_styled.StyledSettingsSelectorPanel, {
        ModeIcon: ModeIcon,
        queryParams: query,
        supportedModes: config.modes,
        supportedCompanies: config.companies,
        onQueryParamChange: setQueryParam
      })));
    }
  }]);

  return ConnectedSettingsSelectorPanel;
}(_react.Component); // connect to redux store


_defineProperty(ConnectedSettingsSelectorPanel, "propTypes", {
  ModeIcon: _propTypes.default.elementType.isRequired
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp = state.otp,
      config = _state$otp.config,
      currentQuery = _state$otp.currentQuery;
  return {
    query: currentQuery,
    config: config,
    showUserSettings: (0, _state.getShowUserSettings)(state.otp)
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ConnectedSettingsSelectorPanel);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=connected-settings-selector-panel.js