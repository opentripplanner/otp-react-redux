"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactLeaflet = require("react-leaflet");

var _leaflet = _interopRequireDefault(require("leaflet"));

var _reactRedux = require("react-redux");

var _transitiveJs = _interopRequireDefault(require("transitive-js"));

var _lodash = _interopRequireDefault(require("lodash.isequal"));

var _state = require("../../util/state");

var _map = require("../../util/map");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

require('./leaflet-canvas-layer'); // TODO: move to util?


function checkHiPPI(canvas) {
  if (window.devicePixelRatio > 1) {
    var PIXEL_RATIO = 2;
    canvas.style.width = canvas.width + 'px';
    canvas.style.height = canvas.height + 'px';
    canvas.width *= PIXEL_RATIO;
    canvas.height *= PIXEL_RATIO;
    var context = canvas.getContext('2d');
    context.scale(PIXEL_RATIO, PIXEL_RATIO);
  }
}

var zoomFactors = [{
  minScale: 0,
  gridCellSize: 0,
  internalVertexFactor: 0,
  angleConstraint: 5,
  mergeVertexThreshold: 0,
  useGeographicRendering: true
}];

var TransitiveCanvasOverlay =
/*#__PURE__*/
function (_MapLayer) {
  _inherits(TransitiveCanvasOverlay, _MapLayer);

  function TransitiveCanvasOverlay() {
    _classCallCheck(this, TransitiveCanvasOverlay);

    return _possibleConstructorReturn(this, _getPrototypeOf(TransitiveCanvasOverlay).apply(this, arguments));
  }

  _createClass(TransitiveCanvasOverlay, [{
    key: "componentDidMount",
    value: function componentDidMount() {
      var map = this.props.leaflet.map;

      _leaflet.default.canvasLayer().delegate(this) // -- if we do not inherit from L.CanvasLayer  we can setup a delegate to receive events from L.CanvasLayer
      .addTo(map);
    }
  }, {
    key: "componentWillReceiveProps",
    value: function componentWillReceiveProps(nextProps) {
      // Check if we received new transitive data
      if (this._transitive && !(0, _lodash.default)(nextProps.transitiveData, this.props.transitiveData)) {
        this._transitive.updateData(nextProps.transitiveData);

        if (!nextProps.transitiveData) this._transitive.render();else this._updateBoundsAndRender();
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
    key: "componentWillUnmount",
    value: function componentWillUnmount() {
      if (this._transitive) {
        this._transitive.updateData(null);

        this._transitive.render();
      }
    } // Internal Methods

  }, {
    key: "_initTransitive",
    value: function _initTransitive(canvas) {
      var map = this.props.leaflet.map; // set up the transitive instance

      var mapBounds = map.getBounds();
      this._transitive = new _transitiveJs.default({
        data: this.props.transitiveData,
        initialBounds: [[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]],
        zoomEnabled: false,
        autoResize: false,
        styles: require('./transitive-styles'),
        zoomFactors: zoomFactors,
        display: 'canvas',
        canvas: canvas
      });
      checkHiPPI(canvas); // the initial map draw

      this._updateBoundsAndRender();
    }
  }, {
    key: "_updateBoundsAndRender",
    value: function _updateBoundsAndRender() {
      if (!this._transitive) {
        console.log('WARNING: Transitive object not set in transitive-canvas-overlay');
        return;
      }

      var mapBounds = this.props.leaflet.map.getBounds();

      this._transitive.setDisplayBounds([[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]]);

      this._transitive.render();
    } // Leaflet Layer API Methods

  }, {
    key: "onDrawLayer",
    value: function onDrawLayer(info) {
      if (!this._transitive) this._initTransitive(info.canvas);
      var mapSize = this.props.leaflet.map.getSize();

      if (this._lastMapSize && (mapSize.x !== this._lastMapSize.x || mapSize.y !== this._lastMapSize.y)) {
        var canvas = info.canvas;
        checkHiPPI(canvas);

        this._transitive.display.setDimensions(mapSize.x, mapSize.y);

        this._transitive.display.setCanvas(canvas);
      }

      this._updateBoundsAndRender();

      this._lastMapSize = this.props.leaflet.map.getSize();
    }
  }, {
    key: "createTile",
    value: function createTile(coords) {}
  }, {
    key: "createLeafletElement",
    value: function createLeafletElement(props) {}
  }, {
    key: "updateLeafletElement",
    value: function updateLeafletElement(fromProps, toProps) {}
  }]);

  return TransitiveCanvasOverlay;
}(_reactLeaflet.MapLayer); // connect to the redux store


_defineProperty(TransitiveCanvasOverlay, "propTypes", {
  transitiveData: _propTypes.default.object // React Lifecycle Methods

});

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var transitiveData = null;

  if (activeSearch && activeSearch.query.routingType === 'ITINERARY' && activeSearch.response && activeSearch.response.plan) {
    var itins = (0, _state.getActiveItineraries)(state.otp); // TODO: prevent itineraryToTransitive() from being called more than needed

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

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)((0, _reactLeaflet.withLeaflet)(TransitiveCanvasOverlay));

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=transitive-overlay.js