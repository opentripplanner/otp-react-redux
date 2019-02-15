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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _reactSwipeableViews = require('react-swipeable-views');

var _reactSwipeableViews2 = _interopRequireDefault(_reactSwipeableViews);

var _narrative = require('../../actions/narrative');

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _defaultItinerary = require('./default/default-itinerary');

var _defaultItinerary2 = _interopRequireDefault(_defaultItinerary);

var _loading = require('./loading');

var _loading2 = _interopRequireDefault(_loading);

var _narrativeProfileSummary = require('./narrative-profile-summary');

var _narrativeProfileSummary2 = _interopRequireDefault(_narrativeProfileSummary);

var _state = require('../../util/state');

var _profile = require('../../util/profile');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItineraryCarousel = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryCarousel, _Component);

  function ItineraryCarousel() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItineraryCarousel);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItineraryCarousel.__proto__ || (0, _getPrototypeOf2.default)(ItineraryCarousel)).call.apply(_ref, [this].concat(args))), _this), _this.state = {}, _this._onItineraryClick = function () {
      if (typeof _this.props.onClick === 'function') _this.props.onClick();
    }, _this._onLeftClick = function () {
      var _this$props = _this.props,
          activeItinerary = _this$props.activeItinerary,
          itineraries = _this$props.itineraries,
          setActiveItinerary = _this$props.setActiveItinerary;

      setActiveItinerary(activeItinerary === 0 ? itineraries.length - 1 : activeItinerary - 1);
    }, _this._onRightClick = function () {
      var _this$props2 = _this.props,
          activeItinerary = _this$props2.activeItinerary,
          itineraries = _this$props2.itineraries,
          setActiveItinerary = _this$props2.setActiveItinerary;

      setActiveItinerary(activeItinerary === itineraries.length - 1 ? 0 : activeItinerary + 1);
    }, _this._onSwipe = function (index, indexLatest) {
      _this.props.setActiveItinerary(index);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItineraryCarousel, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          activeItinerary = _props.activeItinerary,
          itineraries = _props.itineraries,
          itineraryClass = _props.itineraryClass,
          hideHeader = _props.hideHeader,
          pending = _props.pending,
          showProfileSummary = _props.showProfileSummary;

      if (pending) return _react2.default.createElement(_loading2.default, null);
      if (!itineraries) return null;

      var views = [];
      if (showProfileSummary) {
        views.push(_react2.default.createElement(
          'div',
          { style: { padding: '6px 10px' } },
          _react2.default.createElement(
            'div',
            { style: { fontSize: '13px', marginBottom: '2px' } },
            'Your Best Options (Swipe to View All)'
          ),
          _react2.default.createElement(_narrativeProfileSummary2.default, { options: this.props.profileOptions })
        ));
      }
      views = views.concat(itineraries.map(function (itinerary, index) {
        return _react2.default.createElement(itineraryClass, (0, _extends3.default)({
          itinerary: itinerary,
          index: index,
          key: index,
          expanded: _this2.props.expanded,
          onClick: _this2._onItineraryClick
        }, _this2.props));
      }));

      return _react2.default.createElement(
        'div',
        { className: 'options itinerary' },
        hideHeader ? null : _react2.default.createElement(
          'div',
          { className: 'header carousel-header' },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              className: 'carousel-left-button carousel-button',
              disabled: activeItinerary === 0,
              onClick: this._onLeftClick },
            _react2.default.createElement(_icon2.default, { type: 'arrow-left' })
          ),
          _react2.default.createElement(
            'div',
            {
              className: 'text-center carousel-header-text' },
            activeItinerary + 1,
            ' of ',
            itineraries.length
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              disabled: activeItinerary === itineraries.length - 1,
              className: 'pull-right carousel-right-button carousel-button',
              onClick: this._onRightClick },
            _react2.default.createElement(_icon2.default, { type: 'arrow-right' })
          )
        ),
        _react2.default.createElement(
          _reactSwipeableViews2.default,
          {
            index: activeItinerary,
            onChangeIndex: this._onSwipe
          },
          views
        )
      );
    }
  }]);
  return ItineraryCarousel;
}(_react.Component), _class.propTypes = {
  itineraries: _react.PropTypes.array,
  pending: _react.PropTypes.bool,
  activeItinerary: _react.PropTypes.number,
  hideHeader: _react.PropTypes.bool,
  itineraryClass: _react.PropTypes.func,
  onClick: _react.PropTypes.func,
  setActiveItinerary: _react.PropTypes.func,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func,
  expanded: _react.PropTypes.bool,
  showProfileSummary: _react.PropTypes.bool,
  profileOptions: _react.PropTypes.array,
  companies: _react.PropTypes.string
}, _class.defaultProps = {
  itineraryClass: _defaultItinerary2.default
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var itineraries = null;
  var profileOptions = null;
  var showProfileSummary = false;
  if (activeSearch && activeSearch.response && activeSearch.response.plan) {
    itineraries = (0, _state.getActiveItineraries)(state.otp);
  } else if (activeSearch && activeSearch.response && activeSearch.response.otp) {
    profileOptions = activeSearch.response.otp.profile;
    itineraries = (0, _profile.profileOptionsToItineraries)(profileOptions);
    showProfileSummary = true;
  }

  var pending = activeSearch && activeSearch.pending;
  return {
    itineraries: itineraries,
    profileOptions: profileOptions,
    pending: pending,
    showProfileSummary: showProfileSummary,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    companies: state.otp.currentQuery.companies,
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
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ItineraryCarousel);
module.exports = exports['default'];

//# sourceMappingURL=itinerary-carousel.js