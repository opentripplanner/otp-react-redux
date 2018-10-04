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

var _narrative = require('../../actions/narrative');

var _state = require('../../util/state');

var _itinerarySteps = require('./itinerary-steps');

var _itinerarySteps2 = _interopRequireDefault(_itinerarySteps);

var _itineraryStops = require('./itinerary-stops');

var _itineraryStops2 = _interopRequireDefault(_itineraryStops);

var _itineraryLegs = require('./itinerary-legs');

var _itineraryLegs2 = _interopRequireDefault(_itineraryLegs);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItineraryOverlay = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryOverlay, _Component);

  function ItineraryOverlay() {
    (0, _classCallCheck3.default)(this, ItineraryOverlay);
    return (0, _possibleConstructorReturn3.default)(this, (ItineraryOverlay.__proto__ || (0, _getPrototypeOf2.default)(ItineraryOverlay)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItineraryOverlay, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          activeLeg = _props.activeLeg,
          activeStep = _props.activeStep,
          itinerary = _props.itinerary;

      if (!itinerary) return null;
      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(_itineraryLegs2.default, {
          itinerary: itinerary,
          activeLeg: activeLeg,
          setActiveLeg: this.props.setActiveLeg
        }),
        _react2.default.createElement(_itineraryStops2.default, {
          itinerary: itinerary,
          activeLeg: activeLeg,
          setActiveLeg: this.props.setActiveLeg
        }),
        _react2.default.createElement(_itinerarySteps2.default, {
          itinerary: itinerary,
          activeLeg: activeLeg,
          activeStep: activeStep
        })
      );
    }
  }]);
  return ItineraryOverlay;
}(_react.Component), _class.propTypes = {
  activeLeg: _react.PropTypes.number,
  activeStep: _react.PropTypes.number,
  itinerary: _react.PropTypes.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep
  };
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {
    setActiveLeg: function setActiveLeg(index, leg) {
      dispatch((0, _narrative.setActiveLeg)({ index: index, leg: leg }));
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ItineraryOverlay);
module.exports = exports['default'];

//# sourceMappingURL=itinerary-overlay.js