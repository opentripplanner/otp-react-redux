"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactFontawesome = _interopRequireDefault(require("react-fontawesome"));

var _reactRedux = require("react-redux");

var _ui = require("../../actions/ui");

var _appMenu = _interopRequireDefault(require("../app/app-menu"));

var _navLoginButtonAuth = _interopRequireDefault(require("../../components/user/nav-login-button-auth0"));

var _auth = require("../../util/auth");

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var MobileNavigationBar =
/*#__PURE__*/
function (_Component) {
  _inherits(MobileNavigationBar, _Component);

  function MobileNavigationBar() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, MobileNavigationBar);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(MobileNavigationBar)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_backButtonPressed", function () {
      var _this$props = _this.props,
          backScreen = _this$props.backScreen,
          onBackClicked = _this$props.onBackClicked;
      if (backScreen) _this.props.setMobileScreen(_this.props.backScreen);else if (typeof onBackClicked === 'function') onBackClicked();
    });

    return _this;
  }

  _createClass(MobileNavigationBar, [{
    key: "render",
    value: function render() {
      var _this$props2 = this.props,
          auth0Config = _this$props2.auth0Config,
          headerAction = _this$props2.headerAction,
          headerText = _this$props2.headerText,
          showBackButton = _this$props2.showBackButton,
          title = _this$props2.title;
      return _react.default.createElement(_reactBootstrap.Navbar, {
        fluid: true,
        fixedTop: true
      }, _react.default.createElement(_reactBootstrap.Navbar.Header, null, _react.default.createElement(_reactBootstrap.Navbar.Brand, null, showBackButton ? _react.default.createElement("div", {
        className: "mobile-back"
      }, _react.default.createElement(_reactFontawesome.default, {
        name: "arrow-left",
        onClick: this._backButtonPressed
      })) : _react.default.createElement(_appMenu.default, null))), _react.default.createElement("div", {
        className: "mobile-header"
      }, headerText ? _react.default.createElement("div", {
        className: "mobile-header-text"
      }, headerText) : _react.default.createElement("div", null, title)), headerAction && _react.default.createElement("div", {
        className: "mobile-close"
      }, _react.default.createElement("div", {
        className: "mobile-header-action"
      }, headerAction)), auth0Config && _react.default.createElement(_navLoginButtonAuth.default, {
        id: "login-control",
        links: _auth.accountLinks
      }));
    }
  }]);

  return MobileNavigationBar;
}(_react.Component); // connect to the redux store


_defineProperty(MobileNavigationBar, "propTypes", {
  backScreen: _propTypes.default.number,
  headerAction: _propTypes.default.element,
  headerText: _propTypes.default.string,
  showBackButton: _propTypes.default.bool,
  setMobileScreen: _propTypes.default.func,
  title: _propTypes.default.element
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    auth0Config: (0, _auth.getAuth0Config)(state.otp.config.persistence)
  };
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileNavigationBar);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=navigation-bar.js