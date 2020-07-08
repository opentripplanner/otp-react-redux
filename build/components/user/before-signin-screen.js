"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This screen is flashed just before the Auth0 login page is shown.
 * TODO: improve this screen.
 */
var BeforeSignInScreen = function BeforeSignInScreen() {
  return _react.default.createElement("div", null, _react.default.createElement("h1", null, "Signing you in"), _react.default.createElement("p", null, "In order to access this page you will need to sign in. Please wait while we redirect you to the login page..."));
};

var _default = BeforeSignInScreen;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=before-signin-screen.js