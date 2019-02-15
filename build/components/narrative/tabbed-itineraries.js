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

var _reactBootstrap = require('react-bootstrap');

var _narrative = require('../../actions/narrative');

var _defaultItinerary = require('./default/default-itinerary');

var _defaultItinerary2 = _interopRequireDefault(_defaultItinerary);

var _state = require('../../util/state');

var _itinerary = require('../../util/itinerary');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TabbedItineraries = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(TabbedItineraries, _Component);

  function TabbedItineraries() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TabbedItineraries);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TabbedItineraries.__proto__ || (0, _getPrototypeOf2.default)(TabbedItineraries)).call.apply(_ref, [this].concat(args))), _this), _this._toggleRealtimeItineraryClick = function (e) {
      var _this$props = _this.props,
          setUseRealtimeResponse = _this$props.setUseRealtimeResponse,
          useRealtime = _this$props.useRealtime;

      setUseRealtimeResponse({ useRealtime: !useRealtime });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(TabbedItineraries, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          activeItinerary = _props.activeItinerary,
          itineraries = _props.itineraries,
          itineraryClass = _props.itineraryClass,
          realtimeEffects = _props.realtimeEffects,
          useRealtime = _props.useRealtime,
          timeFormat = _props.timeFormat;

      if (!itineraries) return null;

      /* TODO: should this be moved? */
      var showRealtimeAnnotation = realtimeEffects.isAffectedByRealtimeData && (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer || !useRealtime);

      return _react2.default.createElement(
        'div',
        { className: 'options itinerary tabbed-itineraries' },
        _react2.default.createElement(
          'div',
          { className: 'tab-row' },
          itineraries.map(function (itinerary, index) {
            var timeOptions = {
              format: timeFormat,
              offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
            };
            var classNames = ['tab-button', 'clear-button-formatting'];

            var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
                caloriesBurned = _calculatePhysicalAct.caloriesBurned;

            var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
                centsToString = _calculateFares.centsToString,
                maxTNCFare = _calculateFares.maxTNCFare,
                minTNCFare = _calculateFares.minTNCFare,
                transitFare = _calculateFares.transitFare;
            // TODO: support non-USD


            var minTotalFare = minTNCFare * 100 + transitFare;
            var plus = maxTNCFare && maxTNCFare > minTNCFare ? '+' : '';
            if (index === activeItinerary) classNames.push('selected');
            return _react2.default.createElement(
              _reactBootstrap.Button,
              {
                key: 'tab-button-' + index,
                className: classNames.join(' '),
                onClick: function onClick() {
                  _this2.props.setActiveItinerary(index);
                }
              },
              _react2.default.createElement(
                'div',
                { className: 'title' },
                _react2.default.createElement(
                  'span',
                  null,
                  'Option ',
                  index + 1
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'details' },
                (0, _time.formatDuration)(itinerary.duration),
                _react2.default.createElement(
                  'span',
                  null,
                  _react2.default.createElement('br', null),
                  (0, _time.formatTime)(itinerary.startTime, timeOptions),
                  ' - ',
                  (0, _time.formatTime)(itinerary.endTime, timeOptions)
                ),
                _react2.default.createElement(
                  'span',
                  null,
                  _react2.default.createElement('br', null),
                  minTotalFare ? _react2.default.createElement(
                    'span',
                    null,
                    '' + centsToString(minTotalFare) + plus,
                    ' \u2022 '
                  ) : '',
                  Math.round(caloriesBurned),
                  ' Cal'
                ),
                itinerary.transfers > 0 && _react2.default.createElement(
                  'span',
                  null,
                  _react2.default.createElement('br', null),
                  itinerary.transfers,
                  ' transfer',
                  itinerary.transfers > 1 ? 's' : ''
                )
              )
            );
          })
        ),
        activeItinerary !== null && _react2.default.createElement(itineraryClass, (0, _extends3.default)({
          itinerary: itineraries[activeItinerary],
          index: activeItinerary,
          key: activeItinerary,
          active: true,
          routingType: 'ITINERARY',
          showRealtimeAnnotation: showRealtimeAnnotation
        }, this.props))
      );
    }
  }]);
  return TabbedItineraries;
}(_react.Component), _class.propTypes = {
  itineraries: _react.PropTypes.array,
  itineraryClass: _react.PropTypes.func,
  pending: _react.PropTypes.bool,
  activeItinerary: _react.PropTypes.number,
  setActiveItinerary: _react.PropTypes.func,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func,
  setUseRealtimeResponse: _react.PropTypes.func,
  useRealtime: _react.PropTypes.bool
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
    companies: state.otp.currentQuery.companies,
    tnc: state.otp.tnc,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config)
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

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TabbedItineraries);
module.exports = exports['default'];

//# sourceMappingURL=tabbed-itineraries.js