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

var _d3Selection = require("d3-selection");

var _d3Zoom = require("d3-zoom");

var _transitiveJs = _interopRequireDefault(require("transitive-js"));

var _state = require("../../util/state");

var _map = require("../../util/map");

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

var STYLES = {};
STYLES.places = {
  display: function display(_display, place) {
    if (place.getId() !== 'from' && place.getId() !== 'to' && !(0, _map.isBikeshareStation)(place)) {
      return 'none';
    }
  },
  fill: '#fff',
  stroke: '#000',
  'stroke-width': 2,
  r: 8
};
STYLES.stops_merged = {
  r: function r(display, data, index, utils) {
    return 6;
  }
};

var StylizedMap =
/*#__PURE__*/
function (_Component) {
  _inherits(StylizedMap, _Component);

  function StylizedMap() {
    _classCallCheck(this, StylizedMap);

    return _possibleConstructorReturn(this, _getPrototypeOf(StylizedMap).apply(this, arguments));
  }

  _createClass(StylizedMap, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var _this = this;

      var el = document.getElementById('trn-canvas');
      this._transitive = new _transitiveJs.default({
        el: el,
        display: 'svg',
        styles: STYLES,
        gridCellSize: 200,
        zoomFactors: [{
          minScale: 0,
          gridCellSize: 300,
          internalVertexFactor: 1000000,
          angleConstraint: 45,
          mergeVertexThreshold: 200
        }]
      });

      this._transitive.render();

      (0, _d3Selection.select)(el).call((0, _d3Zoom.zoom)().scaleExtent([1 / 2, 4]).on('zoom', function () {
        _this._transitive.setTransform(_d3Selection.event.transform);
      }));
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      if (nextProps.transitiveData !== this.props.transitiveData) {
        this._transitive.updateData(nextProps.transitiveData, true);

        this._transitive.render();
      }

      if ( // this block only applies for profile trips where active option changed
      nextProps.routingType === 'PROFILE' && nextProps.activeItinerary !== this.props.activeItinerary) {
        if (nextProps.activeItinerary == null) {
          // no option selected; clear focus
          this._transitive.focusJourney(null);

          this._transitive.render();
        } else if (nextProps.transitiveData) {
          this._transitive.focusJourney(nextProps.transitiveData.journeys[nextProps.activeItinerary].journey_id);

          this._transitive.render();
        }
      }
    }
  }, {
    key: "render",
    value: function render() {
      return _react.default.createElement("div", {
        id: "trn-canvas",
        style: {
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 0,
          right: 0
        }
      });
    }
  }]);

  return StylizedMap;
}(_react.Component); // connect to the redux store


_defineProperty(StylizedMap, "propTypes", {
  activeItinerary: _propTypes.default.number,
  routingType: _propTypes.default.string,
  toggleLabel: _propTypes.default.element,
  transitiveData: _propTypes.default.object
});

_defineProperty(StylizedMap, "defaultProps", {
  toggleName: 'Stylized'
});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var transitiveData = null;

  if (activeSearch && activeSearch.query.routingType === 'ITINERARY' && activeSearch.response && activeSearch.response.plan) {
    var itins = (0, _state.getActiveItineraries)(state.otp);
    transitiveData = (0, _map.itineraryToTransitive)(itins[activeSearch.activeItinerary]);
  } else if (activeSearch && activeSearch.response && activeSearch.response.otp) {
    transitiveData = activeSearch.response.otp;
  }

  return {
    transitiveData: transitiveData,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType
  };
};

var mapDispatchToProps = {};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StylizedMap);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=stylized-map.js