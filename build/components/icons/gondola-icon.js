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

var GondolaIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(GondolaIcon, _Component);

  function GondolaIcon() {
    _classCallCheck(this, GondolaIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(GondolaIcon).apply(this, arguments));
  }

  _createClass(GondolaIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("path", {
        d: "M24.9,17.2c-1.7-0.6-5.9-0.9-8-1.1V6.7l12.4,4.5V9.5l-7.7-2.8l0-1.3l-11.2-4l0,1.3L2.7,0v1.6l11.9,4.2v10.2L10,16 c0,0-3.8,0.4-6,3c-2.2,2.6-2.3,4.1-2.3,5.7c0,1.5,1.3,4.1,3.2,5.2c1.9,1.1,4.3,1.3,4.3,1.3L19.5,32c0,0,4.9-0.1,7.1-1.4 c1.6-1,3.7-2.5,3.7-6.3C30.3,20.5,27.8,18.2,24.9,17.2z M10.5,26.3H4.1c0,0-0.8-2.8,0.3-4.5c1.1-1.7,2-2.4,2-2.4l4.1,0.1V26.3z M18.9,26.3h-6.2v-6.9h6.2V26.3z M28.2,26.3h-7.1v-6.9h4.8c0,0,1,0.6,2,2.3C29,23.5,28.2,26.3,28.2,26.3z"
      }));
    }
  }]);

  return GondolaIcon;
}(_react.Component);

exports.default = GondolaIcon;
module.exports = exports.default;

//# sourceMappingURL=gondola-icon.js