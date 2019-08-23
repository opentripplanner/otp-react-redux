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

var BikeIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(BikeIcon, _Component);

  function BikeIcon() {
    _classCallCheck(this, BikeIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(BikeIcon).apply(this, arguments));
  }

  _createClass(BikeIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 32 32",
        height: "100%",
        width: "100%"
      }, _react.default.createElement("g", null, _react.default.createElement("path", {
        d: "M6.9,15.4c-3.8,0-6.9,3.1-6.9,6.9c0,3.8,3.1,6.9,6.9,7c3.8,0,6.9-3.1,6.9-7C13.9,18.6,10.8,15.5,6.9,15.4z M10.7,26.1 c-0.9,1-2.3,1.6-3.7,1.6c-1.4,0-2.8-0.6-3.7-1.6c-0.9-0.9-1.5-2.3-1.5-3.7c0-1.4,0.6-2.8,1.5-3.7c1-1,2.3-1.5,3.7-1.5 c1.4,0,2.8,0.6,3.7,1.5c1,0.9,1.5,2.3,1.5,3.7C12.2,23.8,11.6,25.2,10.7,26.1z"
      }), _react.default.createElement("path", {
        d: "M19.2,7.7c1.4,0,2.5-1.1,2.5-2.5c0-1.4-1.1-2.5-2.5-2.5c-1.4,0-2.5,1.1-2.5,2.5C16.7,6.6,17.8,7.7,19.2,7.7z"
      }), _react.default.createElement("path", {
        d: "M23.9,13.9c1.5,0,1.5-2-0.1-2h-4l-2.8-4.6c-0.6-0.8-2.3-0.9-3-0.1l-4.9,4.9C8,13.3,8.7,15,10,15.4l4.5,2.8v4.6 c0,1,0.8,1.6,1.5,1.6c0.7,0,1.5-0.5,1.5-1.6V17c0-0.5-0.1-1.2-0.5-1.3l-3-1.9l2.5-2.6l1.5,2c0.3,0.6,0.9,0.8,1.5,0.8H23.9z"
      }), _react.default.createElement("g", null, _react.default.createElement("path", {
        d: "M25.1,15.3c-3.8,0-6.9,3.1-6.9,6.9c0,3.8,3.1,6.9,6.9,6.9c3.8,0,6.9-3.1,6.9-6.9C32,18.5,28.9,15.3,25.1,15.3z M28.8,26 c-0.9,0.9-2.3,1.5-3.7,1.5c-1.4,0-2.8-0.6-3.7-1.5c-0.9-1-1.5-2.3-1.5-3.7c0-1.5,0.6-2.8,1.5-3.7c1-1,2.3-1.5,3.7-1.5 c1.5,0,2.8,0.6,3.7,1.5c1,1,1.5,2.3,1.5,3.7C30.3,23.7,29.7,25,28.8,26z"
      }))));
    }
  }]);

  return BikeIcon;
}(_react.Component);

exports.default = BikeIcon;
module.exports = exports.default;

//# sourceMappingURL=bike-icon.js