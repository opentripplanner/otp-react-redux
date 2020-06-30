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

var Car2goIcon =
/*#__PURE__*/
function (_Component) {
  _inherits(Car2goIcon, _Component);

  function Car2goIcon() {
    _classCallCheck(this, Car2goIcon);

    return _possibleConstructorReturn(this, _getPrototypeOf(Car2goIcon).apply(this, arguments));
  }

  _createClass(Car2goIcon, [{
    key: "render",
    value: function render() {
      return _react.default.createElement("svg", {
        version: "1.1",
        viewBox: "0 0 1024 672",
        height: "100%",
        width: "100%"
      }, ">", _react.default.createElement("path", {
        id: "path7755",
        d: "M92.5,0C45.8,0,0,45.8,0,92.5v124.3c0,46.7,45.8,92.5,92.5,92.5h216.8v-60.6H92.5c-30.6,0-31.8-28.6-31.9-31.9V92.5c0-3.2,1.2-31.9,31.9-31.9h216.8V0H92.5z"
      }), _react.default.createElement("path", {
        id: "path7759",
        d: "M92.5,362.7C19.3,362.7,0,423.2,0,455.2v9.6h60.5l0.1-9.5c0-3.3,1.2-31.9,31.9-31.9h125.6c25.3,0,30.6,17.4,30.6,31.9c0,21.4-10.4,31.9-31.9,31.9H93.8C45.6,487.1,0,533,0,581.5V672h309.3v-60.6H60.6v-29.9c0-3.4,1.2-33.8,31.9-33.8h124.4c47.5,0,92.5-44.9,92.5-92.5c0-49.3-42.9-92.5-91.8-92.5H92.5z"
      }), _react.default.createElement("path", {
        id: "path7763",
        d: "M576.1,0H451.8c-46.7,0-92.5,45.8-92.5,92.5v216.8h60.6v-82.9H608v82.9h60.6V92.5C668.6,45.8,622.8,0,576.1,0M608,165.8H419.9V92.5c0-16.1,15.8-31.9,31.9-31.9h124.4c16.7,0,31.9,15.2,31.9,31.9V165.8z"
      }), _react.default.createElement("path", {
        id: "path7767",
        d: "M451.8,362.7c-46.7,0-92.5,45.5-92.5,91.8v125.6c0,46.3,45.8,91.8,92.5,91.8h216.8V487.1h-185v60H608v64.4H451.8c-30.8,0-32.4-27.6-32.5-30.8V455.2c0-3.2,1.2-31.9,31.9-31.9h217.5v-60.6H451.8z"
      }), _react.default.createElement("path", {
        id: "path7771",
        d: "M998.9,156.1c11.7-10.9,29-32.2,29-63.6C1027.9,45.8,982,0,935.4,0H718.6v309.3h60.6V185h156.2c30.6,0,31.8,28.6,31.9,31.9v92.4h60.6v-91.9C1027.9,185.8,1010.7,166.1,998.9,156.1 M934.1,124.4H779.2V60.6h156.2c30.6,0,31.8,28.6,31.9,31.9C967.1,95.4,965,124.4,934.1,124.4"
      }), _react.default.createElement("path", {
        id: "path7775",
        d: "M935.4,362.7H811c-46.7,0-92.5,45.8-92.5,92.5v124.3c0,46.7,45.8,92.5,92.5,92.5h124.3c46.7,0,92.5-45.8,92.5-92.5V455.2C1027.8,408.5,982,362.7,935.4,362.7 M967.2,579.5c0,30.7-28.7,31.8-31.9,31.9H811c-3.2-0.1-31.9-1.2-31.9-31.9V455.2c0-30.6,28.6-31.8,31.9-31.9h124.3c3.2,0.1,31.9,1.3,31.9,31.9V579.5z"
      }));
    }
  }]);

  return Car2goIcon;
}(_react.Component);

exports.default = Car2goIcon;
module.exports = exports.default;

//# sourceMappingURL=car2go-icon.js