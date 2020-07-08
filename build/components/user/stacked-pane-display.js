"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _formNavigationButtons = _interopRequireDefault(require("./form-navigation-buttons"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  border-bottom: 1px solid #c0c0c0;\n  > h3 {\n    margin-top: 0.5em;\n  }\n  > div {\n    margin-left: 10%;\n  }\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// Styles.
// TODO: Improve layout.
var PaneContainer = _styledComponents.default.div(_templateObject());
/**
 * This component handles the flow between screens for new OTP user accounts.
 */


var StackedPaneDisplay = function StackedPaneDisplay(_ref) {
  var onCancel = _ref.onCancel,
      onComplete = _ref.onComplete,
      paneSequence = _ref.paneSequence;
  return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement("h1", null, "My Account"), paneSequence.map(function (_ref2, index) {
    var Pane = _ref2.pane,
        props = _ref2.props,
        title = _ref2.title;
    return _react.default.createElement(PaneContainer, {
      key: index
    }, _react.default.createElement("h3", null, title), _react.default.createElement("div", null, _react.default.createElement(Pane, props)));
  }), _react.default.createElement(_formNavigationButtons.default, {
    backButton: {
      onClick: onCancel,
      text: 'Cancel'
    },
    okayButton: {
      onClick: onComplete,
      text: 'Save Preferences'
    }
  }));
};

StackedPaneDisplay.propTypes = {
  onCancel: _propTypes.default.func.isRequired,
  onComplete: _propTypes.default.func.isRequired,
  paneSequence: _propTypes.default.array.isRequired
};
var _default = StackedPaneDisplay;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=stacked-pane-display.js