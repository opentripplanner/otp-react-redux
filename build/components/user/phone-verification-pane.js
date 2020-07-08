"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _reactBootstrap = require("react-bootstrap");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * User phone verification pane.
 * TODO: to be completed.
 */
var PhoneVerificationPane = function PhoneVerificationPane() {
  return _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Alert, {
    bsStyle: "warning"
  }, _react.default.createElement("strong", null, "Under construction!")), _react.default.createElement("p", null, "Please check your mobile phone's SMS messaging app for a text message with a verification code and copy the code below:"), _react.default.createElement(_reactBootstrap.FormGroup, {
    bsSize: "large"
  }, _react.default.createElement(_reactBootstrap.FormControl, {
    type: "number",
    placeholder: "_ _ _ _ _ _"
  })));
};

var _default = PhoneVerificationPane;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=phone-verification-pane.js