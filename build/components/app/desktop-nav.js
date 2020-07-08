"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _navLoginButtonAuth = _interopRequireDefault(require("../user/nav-login-button-auth0.js"));

var _auth = require("../../util/auth");

var _constants = require("../../util/constants");

var _appMenu = _interopRequireDefault(require("./app-menu"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * The desktop navigation bar, featuring a `branding` logo or a `title` text
 * defined in config.yml, and a sign-in button/menu with account links.
 *
 * The `branding` and `title` parameters in config.yml are handled
 * and shown in this order in the navigation bar:
 * 1. If `branding` is defined, it is shown, and no title is displayed.
 * 2. If `branding` is not defined but if `title` is, then `title` is shown.
 * 3. If neither is defined, just show 'OpenTripPlanner' (DEFAULT_APP_TITLE).
 *
 * TODO: merge with the mobile navigation bar.
 */
var DesktopNav = function DesktopNav(_ref) {
  var otpConfig = _ref.otpConfig;
  var branding = otpConfig.branding,
      persistence = otpConfig.persistence,
      _otpConfig$title = otpConfig.title,
      title = _otpConfig$title === void 0 ? _constants.DEFAULT_APP_TITLE : _otpConfig$title;
  var showLogin = Boolean((0, _auth.getAuth0Config)(persistence)); // Display branding and title in the order as described in the class summary.

  var brandingOrTitle;

  if (branding) {
    brandingOrTitle = _react.default.createElement("div", {
      className: "icon-".concat(branding) // FIXME: Style hack for desktop view.
      ,
      style: {
        marginLeft: 50
      }
    });
  } else {
    brandingOrTitle = _react.default.createElement("div", {
      className: "navbar-title",
      style: {
        marginLeft: 50
      }
    }, title);
  }

  return _react.default.createElement(_reactBootstrap.Navbar, {
    fluid: true,
    inverse: true
  }, _react.default.createElement(_reactBootstrap.Navbar.Header, null, _react.default.createElement(_reactBootstrap.Navbar.Brand, null, _react.default.createElement("div", {
    className: "app-menu-container",
    style: {
      float: 'left',
      color: 'white',
      fontSize: 28
    }
  }, _react.default.createElement(_appMenu.default, null)), brandingOrTitle)), showLogin && _react.default.createElement(_reactBootstrap.Navbar.Collapse, null, _react.default.createElement(_reactBootstrap.Nav, {
    pullRight: true
  }, _react.default.createElement(_navLoginButtonAuth.default, {
    id: "login-control",
    links: _auth.accountLinks
  }))));
}; // connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    otpConfig: state.otp.config
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DesktopNav);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=desktop-nav.js