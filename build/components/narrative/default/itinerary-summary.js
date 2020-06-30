"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var ItinerarySummary =
/*#__PURE__*/
function (_Component) {
  _inherits(ItinerarySummary, _Component);

  function ItinerarySummary() {
    _classCallCheck(this, ItinerarySummary);

    return _possibleConstructorReturn(this, _getPrototypeOf(ItinerarySummary).apply(this, arguments));
  }

  _createClass(ItinerarySummary, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          itinerary = _this$props.itinerary,
          LegIcon = _this$props.LegIcon;
      var blocks = [];
      itinerary.legs.forEach(function (leg, i) {
        // Skip mid-itinerary walk transfer legs
        if (i > 0 && i < itinerary.legs.length - 1 && !leg.transitLeg && itinerary.legs[i - 1].transitLeg && itinerary.legs[i + 1].transitLeg) {
          return null;
        } // Add the mode icon


        blocks.push(_react.default.createElement("div", {
          key: blocks.length,
          className: "summary-block mode-block"
        }, _react.default.createElement(LegIcon, {
          leg: leg
        }))); // If a transit leg, add the name (preferably short; long if needed)

        if (leg.transitLeg) {
          blocks.push(_react.default.createElement("div", {
            key: blocks.length,
            className: "summary-block name-block"
          }, _react.default.createElement("span", {
            className: "route-short-name"
          }, leg.routeShortName || leg.routeLongName)));
        } // If not the last leg, add a '►'


        if (i < itinerary.legs.length - 1) {
          blocks.push(_react.default.createElement("div", {
            key: blocks.length,
            className: "summary-block arrow-block"
          }, "\u25BA"));
        }
      });
      return _react.default.createElement("div", {
        className: "summary"
      }, blocks);
    }
  }]);

  return ItinerarySummary;
}(_react.Component);

exports.default = ItinerarySummary;

_defineProperty(ItinerarySummary, "propTypes", {
  itinerary: _propTypes.default.object,
  LegIcon: _propTypes.default.elementType.isRequired
});

module.exports = exports.default;

//# sourceMappingURL=itinerary-summary.js