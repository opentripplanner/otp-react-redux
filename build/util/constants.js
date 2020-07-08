"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.URL_ROOT = exports.PERSISTENCE_STRATEGY_OTP_MIDDLEWARE = exports.DEFAULT_APP_TITLE = exports.AUTH0_SCOPE = exports.AUTH0_AUDIENCE = void 0;
var AUTH0_AUDIENCE = 'https://otp-middleware';
exports.AUTH0_AUDIENCE = AUTH0_AUDIENCE;
var AUTH0_SCOPE = '';
exports.AUTH0_SCOPE = AUTH0_SCOPE;
var DEFAULT_APP_TITLE = 'OpenTripPlanner';
exports.DEFAULT_APP_TITLE = DEFAULT_APP_TITLE;
var PERSISTENCE_STRATEGY_OTP_MIDDLEWARE = 'otp_middleware'; // Gets the root URL, e.g. https://otp-instance.example.com:8080, computed once for all.

exports.PERSISTENCE_STRATEGY_OTP_MIDDLEWARE = PERSISTENCE_STRATEGY_OTP_MIDDLEWARE;
var URL_ROOT = "".concat(window.location.protocol, "//").concat(window.location.host);
exports.URL_ROOT = URL_ROOT;

//# sourceMappingURL=constants.js