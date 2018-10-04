'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _narrativeItinerary = require('../narrative-itinerary');

var _narrativeItinerary2 = _interopRequireDefault(_narrativeItinerary);

var _itinerarySummary = require('./itinerary-summary');

var _itinerarySummary2 = _interopRequireDefault(_itinerarySummary);

var _itineraryDetails = require('./itinerary-details');

var _itineraryDetails2 = _interopRequireDefault(_itineraryDetails);

var _tripDetails = require('../trip-details');

var _tripDetails2 = _interopRequireDefault(_tripDetails);

var _tripTools = require('../trip-tools');

var _tripTools2 = _interopRequireDefault(_tripTools);

var _time = require('../../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultItinerary = function (_NarrativeItinerary) {
  (0, _inherits3.default)(DefaultItinerary, _NarrativeItinerary);

  function DefaultItinerary() {
    (0, _classCallCheck3.default)(this, DefaultItinerary);
    return (0, _possibleConstructorReturn3.default)(this, (DefaultItinerary.__proto__ || (0, _getPrototypeOf2.default)(DefaultItinerary)).apply(this, arguments));
  }

  (0, _createClass3.default)(DefaultItinerary, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          active = _props.active,
          activeLeg = _props.activeLeg,
          activeStep = _props.activeStep,
          expanded = _props.expanded,
          index = _props.index,
          itinerary = _props.itinerary,
          setActiveLeg = _props.setActiveLeg,
          setActiveStep = _props.setActiveStep;

      return _react2.default.createElement(
        'div',
        { className: 'option default-itin' + (active ? ' active' : '') },
        _react2.default.createElement(
          'button',
          {
            className: 'header',
            onClick: this._onHeaderClick
          },
          _react2.default.createElement(
            'span',
            { className: 'title' },
            'Itinerary ',
            index + 1
          ),
          ' ',
          _react2.default.createElement(
            'span',
            { className: 'duration pull-right' },
            (0, _time.formatDuration)(itinerary.duration)
          ),
          ' ',
          _react2.default.createElement(
            'span',
            { className: 'arrivalTime' },
            (0, _time.formatTime)(itinerary.startTime),
            '\u2014',
            (0, _time.formatTime)(itinerary.endTime)
          ),
          _react2.default.createElement(_itinerarySummary2.default, { itinerary: itinerary })
        ),
        (active || expanded) && _react2.default.createElement(
          'div',
          { className: 'body' },
          _react2.default.createElement(_itineraryDetails2.default, {
            itinerary: itinerary,
            activeLeg: activeLeg,
            activeStep: activeStep,
            setActiveLeg: setActiveLeg,
            setActiveStep: setActiveStep
          }),
          _react2.default.createElement(_tripDetails2.default, { itinerary: itinerary }),
          _react2.default.createElement(_tripTools2.default, { itinerary: itinerary })
        )
      );
    }
  }]);
  return DefaultItinerary;
}(_narrativeItinerary2.default);

exports.default = DefaultItinerary;
module.exports = exports['default'];

//# sourceMappingURL=default-itinerary.js