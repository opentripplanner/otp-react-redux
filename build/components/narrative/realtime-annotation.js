"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _time = require("../../util/time");

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

var RealtimeAnnotation =
/*#__PURE__*/
function (_Component) {
  _inherits(RealtimeAnnotation, _Component);

  function RealtimeAnnotation() {
    _classCallCheck(this, RealtimeAnnotation);

    return _possibleConstructorReturn(this, _getPrototypeOf(RealtimeAnnotation).apply(this, arguments));
  }

  _createClass(RealtimeAnnotation, [{
    key: "render",
    value: function render() {
      var _this$props = this.props,
          componentClass = _this$props.componentClass,
          realtimeEffects = _this$props.realtimeEffects,
          toggleRealtime = _this$props.toggleRealtime,
          useRealtime = _this$props.useRealtime; // Keep only the unique route IDs (so that duplicates are not listed).

      var filteredRoutes = realtimeEffects.normalRoutes.filter(function (routeId, index, self) {
        return self.indexOf(routeId) === index;
      }); // FIXME: there are some weird css things happening in desktop vs. mobile,
      // so I removed the divs with classNames and opted for h4 and p for now

      var innerContent = _react.default.createElement("div", {
        className: "realtime-alert"
      }, _react.default.createElement("div", {
        className: "content"
      }, _react.default.createElement("h3", null, _react.default.createElement("i", {
        className: "fa fa-exclamation-circle"
      }), " Service update"), _react.default.createElement("p", null, useRealtime ? _react.default.createElement("span", {
        className: "small"
      }, "Your trip results have been adjusted based on real-time information. Under normal conditions, this trip would take", ' ', _react.default.createElement("b", null, (0, _time.formatDuration)(realtimeEffects.normalDuration), " "), "using the following routes:", ' ', filteredRoutes.map(function (route, idx) {
        return _react.default.createElement("span", {
          key: idx
        }, _react.default.createElement("b", null, route), filteredRoutes.length - 1 > idx && ', ');
      }), ".") : _react.default.createElement("span", {
        className: "small"
      }, "Your trip results are currently being affected by service delays. These delays do not factor into travel times shown below.")), _react.default.createElement("div", null, _react.default.createElement(_reactBootstrap.Button, {
        block: componentClass === 'popover' // display as block in popover
        ,
        className: "toggle-realtime",
        onClick: toggleRealtime
      }, useRealtime ? "Ignore" : "Apply", " service delays"))));

      if (componentClass === 'popover') {
        return _react.default.createElement(_reactBootstrap.OverlayTrigger, {
          trigger: "click",
          placement: "bottom" // container={this}
          // containerPadding={40}
          ,
          overlay: _react.default.createElement(_reactBootstrap.Popover, {
            style: {
              maxWidth: '300px'
            },
            id: "popover-positioned-bottom"
          }, innerContent)
        }, _react.default.createElement(_reactBootstrap.Button, {
          bsStyle: "link"
        }, _react.default.createElement("i", {
          className: "fa fa-2x fa-exclamation-circle"
        })));
      } else {
        return innerContent;
      }
    }
  }]);

  return RealtimeAnnotation;
}(_react.Component);

exports.default = RealtimeAnnotation;

_defineProperty(RealtimeAnnotation, "propTypes", {
  realtimeEffects: _propTypes.default.object,
  toggleRealtime: _propTypes.default.func,
  useRealtime: _propTypes.default.bool
});

module.exports = exports.default;

//# sourceMappingURL=realtime-annotation.js