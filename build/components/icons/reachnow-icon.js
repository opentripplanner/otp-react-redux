"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

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

var ReachNowIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(ReachNowIcon, _Component);

  function ReachNowIcon() {
    _classCallCheck(this, ReachNowIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(ReachNowIcon).apply(this, arguments));
  }

  _createClass(ReachNowIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        viewBox: "0 0 83.7 85.1",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M42.9,331l-4.5-15a3,3,0,0,1,.6-2.6l18.9-21.2a2.43,2.43,0,0,1,2.4-.8l10.2,2,2.9-15.9H32.6a10.82,10.82,0,0,0-10.7,10.9v49.87Z",
        transform: "translate(-21.9 -277.5)"
      }), _react.default.createElement("path", {
        d: "M75,344.3l16.8-19-7.2-23.7-10-2-4.7,26.2a2.49,2.49,0,0,1-1.7,2l-18.7,6.5,1.6,5.2Z",
        transform: "translate(-21.9 -277.5)"
      }), _react.default.createElement("path", {
        d: "M94.9,277.5H78.6l-3.1,17,11.6,2.3a2.63,2.63,0,0,1,2,1.8l8.1,26.6a2.61,2.61,0,0,1-.6,2.6L77.8,349.1a2.43,2.43,0,0,1-2.4.8l-26.9-5.4a2.63,2.63,0,0,1-2-1.8l-2-6.6-22.6,7.77v7.83a10.82,10.82,0,0,0,10.7,10.9H94.9a10.82,10.82,0,0,0,10.7-10.9V288.4A10.82,10.82,0,0,0,94.9,277.5Z",
        transform: "translate(-21.9 -277.5)"
      }), _react.default.createElement("path", {
        d: "M60.7,296.9l-16.8,19L48,329.3s17.1-6,17-5.9l4.5-24.7Z",
        transform: "translate(-21.9 -277.5)"
      }));
    }
  }]);

  return ReachNowIcon;
}(_react.Component);

exports.default = ReachNowIcon;
module.exports = exports.default;

//# sourceMappingURL=reachnow-icon.js