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

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _d3Selection = require('d3-selection');

var _d3Zoom = require('d3-zoom');

var _transitiveJs = require('transitive-js');

var _transitiveJs2 = _interopRequireDefault(_transitiveJs);

var _state = require('../../util/state');

var _map = require('../../util/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

var StylizedMap = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(StylizedMap, _Component);

  function StylizedMap() {
    (0, _classCallCheck3.default)(this, StylizedMap);
    return (0, _possibleConstructorReturn3.default)(this, (StylizedMap.__proto__ || (0, _getPrototypeOf2.default)(StylizedMap)).apply(this, arguments));
  }

  (0, _createClass3.default)(StylizedMap, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var el = document.getElementById('trn-canvas');
      this._transitive = new _transitiveJs2.default({
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
        _this2._transitive.setTransform(_d3Selection.event.transform);
      }));
    }
  }, {
    key: 'componentWillReceiveProps',
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
    key: 'render',
    value: function render() {
      return _react2.default.createElement('div', {
        id: 'trn-canvas',
        style: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }
      });
    }
  }]);
  return StylizedMap;
}(_react.Component), _class.propTypes = {
  activeItinerary: _react.PropTypes.number,
  routingType: _react.PropTypes.string,
  toggleLabel: _react.PropTypes.element,
  transitiveData: _react.PropTypes.object
}, _class.defaultProps = {
  toggleName: 'Stylized'
}, _temp);

// connect to the redux store

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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(StylizedMap);
module.exports = exports['default'];

//# sourceMappingURL=stylized-map.js