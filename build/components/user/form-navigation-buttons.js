"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireDefault(require("react"));

var _reactBootstrap = require("react-bootstrap");

var _styledComponents = _interopRequireDefault(require("styled-components"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _templateObject3() {
  var data = _taggedTemplateLiteral(["\n  float: right;\n"]);

  _templateObject3 = function _templateObject3() {
    return data;
  };

  return data;
}

function _templateObject2() {
  var data = _taggedTemplateLiteral(["\n  float: left;\n"]);

  _templateObject2 = function _templateObject2() {
    return data;
  };

  return data;
}

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  padding: 20px 0px;\n"]);

  _templateObject = function _templateObject() {
    return data;
  };

  return data;
}

function _taggedTemplateLiteral(strings, raw) { if (!raw) { raw = strings.slice(0); } return Object.freeze(Object.defineProperties(strings, { raw: { value: Object.freeze(raw) } })); }

// Styles
var StyledFormGroup = (0, _styledComponents.default)(_reactBootstrap.FormGroup)(_templateObject());
var LeftButton = (0, _styledComponents.default)(_reactBootstrap.Button)(_templateObject2());
var RightButton = (0, _styledComponents.default)(_reactBootstrap.Button)(_templateObject3());
/**
 * The button bar at the bottom of the account screen.
 */

var FormNavigationButtons = function FormNavigationButtons(_ref) {
  var backButton = _ref.backButton,
      okayButton = _ref.okayButton;
  return _react.default.createElement(StyledFormGroup, null, _react.default.createElement("nav", {
    "aria-label": "..."
  }, backButton && _react.default.createElement(LeftButton, {
    disabled: backButton.disabled,
    onClick: backButton.onClick
  }, backButton.text), okayButton && _react.default.createElement(RightButton, {
    bsStyle: "primary",
    disabled: okayButton.disabled,
    onClick: okayButton.onClick
  }, okayButton.text)));
};

var buttonType = _propTypes.default.shape({
  disabled: _propTypes.default.bool,

  /** Triggered when the button is clicked. */
  onClick: _propTypes.default.func.isRequired,

  /** The text to display on the button. */
  text: _propTypes.default.string
});

FormNavigationButtons.propTypes = {
  /** Information about the back button. */
  backButton: buttonType,

  /** Information about the okay (action) button. */
  okayButton: buttonType
};
FormNavigationButtons.defaultProps = {
  backButton: null,
  okayButton: null
};
var _default = FormNavigationButtons;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=form-navigation-buttons.js