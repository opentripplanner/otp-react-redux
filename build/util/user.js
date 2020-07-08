"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.isNewUser = isNewUser;

function isNewUser(loggedInUser) {
  return !loggedInUser.hasConsentedToTerms;
}

//# sourceMappingURL=user.js