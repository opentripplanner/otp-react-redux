"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _sequentialPaneDisplay = _interopRequireDefault(require("./sequential-pane-display"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This component is the new account wizard.
 */
var NewAccountWizard = function NewAccountWizard(_ref) {
  var onComplete = _ref.onComplete,
      panes = _ref.panes,
      userData = _ref.userData;
  var hasConsentedToTerms = userData.hasConsentedToTerms,
      _userData$notificatio = userData.notificationChannel,
      notificationChannel = _userData$notificatio === void 0 ? 'email' : _userData$notificatio;
  var paneSequence = {
    terms: {
      disableNext: !hasConsentedToTerms,
      nextId: 'notifications',
      pane: panes.terms,
      title: 'Create a new account'
    },
    notifications: {
      nextId: notificationChannel === 'sms' ? 'verifyPhone' : 'places',
      pane: panes.notifications,
      prevId: 'terms',
      title: 'Notification preferences'
    },
    verifyPhone: {
      disableNext: true,
      // TODO: implement verification.
      nextId: 'places',
      pane: panes.verifyPhone,
      prevId: 'notifications',
      title: 'Verify your phone'
    },
    places: {
      nextId: 'finish',
      pane: panes.locations,
      prevId: 'notifications',
      title: 'Add your locations'
    },
    finish: {
      pane: panes.finish,
      prevId: 'places',
      title: 'Account setup complete!'
    }
  };
  return _react.default.createElement(_sequentialPaneDisplay.default, {
    onComplete: onComplete,
    paneSequence: paneSequence
  });
};

var _default = NewAccountWizard;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=new-account-wizard.js