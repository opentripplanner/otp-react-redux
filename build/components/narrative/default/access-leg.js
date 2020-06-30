"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _coreUtils = _interopRequireDefault(require("@opentripplanner/core-utils"));

var _humanizeDistance = require("@opentripplanner/humanize-distance");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _react = _interopRequireWildcard(require("react"));

var _icon = _interopRequireDefault(require("../icon"));

var _legDiagramPreview = _interopRequireDefault(require("../leg-diagram-preview"));

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

/**
 * Default access leg component for narrative itinerary.
 */
var AccessLeg =
/*#__PURE__*/
function (_Component) {
  _inherits(AccessLeg, _Component);

  function AccessLeg() {
    var _getPrototypeOf2;

    var _this;

    _classCallCheck(this, AccessLeg);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(AccessLeg)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this), "_onLegClick", function (e) {
      var _this$props = _this.props,
          active = _this$props.active,
          leg = _this$props.leg,
          index = _this$props.index,
          setActiveLeg = _this$props.setActiveLeg;

      if (active) {
        setActiveLeg(null);
      } else {
        setActiveLeg(index, leg);
      }
    });

    return _this;
  }

  _createClass(AccessLeg, [{
    key: "_onStepClick",
    value: function _onStepClick(e, step, index) {
      if (index === this.props.activeStep) {
        this.props.setActiveStep(null);
      } else {
        this.props.setActiveStep(index, step);
      }
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props2 = this.props,
          active = _this$props2.active,
          activeStep = _this$props2.activeStep,
          index = _this$props2.index,
          leg = _this$props2.leg;
      return _react.default.createElement("div", {
        key: index,
        className: "leg".concat(active ? ' active' : '', " access-leg")
      }, _react.default.createElement("button", {
        className: "header",
        onClick: this._onLegClick
      }, _react.default.createElement("span", null, _react.default.createElement(_icon.default, {
        type: "caret-".concat(active ? 'down' : 'right')
      })), _react.default.createElement("span", null, _react.default.createElement("b", null, leg.mode)), ' ', _react.default.createElement("span", {
        className: "leg-duration"
      }, _coreUtils.default.time.formatDuration(leg.duration)), ' ', _react.default.createElement("span", {
        className: "leg-distance"
      }, "(", (0, _humanizeDistance.humanizeDistanceString)(leg.distance), ")")), active && _react.default.createElement("div", {
        className: "step-by-step"
      }, _react.default.createElement("div", {
        className: "access-leg"
      }, leg.steps.map(function (step, stepIndex) {
        var stepIsActive = activeStep === stepIndex;
        return _react.default.createElement("button", {
          key: stepIndex,
          className: "step ".concat(stepIsActive ? 'active' : ''),
          onClick: function onClick(e) {
            return _this2._onStepClick(e, step, stepIndex);
          }
        }, _react.default.createElement("span", {
          className: "step-distance"
        }, (0, _humanizeDistance.humanizeDistanceString)(step.distance)), _react.default.createElement("span", {
          className: "step-text"
        }, _coreUtils.default.itinerary.getStepInstructions(step)));
      }))), _react.default.createElement(_legDiagramPreview.default, {
        leg: leg
      }));
    }
  }]);

  return AccessLeg;
}(_react.Component);

exports.default = AccessLeg;

_defineProperty(AccessLeg, "propTypes", {
  activeStep: _propTypes.default.number,
  leg: _propTypes.default.object,
  setActiveLeg: _propTypes.default.func,
  setActiveStep: _propTypes.default.func
});

module.exports = exports.default;

//# sourceMappingURL=access-leg.js