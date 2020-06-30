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

var WalkIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(WalkIcon, _Component);

  function WalkIcon() {
    _classCallCheck(this, WalkIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(WalkIcon).apply(this, arguments));
  }

  _createClass(WalkIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("g", null, _react.default.createElement("path", {
        d: "M17.1,0c1.5,0,2.7,1.2,2.7,2.7c0,1.5-1.2,2.7-2.7,2.7s-2.7-1.2-2.7-2.7C14.5,1.2,15.7,0,17.1,0z M25.2,16.6 c-0.4,0.5-1.1,0.7-1.7,0.3h0c0,0-3.7-2.5-3.9-2.7c-0.3-0.2-0.4-0.6-0.5-0.8c-0.1-0.2-0.5-1-0.8-1.5L18,13.3l-0.9,3.9 c0,0,4.6,5.4,4.7,5.5c0.1,0.1,0.2,0.5,0.3,0.7c0.1,0.2,1.2,6.6,1.2,6.6c0.2,1-0.5,1.9-1.4,2.1c-1,0.2-1.9-0.5-2.1-1.4l-1.2-6.3 l-3.8-4.1c0,0-0.8,3.9-0.9,4c0,0.1-0.1,0.2-0.1,0.3c0,0.1-3.9,6.7-3.9,6.7c-0.5,0.9-1.6,1.1-2.5,0.6c-0.9-0.5-1.1-1.6-0.6-2.5 l3.4-5.8L13,11l-1.9,1.5l-1,4.5c0,0,0,0,0,0c0,0.6-0.7,1.1-1.4,0.9c-0.6-0.1-1-0.4-0.9-1.4h0c0,0,1.1-5,1.1-5.2 c0.1-0.2,0.2-0.5,0.3-0.6c0.8-0.6,3.8-3.1,4.6-3.8c1-0.8,1.5-1.1,2.3-1.1c0.7,0,1.4,0.2,2.1,1C18.7,7.1,19,7.7,19.1,8 c0.2,0.3,2.2,4.4,2.2,4.4l3.6,2.5c0,0,0,0,0,0C25.5,15.3,25.6,16,25.2,16.6z"
      })));
    }
  }]);

  return WalkIcon;
}(_react.Component);

exports.default = WalkIcon;
module.exports = exports.default;

//# sourceMappingURL=walk-icon.js