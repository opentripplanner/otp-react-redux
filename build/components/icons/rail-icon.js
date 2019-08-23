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

var RailIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(RailIcon, _Component);

  function RailIcon() {
    _classCallCheck(this, RailIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(RailIcon).apply(this, arguments));
  }

  _createClass(RailIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M6.9,30.6l2.8,0l0.3-0.5H22l0.3,0.5h2.9l-3.9-6.4c-0.1-0.2-0.2-0.5,0-0.6c0.2-0.1,3.3-2,3.5-2.1c0.2-0.2,0.4-0.3,0.4-0.7 c0,0,0-10.5,0-10.9c0-0.5-0.1-0.9-0.5-1.1c0,0-0.1-0.1-0.5-0.4c-0.4-0.3-0.5-0.9-0.5-1.2c0,0,0-2.1,0-2.9c0-0.8-0.6-1.5-1.1-1.7 l-4.2-0.9c-0.5-0.1-1.3-0.3-2.2-0.3c-0.9,0-1.7,0.2-2.2,0.3L9.6,2.6C9,2.8,8.5,3.5,8.5,4.3c0,0.8,0,2.9,0,2.9c0,0.3-0.2,0.9-0.5,1.2 C7.5,8.7,7.4,8.8,7.4,8.8C7.1,9,6.9,9.5,6.9,9.9c0,0.5,0,10.9,0,10.9c0,0.3,0.2,0.5,0.4,0.7c0.2,0.1,3.3,2,3.5,2.1 c0.2,0.1,0.1,0.4,0,0.6L6.9,30.6z M16,28.4h-4.9l0.8-1.3H16h4.1l0.8,1.3H16z M12.8,25.5l0.8-1.3H16h2.4l0.8,1.3H16H12.8z M22.3,19.3 c0,0.6-0.5,1.1-1.1,1.1c-0.6,0-1.1-0.5-1.1-1.1c0-0.6,0.5-1.1,1.1-1.1C21.8,18.1,22.3,18.6,22.3,19.3z M17.6,3.9 c0-0.3,0.2-0.4,0.6-0.4l3.4,0.7c0.2,0,0.4,0.3,0.4,0.5c0,0.2,0,2,0,2c0,0.1-0.3,0.4-0.6,0.3c-0.4-0.1-3.3-0.7-3.3-0.7 c-0.3-0.1-0.5-0.3-0.5-0.6V3.9z M16,8.9c0.9,0,1.6,0.7,1.6,1.6c0,0.9-0.7,1.6-1.6,1.6c-0.9,0-1.6-0.7-1.6-1.6 C14.3,9.7,15.1,8.9,16,8.9z M10,4.7c0-0.2,0.2-0.5,0.4-0.5l3.4-0.7c0.4,0,0.6,0.1,0.6,0.4v1.8c0,0.3-0.1,0.6-0.5,0.6 c0,0-2.9,0.7-3.3,0.7C10.3,7.1,10,6.8,10,6.7C10,6.7,10,4.9,10,4.7z M10.7,20.4c-0.6,0-1.1-0.5-1.1-1.1c0-0.6,0.5-1.1,1.1-1.1 c0.6,0,1.1,0.5,1.1,1.1C11.9,19.9,11.4,20.4,10.7,20.4z"
      }));
    }
  }]);

  return RailIcon;
}(_react.Component);

exports.default = RailIcon;
module.exports = exports.default;

//# sourceMappingURL=rail-icon.js