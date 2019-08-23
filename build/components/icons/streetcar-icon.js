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

var StreetcarIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(StreetcarIcon, _Component);

  function StreetcarIcon() {
    _classCallCheck(this, StreetcarIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(StreetcarIcon).apply(this, arguments));
  }

  _createClass(StreetcarIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M9.3,24.6c0.3,0.6,1,1,1.6,1.2l-3.5,5.4h2.5l3.5-5.3l5.2,0l3.5,5.3h2.5l-3.5-5.3c0.6-0.2,1.3-0.6,1.6-1.2l0.8-1.6 c0.3-0.7,0.6-1.9,0.6-2.7L23.2,6.5c-0.1-1-1-2-2.2-2h-2c0.3-0.9,0.9-2.4,1-2.5C20.9,2,21,2.1,21.1,2.1c0,0,0.1,0.2,0.1,0.2l0-0.1 c0,0.2,0.2,0.4,0.4,0.4c0.2,0,0.5-0.3,0.5-0.5c0-0.7-1.1-0.9-2.1-1.1c-0.7-0.1-2-0.2-3.9-0.2c-1.9,0-3.2,0.1-3.9,0.2 c-1,0.1-2.1,0.3-2.1,1.1c0,0.2,0.3,0.5,0.5,0.5c0.2,0,0.4-0.2,0.4-0.4l0,0.1c0,0,0.1-0.1,0.1-0.2c0,0,0.2-0.2,1.1-0.2 c0.1,0.2,0.7,1.7,1,2.5H11c-1.2,0-2.2,1-2.2,2L7.9,20.4c-0.1,0.8,0.2,2,0.6,2.7L9.3,24.6z M11.9,24.2c-0.8,0-1.4-0.6-1.4-1.4 c0-0.8,0.6-1.4,1.4-1.4c0.8,0,1.4,0.6,1.4,1.4C13.3,23.5,12.7,24.2,11.9,24.2z M20,24.2c-0.8,0-1.4-0.6-1.4-1.4 c0-0.8,0.6-1.4,1.4-1.4c0.8,0,1.4,0.6,1.4,1.4C21.4,23.5,20.8,24.2,20,24.2z M16,1.9c0.5,0,2.1,0,2.8,0c-0.1,0.3-0.7,1.7-1,2.6h-3.6 c-0.3-0.8-0.9-2.3-1-2.6C13.9,1.9,15.5,1.9,16,1.9z M11.3,7.4c0-0.6,0.5-1.1,1.1-1.1h7.1c0.6,0,1.1,0.5,1.1,1.1v0.4 c0,0.6-0.5,1.1-1.1,1.1h-7.1c-0.6,0-1.1-0.5-1.1-1.1V7.4z M10,10.9c0-0.6,0.6-1.1,1.2-1.1l9.6,0c0.6,0,1.1,0.5,1.2,1.1l0.5,8.2 c0,0.6-0.4,1.1-1,1.1H10.6c-0.6,0-1-0.5-1-1.1L10,10.9z"
      }));
    }
  }]);

  return StreetcarIcon;
}(_react.Component);

exports.default = StreetcarIcon;
module.exports = exports.default;

//# sourceMappingURL=streetcar-icon.js