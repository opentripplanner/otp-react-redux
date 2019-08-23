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

var TramIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(TramIcon, _Component);

  function TramIcon() {
    _classCallCheck(this, TramIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(TramIcon).apply(this, arguments));
  }

  _createClass(TramIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M9.9,27.2v3.2L8.5,32h1.8l0.8-1.1v-1.8H21v1.8l1,1.1h1.6l-1.4-1.7v-3.1h3.4l0.3-1.6V5.2h-3.2l-0.7-1.9h-5.3V2.6l2.7-1.7V0 h-6.5v1l2.6,1.6v0.7h-5.3L9.4,5.2H6.2l0,20.4l0.3,1.6H9.9z M22.9,8.1l1.8,1.1V16l-1.8,0.6V8.1z M14.7,0.9h2.7L16,1.8L14.7,0.9z M9.9,8.3c0-0.5,0.3-0.8,0.8-0.8h10.4c0.5,0,0.8,0.3,0.8,0.8v7.8c0,0.5-0.3,0.8-0.8,0.8H10.7c-0.5,0-0.8-0.3-0.8-0.8V8.3z M21.9,18.1V20h-3.2v-1.9H21.9z M13.2,18.1v1.8H10v-1.8H13.2z M22.8,21.1v1.6H8.9v-1.6H22.8z M7.2,9.1L9,8v8.6L7.2,16V9.1z"
      }));
    }
  }]);

  return TramIcon;
}(_react.Component);

exports.default = TramIcon;
module.exports = exports.default;

//# sourceMappingURL=tram-icon.js