"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _itinerary = require("../../util/itinerary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var NarrativeProfileSummary =
/*#__PURE__*/
function (_Component) {
  _inherits(NarrativeProfileSummary, _Component);

  function NarrativeProfileSummary() {
    _classCallCheck(this, NarrativeProfileSummary);

    return _possibleConstructorReturn(this, _getPrototypeOf(NarrativeProfileSummary).apply(this, arguments));
  }

  _createClass(NarrativeProfileSummary, [{
    key: "render",
    value: function render() {
      var _this = this;

      var options = this.props.options;
      var bestTransit = 0;
      var walk = 0;
      var bicycle = 0;
      var bicycleRent = 0;
      options.forEach(function (option, i) {
        if (option.transit) {
          if (option.time < bestTransit || bestTransit === 0) {
            bestTransit = option.time;
          }
        } else {
          if (option.modes.length === 1 && option.modes[0] === 'bicycle') bicycle = option.time;else if (option.modes.length === 1 && option.modes[0] === 'walk') walk = option.time;else if (option.modes.indexOf('bicycle_rent') !== -1) bicycleRent = option.time;
        }
      });
      var summary = [{
        icon: 'BUS',
        title: 'Transit',
        time: bestTransit
      }, {
        icon: 'BICYCLE',
        title: 'Bicycle',
        time: bicycle
      }, {
        icon: 'BICYCLE_RENT',
        title: 'Bikeshare',
        time: bicycleRent
      }, {
        icon: 'WALK',
        title: 'Walk',
        time: walk
      }];
      return _react.default.createElement("div", {
        style: {}
      }, summary.map(function (option, k) {
        return _react.default.createElement("div", {
          key: k,
          style: {
            backgroundColor: option.time > 0 ? '#084C8D' : '#bbb',
            width: '22%',
            display: 'inline-block',
            verticalAlign: 'top',
            marginRight: k < 3 ? '4%' : 0,
            padding: '3px',
            textAlign: 'center',
            color: 'white'
          }
        }, _react.default.createElement("div", {
          style: {
            height: '24px',
            width: '24px',
            display: 'inline-block',
            fill: 'white',
            marginTop: '6px',
            textAlign: 'center'
          }
        }, (0, _itinerary.getIcon)(option.icon, _this.props.customIcons)), _react.default.createElement("div", {
          style: {
            fontSize: '10px',
            textAlign: 'center',
            marginTop: '2px',
            textTransform: 'uppercase',
            letterSpacing: '2px'
          }
        }, option.title), _react.default.createElement("div", {
          style: {
            textAlign: 'center',
            marginTop: '2px',
            height: '30px'
          }
        }, option.time > 0 ? _react.default.createElement("span", null, _react.default.createElement("span", {
          style: {
            fontSize: 24,
            fontWeight: '500'
          }
        }, Math.round(option.time / 60)), " min") : _react.default.createElement("span", {
          style: {
            fontSize: '11px'
          }
        }, "(Not Found)")));
      }));
    }
  }]);

  return NarrativeProfileSummary;
}(_react.Component);

exports.default = NarrativeProfileSummary;

_defineProperty(NarrativeProfileSummary, "propTypes", {
  options: _propTypes.default.array,
  customIcons: _propTypes.default.object
});

module.exports = exports.default;

//# sourceMappingURL=narrative-profile-summary.js