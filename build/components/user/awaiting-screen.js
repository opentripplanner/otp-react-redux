"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Screen that is flashed while retrieving user data.
 * TODO: Improve this screen.
 */
var AwaitingScreen = function AwaitingScreen() {
  return _react.default.createElement("div", null, "Processing...");
};

var _default = AwaitingScreen;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=awaiting-screen.js