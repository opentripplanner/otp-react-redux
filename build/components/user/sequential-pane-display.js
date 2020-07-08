"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es6.object.freeze");

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _styledComponents = _interopRequireDefault(require("styled-components"));

var _formNavigationButtons = _interopRequireDefault(require("./form-navigation-buttons"));

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _templateObject() {
  var data = _taggedTemplateLiteral(["\n  min-height: 20em;\n"]);

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


var SequentialPaneDisplay =
/*#__PURE__*/
function (_Component) {
  _inherits(SequentialPaneDisplay, _Component);

  function SequentialPaneDisplay(props) {
    var _this;

    _classCallCheck(this, SequentialPaneDisplay);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(SequentialPaneDisplay).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_handleToNextPane", function () {
      var _this$props = _this.props,
          onComplete = _this$props.onComplete,
          paneSequence = _this$props.paneSequence;
      var activePaneId = _this.state.activePaneId;
      var nextId = paneSequence[activePaneId].nextId;

      if (nextId) {
        _this.setState({
          activePaneId: nextId
        });
      } else if (onComplete) {
        onComplete();
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_handleToPrevPane", function () {
      var paneSequence = _this.props.paneSequence;
      var activePaneId = _this.state.activePaneId;

      _this.setState({
        activePaneId: paneSequence[activePaneId].prevId
      });
    });

    _this.state = {
      activePaneId: 'terms'
    };
    return _this;
  }

  _createClass(SequentialPaneDisplay, [{
    key: "render",
    value: function render() {
      var paneSequence = this.props.paneSequence;
      var activePaneId = this.state.activePaneId;
      var activePane = paneSequence[activePaneId];
      var disableNext = activePane.disableNext,
          nextId = activePane.nextId,
          Pane = activePane.pane,
          prevId = activePane.prevId,
          props = activePane.props,
          title = activePane.title;
      return _react.default.createElement(_react.default.Fragment, null, _react.default.createElement("h1", null, title), _react.default.createElement(PaneContainer, null, _react.default.createElement(Pane, props)), _react.default.createElement(_formNavigationButtons.default, {
        backButton: prevId && {
          onClick: this._handleToPrevPane,
          text: 'Back'
        },
        okayButton: {
          disabled: disableNext,
          onClick: this._handleToNextPane,
          text: nextId ? 'Next' : 'Finish'
        }
      }));
    }
  }]);

  return SequentialPaneDisplay;
}(_react.Component);

_defineProperty(SequentialPaneDisplay, "propTypes", {
  onComplete: _propTypes.default.func.isRequired,
  paneSequence: _propTypes.default.object.isRequired
});

var _default = SequentialPaneDisplay;
exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=sequential-pane-display.js