"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactRedux = require("react-redux");

var _reactResizeDetector = _interopRequireDefault(require("react-resize-detector"));

var _map = require("../../actions/map");

var _itinerary = require("../../util/itinerary");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var METERS_TO_FEET = 3.28084;

var LegDiagramPreview =
/*#__PURE__*/
function (_Component) {
  _inherits(LegDiagramPreview, _Component);

  function LegDiagramPreview(props) {
    var _this;

    _classCallCheck(this, LegDiagramPreview);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(LegDiagramPreview).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_onResize", function (width, height) {
      if (width > 0) {
        _this.setState({
          width: width
        });
      }
    });

    _defineProperty(_assertThisInitialized(_this), "_isActive", function () {
      var _this$props = _this.props,
          diagramVisible = _this$props.diagramVisible,
          leg = _this$props.leg;
      return diagramVisible && diagramVisible.startTime === leg.startTime;
    });

    _defineProperty(_assertThisInitialized(_this), "_onExpandClick", function () {
      var _this$props2 = _this.props,
          leg = _this$props2.leg,
          showLegDiagram = _this$props2.showLegDiagram;
      if (_this._isActive()) showLegDiagram(null);else showLegDiagram(leg);
    });

    _defineProperty(_assertThisInitialized(_this), "_formatElevation", function (elev) {
      return Math.round(elev) + "'";
    });

    _this.state = {
      width: null
    };
    return _this;
  }

  _createClass(LegDiagramPreview, [{
    key: "render",
    value: function render() {
      var _this$props3 = this.props,
          leg = _this$props3.leg,
          showElevationProfile = _this$props3.showElevationProfile;
      if (!showElevationProfile) return null;
      var profile = (0, _itinerary.getElevationProfile)(leg.steps); // Don't show for very short legs

      if (leg.distance < 500 || leg.mode === 'CAR') return null;
      return _react.default.createElement("div", {
        className: "leg-diagram-preview ".concat(this._isActive() ? 'on' : '')
      }, _react.default.createElement("div", {
        className: "diagram",
        tabIndex: "0",
        title: "Toggle elevation chart",
        role: "button",
        onClick: this._onExpandClick
      }, _react.default.createElement("div", {
        className: "diagram-title text-center"
      }, "Elevation chart", ' ', _react.default.createElement("span", {
        style: {
          fontSize: 'xx-small',
          color: 'red'
        }
      }, "\u2191", this._formatElevation(profile.gain * METERS_TO_FEET), '  '), _react.default.createElement("span", {
        style: {
          fontSize: 'xx-small',
          color: 'green'
        }
      }, "\u2193", this._formatElevation(-profile.loss * METERS_TO_FEET))), profile.points.length > 0 ? generateSvg(profile, this.state.width) : 'No elevation data available.', _react.default.createElement(_reactResizeDetector.default, {
        handleWidth: true,
        onResize: this._onResize
      })));
    }
  }]);

  return LegDiagramPreview;
}(_react.Component);

_defineProperty(LegDiagramPreview, "propTypes", {
  leg: _propTypes.default.object
});

function generateSvg(profile, width) {
  var height = 30;
  var minElev = profile.minElev,
      maxElev = profile.maxElev,
      ptArr = profile.points,
      traversed = profile.traversed; // Pad the min-max range by 25m on either side

  minElev -= 25;
  maxElev += 25; // Transform the point array and store it as an SVG-ready string

  var pts = ptArr.map(function (pt) {
    var x = pt[0] / traversed * width;
    var y = height - height * (pt[1] - minElev) / (maxElev - minElev);
    return x + ',' + y;
  }).join(' '); // Render the SVG

  return _react.default.createElement("svg", {
    height: height,
    width: width
  }, _react.default.createElement("polyline", {
    points: pts,
    fill: "none",
    stroke: "black",
    strokeWidth: 1.3
  }));
} // Connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    diagramVisible: state.otp.ui.diagramLeg,
    showElevationProfile: Boolean(state.otp.config.elevationProfile)
  };
};

var mapDispatchToProps = {
  showLegDiagram: _map.showLegDiagram
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LegDiagramPreview);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=leg-diagram-preview.js