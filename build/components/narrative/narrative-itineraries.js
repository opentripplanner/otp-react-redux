'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _narrative = require('../../actions/narrative');

var _defaultItinerary = require('./default/default-itinerary');

var _defaultItinerary2 = _interopRequireDefault(_defaultItinerary);

var _state = require('../../util/state');

var _realtimeAnnotation = require('./realtime-annotation');

var _realtimeAnnotation2 = _interopRequireDefault(_realtimeAnnotation);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NarrativeItineraries = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(NarrativeItineraries, _Component);

  function NarrativeItineraries() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, NarrativeItineraries);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = NarrativeItineraries.__proto__ || (0, _getPrototypeOf2.default)(NarrativeItineraries)).call.apply(_ref, [this].concat(args))), _this), _this._toggleRealtimeItineraryClick = function (e) {
      var _this$props = _this.props,
          setUseRealtimeResponse = _this$props.setUseRealtimeResponse,
          useRealtime = _this$props.useRealtime;

      setUseRealtimeResponse({ useRealtime: !useRealtime });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(NarrativeItineraries, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          activeItinerary = _props.activeItinerary,
          itineraries = _props.itineraries,
          itineraryClass = _props.itineraryClass,
          realtimeEffects = _props.realtimeEffects,
          useRealtime = _props.useRealtime;

      if (!itineraries) return null;

      return _react2.default.createElement(
        'div',
        { className: 'options itinerary' },
        _react2.default.createElement(
          'div',
          { className: 'header' },
          'We found ',
          itineraries.length,
          ' itineraries:'
        ),
        realtimeEffects.isAffectedByRealtimeData && (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer || !useRealtime) && _react2.default.createElement(_realtimeAnnotation2.default, {
          realtimeEffects: realtimeEffects,
          toggleRealtime: this._toggleRealtimeItineraryClick,
          useRealtime: useRealtime }),
        itineraries.map(function (itinerary, index) {
          return _react2.default.createElement(itineraryClass, (0, _extends3.default)({
            itinerary: itinerary,
            index: index,
            key: index,
            active: index === activeItinerary,
            routingType: 'ITINERARY'
          }, _this2.props));
        })
      );
    }
  }]);
  return NarrativeItineraries;
}(_react.Component), _class.propTypes = {
  itineraries: _react.PropTypes.array,
  itineraryClass: _react.PropTypes.func,
  pending: _react.PropTypes.bool,
  activeItinerary: _react.PropTypes.number,
  setActiveItinerary: _react.PropTypes.func,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func,
  setUseRealtimeResponse: _react.PropTypes.func,
  useRealtime: _react.PropTypes.bool,
  companies: _react.PropTypes.string
}, _class.defaultProps = {
  itineraryClass: _defaultItinerary2.default
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  var pending = activeSearch ? activeSearch.pending : false;
  var itineraries = (0, _state.getActiveItineraries)(state.otp);
  var realtimeEffects = (0, _state.getRealtimeEffects)(state.otp);
  var useRealtime = state.otp.useRealtime;
  return {
    // swap out realtime itineraries with non-realtime depending on boolean
    itineraries: itineraries,
    pending: pending,
    realtimeEffects: realtimeEffects,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    useRealtime: useRealtime,
    companies: state.otp.currentQuery.companies
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {
    setActiveItinerary: function setActiveItinerary(index) {
      dispatch((0, _narrative.setActiveItinerary)({ index: index }));
    },
    setActiveLeg: function setActiveLeg(index, leg) {
      dispatch((0, _narrative.setActiveLeg)({ index: index, leg: leg }));
    },
    setActiveStep: function setActiveStep(index, step) {
      dispatch((0, _narrative.setActiveStep)({ index: index, step: step }));
    },
    setUseRealtimeResponse: function setUseRealtimeResponse(_ref2) {
      var useRealtime = _ref2.useRealtime;

      dispatch((0, _narrative.setUseRealtimeResponse)({ useRealtime: useRealtime }));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NarrativeItineraries);
module.exports = exports['default'];

//# sourceMappingURL=narrative-itineraries.js