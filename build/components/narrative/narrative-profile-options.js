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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _narrative = require('../../actions/narrative');

var _defaultItinerary = require('./default/default-itinerary');

var _defaultItinerary2 = _interopRequireDefault(_defaultItinerary);

var _narrativeProfileSummary = require('./narrative-profile-summary');

var _narrativeProfileSummary2 = _interopRequireDefault(_narrativeProfileSummary);

var _loading = require('./loading');

var _loading2 = _interopRequireDefault(_loading);

var _state = require('../../util/state');

var _profile = require('../../util/profile');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NarrativeProfileOptions = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(NarrativeProfileOptions, _Component);

  function NarrativeProfileOptions() {
    (0, _classCallCheck3.default)(this, NarrativeProfileOptions);
    return (0, _possibleConstructorReturn3.default)(this, (NarrativeProfileOptions.__proto__ || (0, _getPrototypeOf2.default)(NarrativeProfileOptions)).apply(this, arguments));
  }

  (0, _createClass3.default)(NarrativeProfileOptions, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          pending = _props.pending,
          itineraryClass = _props.itineraryClass,
          query = _props.query,
          activeItinerary = _props.activeItinerary;

      if (pending) return _react2.default.createElement(_loading2.default, null);

      var options = this.props.options;
      if (!options) return null;

      var itineraries = (0, _profile.profileOptionsToItineraries)(options, query);

      return _react2.default.createElement(
        'div',
        { className: 'options profile' },
        _react2.default.createElement(
          'div',
          { className: 'header' },
          'Your best options:'
        ),
        _react2.default.createElement(_narrativeProfileSummary2.default, { options: options, customIcons: this.props.customIcons }),
        _react2.default.createElement(
          'div',
          { className: 'header' },
          'We found ',
          _react2.default.createElement(
            'strong',
            null,
            options.length
          ),
          ' total options:'
        ),
        itineraries.map(function (itinerary, index) {
          return _react2.default.createElement(itineraryClass, (0, _extends3.default)({
            itinerary: itinerary,
            index: index,
            key: index,
            active: index === activeItinerary,
            routingType: 'PROFILE'
          }, _this2.props));
        })
      );
    }
  }]);
  return NarrativeProfileOptions;
}(_react.Component), _class.propTypes = {
  options: _react.PropTypes.array,
  query: _react.PropTypes.object,
  itineraryClass: _react.PropTypes.func,
  pending: _react.PropTypes.bool,
  activeOption: _react.PropTypes.number,
  setActiveItinerary: _react.PropTypes.func,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func,
  customIcons: _react.PropTypes.object
}, _class.defaultProps = {
  itineraryClass: _defaultItinerary2.default
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  // const { activeItinerary, activeLeg, activeStep } = activeSearch ? activeSearch.activeItinerary : {}
  var pending = activeSearch && activeSearch.pending;
  return {
    options: activeSearch && activeSearch.response && activeSearch.response.otp ? activeSearch.response.otp.profile : null,
    pending: pending,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    query: activeSearch && activeSearch.query
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
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(NarrativeProfileOptions);
module.exports = exports['default'];

//# sourceMappingURL=narrative-profile-options.js