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

var BusIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(BusIcon, _Component);

  function BusIcon() {
    _classCallCheck(this, BusIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(BusIcon).apply(this, arguments));
  }

  _createClass(BusIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("g", null, _react.default.createElement("g", null, _react.default.createElement("g", null, _react.default.createElement("path", {
        d: "M19.9,14.4c-1.1,0-2,0.7-2.3,1.7c0.3,0,4.3,0,4.6,0C21.9,15.1,21,14.4,19.9,14.4z"
      }), _react.default.createElement("path", {
        d: "M26.9,7c-0.2-0.7-0.5-1.4-1.2-1.8c-5.2-2.7-14.4-2.6-19.1,0C6.2,5.5,5.4,6.1,5.1,7c-0.4,1.5-0.6,3-0.6,3.7l0,5.7l0,2.2 v6.1c0,0.2,0.2,0.3,0.4,0.3h22.3c0.2,0,0.3-0.1,0.3-0.3v-5.2l0-8.9C27.5,9.7,27.3,8.1,26.9,7z M11,4.9h9.9V6H11V4.9z M7.9,21.4 c-1,0-1.8-0.8-1.8-1.8c0-0.5,0.2-0.9,0.5-1.3C7,18,7.5,17.8,7.9,17.8c1,0,1.8,0.8,1.8,1.8C9.7,20.6,8.9,21.4,7.9,21.4z M24,21.4 c-1,0-1.8-0.8-1.8-1.8c0-1,0.8-1.8,1.8-1.8c1,0,1.8,0.8,1.8,1.8C25.8,20.6,25,21.4,24,21.4z M25.2,16.4H6.5C6.2,16.4,6,16,6,15.8 l0.5-7.9c0-0.4,0.3-0.8,0.8-0.8h17.4c0.2,0,0.7,0.5,0.7,1l0.6,7.7C26,16.1,25.6,16.4,25.2,16.4z"
      })), _react.default.createElement("g", null, _react.default.createElement("path", {
        d: "M6.5,27.6c0,0.8,0.8,1.2,1.6,1.2c0.4,0,0.8-0.1,1-0.3c0.3-0.2,0.4-0.5,0.4-0.9c0,0,0-1.7,0-1.9c-0.2,0-2.8,0-3,0 C6.5,25.9,6.5,27.6,6.5,27.6z"
      }), _react.default.createElement("path", {
        d: "M22.3,27.6c0,0.8,0.8,1.1,1.6,1.1c0.8,0,1.6-0.4,1.6-1.1c0,0,0-1.7,0-1.8c-0.2,0-3.1,0-3.2,0 C22.3,25.9,22.3,27.6,22.3,27.6z"
      })))));
    }
  }]);

  return BusIcon;
}(_react.Component);

exports.default = BusIcon;
module.exports = exports.default;

//# sourceMappingURL=bus-icon.js