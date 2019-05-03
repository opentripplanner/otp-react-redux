'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _narrativeItinerary = require('../narrative-itinerary');

var _narrativeItinerary2 = _interopRequireDefault(_narrativeItinerary);

var _simpleRealtimeAnnotation = require('../simple-realtime-annotation');

var _simpleRealtimeAnnotation2 = _interopRequireDefault(_simpleRealtimeAnnotation);

var _itinerary = require('../../../util/itinerary');

var _itinSummary = require('./itin-summary');

var _itinSummary2 = _interopRequireDefault(_itinSummary);

var _itinBody = require('./itin-body');

var _itinBody2 = _interopRequireDefault(_itinBody);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LineItinerary = function (_NarrativeItinerary) {
  (0, _inherits3.default)(LineItinerary, _NarrativeItinerary);

  function LineItinerary() {
    (0, _classCallCheck3.default)(this, LineItinerary);
    return (0, _possibleConstructorReturn3.default)(this, (LineItinerary.__proto__ || (0, _getPrototypeOf2.default)(LineItinerary)).apply(this, arguments));
  }

  (0, _createClass3.default)(LineItinerary, [{
    key: '_headerText',
    value: function _headerText() {
      var itinerary = this.props.itinerary;

      return itinerary.summary || this._getSummary(itinerary);
    }
  }, {
    key: '_getSummary',
    value: function _getSummary(itinerary) {
      var summary = '';
      var transitModes = [];
      itinerary.legs.forEach(function (leg, index) {
        if ((0, _itinerary.isTransit)(leg.mode)) {
          var modeStr = (0, _itinerary.getLegModeString)(leg);
          if (transitModes.indexOf(modeStr) === -1) transitModes.push(modeStr);
        }
      });

      // check for access mode
      if (!(0, _itinerary.isTransit)(itinerary.legs[0].mode)) {
        summary += (0, _itinerary.getLegModeString)(itinerary.legs[0]);
      }

      // append transit modes, if applicable
      if (transitModes.length > 0) {
        summary += ' to ' + transitModes.join(', ');
      }

      return summary;
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          active = _props.active,
          companies = _props.companies,
          customIcons = _props.customIcons,
          expanded = _props.expanded,
          itinerary = _props.itinerary,
          itineraryFooter = _props.itineraryFooter,
          showRealtimeAnnotation = _props.showRealtimeAnnotation,
          onClick = _props.onClick,
          timeFormat = _props.timeFormat;


      console.log('>>>>>> line itin props:', this.props);

      if (!itinerary) {
        return _react2.default.createElement(
          'div',
          null,
          'No Itinerary!'
        );
      }

      var timeOptions = {
        format: timeFormat,
        offset: (0, _itinerary.getTimeZoneOffset)(itinerary)
      };

      return _react2.default.createElement(
        'div',
        { className: 'line-itin' },
        _react2.default.createElement(_itinSummary2.default, { companies: companies, itinerary: itinerary, timeOptions: timeOptions, onClick: onClick, customIcons: customIcons }),
        showRealtimeAnnotation && _react2.default.createElement(_simpleRealtimeAnnotation2.default, null),
        active || expanded ? _react2.default.createElement(_itinBody2.default, (0, _extends3.default)({}, this.props, { itinerary: itinerary, timeOptions: timeOptions })) : null,
        itineraryFooter
      );
    }
  }]);
  return LineItinerary;
}(_narrativeItinerary2.default);

exports.default = LineItinerary;
module.exports = exports['default'];

//# sourceMappingURL=line-itinerary.js