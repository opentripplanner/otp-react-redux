'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getPrototypeOf = require('babel-runtime/core-js/object/get-prototype-of');

var _getPrototypeOf2 = _interopRequireDefault(_getPrototypeOf);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _possibleConstructorReturn2 = require('babel-runtime/helpers/possibleConstructorReturn');

var _possibleConstructorReturn3 = _interopRequireDefault(_possibleConstructorReturn2);

var _inherits2 = require('babel-runtime/helpers/inherits');

var _inherits3 = _interopRequireDefault(_inherits2);

var _class, _temp;

var _react = require('react');

var _reactLeaflet = require('react-leaflet');

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

var _reactRedux = require('react-redux');

var _transitiveJs = require('transitive-js');

var _transitiveJs2 = _interopRequireDefault(_transitiveJs);

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _state = require('../../util/state');

var _map = require('../../util/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

require('./leaflet-canvas-layer');

// TODO: move to util?
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

var TransitiveCanvasOverlay = (_temp = _class = function (_MapLayer) {
  (0, _inherits3.default)(TransitiveCanvasOverlay, _MapLayer);

  function TransitiveCanvasOverlay() {
    (0, _classCallCheck3.default)(this, TransitiveCanvasOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (TransitiveCanvasOverlay.__proto__ || (0, _getPrototypeOf2.default)(TransitiveCanvasOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(TransitiveCanvasOverlay, [{
    key: 'componentDidMount',


    // React Lifecycle Methods

    value: function componentDidMount() {
      var map = this.context.map;

      _leaflet2.default.canvasLayer().delegate(this) // -- if we do not inherit from L.CanvasLayer  we can setup a delegate to receive events from L.CanvasLayer
      .addTo(map);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      // Check if we received new transitive data
      if (this._transitive && !(0, _lodash2.default)(nextProps.transitiveData, this.props.transitiveData)) {
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
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      if (this._transitive) {
        this._transitive.updateData(null);
        this._transitive.render();
      }
    }

    // Internal Methods

  }, {
    key: '_initTransitive',
    value: function _initTransitive(canvas) {
      var map = this.context.map;

      // set up the transitive instance
      var mapBounds = map.getBounds();
      this._transitive = new _transitiveJs2.default({
        data: this.props.transitiveData,
        initialBounds: [[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]],
        zoomEnabled: false,
        autoResize: false,
        styles: require('./transitive-styles'),
        zoomFactors: zoomFactors,
        display: 'canvas',
        canvas: canvas
      });

      checkHiPPI(canvas);

      // the initial map draw
      this._updateBoundsAndRender();
    }
  }, {
    key: '_updateBoundsAndRender',
    value: function _updateBoundsAndRender() {
      if (!this._transitive) {
        console.log('WARNING: Transitive object not set in transitive-canvas-overlay');
        return;
      }

      var mapBounds = this.context.map.getBounds();
      this._transitive.setDisplayBounds([[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]]);
      this._transitive.render();
    }

    // Leaflet Layer API Methods

  }, {
    key: 'onDrawLayer',
    value: function onDrawLayer(info) {
      if (!this._transitive) this._initTransitive(info.canvas);

      var mapSize = this.context.map.getSize();
      if (this._lastMapSize && (mapSize.x !== this._lastMapSize.x || mapSize.y !== this._lastMapSize.y)) {
        var canvas = info.canvas;
        checkHiPPI(canvas);
        this._transitive.display.setDimensions(mapSize.x, mapSize.y);
        this._transitive.display.setCanvas(canvas);
      }

      this._updateBoundsAndRender();

      this._lastMapSize = this.context.map.getSize();
    }
  }, {
    key: 'createTile',
    value: function createTile(coords) {}
  }, {
    key: 'createLeafletElement',
    value: function createLeafletElement(props) {}
  }, {
    key: 'updateLeafletElement',
    value: function updateLeafletElement(fromProps, toProps) {}
  }]);
  return TransitiveCanvasOverlay;
}(_reactLeaflet.MapLayer), _class.propTypes = {
  transitiveData: _react.PropTypes.object }, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var transitiveData = null;
  if (activeSearch && activeSearch.query.routingType === 'ITINERARY' && activeSearch.response && activeSearch.response.plan) {
    var itins = (0, _state.getActiveItineraries)(state.otp);
    // TODO: prevent itineraryToTransitive() from being called more than needed
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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TransitiveCanvasOverlay);
module.exports = exports['default'];

//# sourceMappingURL=transitive-overlay.js