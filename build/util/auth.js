"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAuth0Config = getAuth0Config;
exports.accountLinks = void 0;

var _constants = require("./constants");

/**
 * Custom links under the user account dropdown.
 * TODO: Determine/implement the urls below.
 */
var accountLinks = [{
  text: 'My Account',
  url: '/account'
}, {
  // Add a target attribute if you need the link to open in a new window, etc.
  // (supports the same values as <a target=... >).
  // target: '_blank',
  text: 'Help',
  url: '/help'
}];
/**
 * Obtains the Auth0 {domain, audience, clientId} configuration, if the following applies in config.yml:
 * - persistence is defined,
 * - persistence.enabled is true,
 * - persistence.strategy is 'otp_middleware',
 * - persistence.auth0 is defined.
 * @param persistence The OTP persistence configuration from config.yml.
 * @returns The Auth0 configuration, or null if the conditions are not met.
 */

exports.accountLinks = accountLinks;

function getAuth0Config(persistence) {
  if (persistence) {
    var _persistence$enabled = persistence.enabled,
        enabled = _persistence$enabled === void 0 ? false : _persistence$enabled,
        _persistence$strategy = persistence.strategy,
        strategy = _persistence$strategy === void 0 ? null : _persistence$strategy,
        _persistence$auth = persistence.auth0,
        auth0 = _persistence$auth === void 0 ? null : _persistence$auth;
    return enabled && strategy === _constants.PERSISTENCE_STRATEGY_OTP_MIDDLEWARE ? auth0 : null;
  }

  return null;
}

//# sourceMappingURL=auth.js