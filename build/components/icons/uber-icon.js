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

var UberIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(UberIcon, _Component);

  function UberIcon() {
    _classCallCheck(this, UberIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(UberIcon).apply(this, arguments));
  }

  _createClass(UberIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 926.91 321.78",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M53.33,229.81A79.25,79.25,0,0,0,69.6,256.47a70,70,0,0,0,24.63,16.95,80.36,80.36,0,0,0,31,5.88,76.61,76.61,0,0,0,30.51-6.1A75,75,0,0,0,180.55,256,77.86,77.86,0,0,0,197,229.58a95.52,95.52,0,0,0,5.88-34.35V0h47.45V316.35h-47V287a109,109,0,0,1-37.29,25.76,118.16,118.16,0,0,1-46.32,9A125.42,125.42,0,0,1,72.54,313a110.58,110.58,0,0,1-38-25.08A118.32,118.32,0,0,1,9.27,248.79Q0,226,0,197.95V0H47.45V195.24A97.36,97.36,0,0,0,53.33,229.81Z"
      }), _react.default.createElement("path", {
        d: "M332.17,0V115.24a120.88,120.88,0,0,1,36.61-25.08A109.74,109.74,0,0,1,414,80.9a119.18,119.18,0,0,1,47.45,9.49,119.55,119.55,0,0,1,64.18,64.18,118.06,118.06,0,0,1,9.49,47,116.44,116.44,0,0,1-9.49,46.77,120.14,120.14,0,0,1-64.17,63.95A119.18,119.18,0,0,1,414,321.78a111.31,111.31,0,0,1-45.42-9.27,120.06,120.06,0,0,1-36.83-25.08v28.92H286.52V0h45.64Zm5.2,232.75a78.63,78.63,0,0,0,16.95,25.31,81.78,81.78,0,0,0,25.31,17.17,76.94,76.94,0,0,0,31.18,6.33,75.83,75.83,0,0,0,30.73-6.33,79.06,79.06,0,0,0,25.08-17.17,83.82,83.82,0,0,0,16.95-25.31,76.93,76.93,0,0,0,6.33-31.18,78.54,78.54,0,0,0-6.33-31.41,83.07,83.07,0,0,0-16.95-25.53,76.09,76.09,0,0,0-25.08-16.95,79.45,79.45,0,0,0-86.77,16.95,81.07,81.07,0,0,0-17.17,25.53,78.54,78.54,0,0,0-6.33,31.41A79.38,79.38,0,0,0,337.36,232.75Z"
      }), _react.default.createElement("path", {
        d: "M560.84,155a123,123,0,0,1,24.86-38.19A119.57,119.57,0,0,1,716.31,90.39a109.34,109.34,0,0,1,36.61,25.08,114.65,114.65,0,0,1,24,38,129.58,129.58,0,0,1,8.59,47.68V216H597.9a77.29,77.29,0,0,0,9,26,78.34,78.34,0,0,0,16.95,20.79,77.45,77.45,0,0,0,23,13.78,75.27,75.27,0,0,0,27.34,5q41.13,0,66.43-33.9l33,24.4a122.74,122.74,0,0,1-42.48,36.15q-25.31,13.11-56.94,13.11a127.27,127.27,0,0,1-48.13-9A117.2,117.2,0,0,1,587.28,287a120.06,120.06,0,0,1-26-38.19A123.31,123.31,0,0,1,560.84,155Zm63.5-17.85q-19.21,16-25.53,42.71H739.36q-5.88-26.66-25.08-42.71t-45-16Q643.55,121.12,624.34,137.16Z"
      }), _react.default.createElement("path", {
        d: "M870.87,142.36q-14.46,15.82-14.46,42.93V316.35H810.76V85.87H856v28.47a64.24,64.24,0,0,1,22.37-22.15q13.78-8.14,32.77-8.14h15.82v42.48h-19Q885.33,126.54,870.87,142.36Z"
      }));
    }
  }]);

  return UberIcon;
}(_react.Component);

exports.default = UberIcon;
module.exports = exports.default;

//# sourceMappingURL=uber-icon.js