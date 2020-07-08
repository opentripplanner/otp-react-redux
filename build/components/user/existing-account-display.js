"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

var _react = _interopRequireDefault(require("react"));

var _stackedPaneDisplay = _interopRequireDefault(require("./stacked-pane-display"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * This component handles the existing account display.
 */
var ExistingAccountDisplay = function ExistingAccountDisplay(_ref) {
  var onCancel = _ref.onCancel,
      onComplete = _ref.onComplete,
      panes = _ref.panes;
  var paneSequence = [{
    pane: panes.terms,
    props: {
      disableCheckTerms: true
    },
    title: 'Terms'
  }, {
    pane: panes.notifications,
    title: 'Notifications'
  }, {
    pane: panes.locations,
    title: 'My locations'
  }];
  return _react.default.createElement(_stackedPaneDisplay.default, {
    onCancel: onCancel,
    onComplete: onComplete,
    paneSequence: paneSequence
  });
};

var _default = ExistingAccountDisplay;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=existing-account-display.js