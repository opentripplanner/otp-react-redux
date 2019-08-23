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

var BiketownIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(BiketownIcon, _Component);

  function BiketownIcon() {
    _classCallCheck(this, BiketownIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(BiketownIcon).apply(this, arguments));
  }

  _createClass(BiketownIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 418.62 160.29",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M230.91,500.07c-6.66,1.79-12,1.53-15.08-.71-7.84-5.72-1.89-17.25.27-20.68a103,103,0,0,0-10.64,13c-4.68,7.2-6.68,15.07-3.52,20.13,5.69,9.12,19.32,4.91,28,1.25l80.66-34Z",
        transform: "translate(-37 -357)"
      }), _react.default.createElement("path", {
        d: "M37,431.27V357H61.88q14,0,20.68,5.77a19.31,19.31,0,0,1,6.83,15.29q0,14-14.78,15.11Q83,394.33,87,398.37T90.87,410q0,9.58-6.62,15.39T67,431.27H37Zm21.4-46h1.44a9.84,9.84,0,0,0,6.08-1.68,5.57,5.57,0,0,0,2.23-4.71q0-6.44-7.54-6.45h-0.9l-1.31.07v12.78h0Zm0,30.25,1.08,0.08h0.77a9.55,9.55,0,0,0,6.39-2A6.76,6.76,0,0,0,69,408.18a6.47,6.47,0,0,0-2.38-5.33,10.12,10.12,0,0,0-6.55-1.93H58.4v14.61h0Z",
        transform: "translate(-37 -357)"
      }), _react.default.createElement("rect", {
        x: "56.7",
        width: "21.4",
        height: "74.27"
      }), _react.default.createElement("polygon", {
        points: "141 74.27 117.92 74.27 103.7 40.02 104.27 74.27 82.87 74.27 82.87 0 104.27 0 103.7 31.84 116.33 0 138.9 0 121.81 35.84 141 74.27"
      }), _react.default.createElement("path", {
        d: "M315.73,394.39q0,16.4-8.26,26.66a26.16,26.16,0,0,1-21.39,10.22A28.29,28.29,0,0,1,266,423.42q-10.5-9.94-10.5-29.82,0-19,11-29.12A27.67,27.67,0,0,1,285.82,357q13.7,0,21.81,10.12t8.11,27.26m-22.22.17q0-19.76-7.59-19.76-3.79,0-6.05,5.19-2.21,4.81-2.21,14.15t2.08,14.27q2.08,5.07,5.77,5.07t5.85-5q2.15-5,2.15-13.91",
        transform: "translate(-37 -357)"
      }), _react.default.createElement("path", {
        d: "M383.26,431.27h-20.7l-5-26q-1.45-7.55-2.18-13.08-0.36-2.74-.62-4.57c-0.18-1.22-.29-2.15-0.36-2.79q-0.26,2-.77,7.36-0.24,2.74-.56,5.77t-0.8,6.4l-3.71,26.93h-20L310.92,357h21.14l3.49,20.44q2,12.22,2.77,19.19l0.68,6.79,0.67-5.82q1-10.2,2.68-19.39L346.24,357H364l3.47,17.85q2.53,12.45,4.35,29.48,0.57-7.65,1.23-13.56T374.54,380l3.9-23h20.88Z",
        transform: "translate(-37 -357)"
      }), _react.default.createElement("path", {
        d: "M399.69,431.27V357H420.1l10.73,26.07,2,5.29q1.13,3,2.44,6.88l2.21,6.54q-1.18-9.67-1.79-16.55T435,373.69V357h20.62v74.27H435L423.61,404q-1.8-4.38-3.24-8.2t-2.53-7.29q1.28,7.84,1.87,13.66a101.82,101.82,0,0,1,.59,10.2v19H399.69v-0.05Z",
        transform: "translate(-37 -357)"
      }), _react.default.createElement("polygon", {
        points: "140.86 0 140.86 74.27 180.62 74.27 180.62 56.47 162.25 56.47 162.25 45.07 178.72 45.07 178.72 27.27 162.25 27.27 162.25 17.8 189.71 17.8 189.71 74.27 211.1 74.27 211.1 17.8 223.37 17.8 223.37 0 140.86 0"
      }));
    }
  }]);

  return BiketownIcon;
}(_react.Component);

exports.default = BiketownIcon;
module.exports = exports.default;

//# sourceMappingURL=biketown-icon.js