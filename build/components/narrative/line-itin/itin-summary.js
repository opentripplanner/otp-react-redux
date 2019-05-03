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

var _class, _temp2;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _itinerary = require('../../../util/itinerary');

var _time = require('../../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// TODO: make this a prop
var defaultRouteColor = '#008';

var ItinerarySummary = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ItinerarySummary, _Component);

  function ItinerarySummary() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ItinerarySummary);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ItinerarySummary.__proto__ || (0, _getPrototypeOf2.default)(ItinerarySummary)).call.apply(_ref, [this].concat(args))), _this), _this._onSummaryClicked = function () {
      if (typeof _this.props.onClick === 'function') _this.props.onClick();
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ItinerarySummary, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          companies = _props.companies,
          customIcons = _props.customIcons,
          itinerary = _props.itinerary,
          timeOptions = _props.timeOptions;

      var _calculateFares = (0, _itinerary.calculateFares)(itinerary),
          centsToString = _calculateFares.centsToString,
          maxTNCFare = _calculateFares.maxTNCFare,
          minTNCFare = _calculateFares.minTNCFare,
          transitFare = _calculateFares.transitFare;
      // TODO: support non-USD


      var minTotalFare = minTNCFare * 100 + transitFare;
      var maxTotalFare = maxTNCFare * 100 + transitFare;

      var _calculatePhysicalAct = (0, _itinerary.calculatePhysicalActivity)(itinerary),
          caloriesBurned = _calculatePhysicalAct.caloriesBurned;

      return _react2.default.createElement(
        'div',
        { className: 'itin-summary', onClick: this._onSummaryClicked },
        _react2.default.createElement(
          'div',
          { className: 'details' },
          _react2.default.createElement(
            'div',
            { className: 'header' },
            (0, _time.formatDuration)(itinerary.duration)
          ),
          _react2.default.createElement(
            'div',
            { className: 'detail' },
            (0, _time.formatTime)(itinerary.startTime, timeOptions),
            ' - ',
            (0, _time.formatTime)(itinerary.endTime, timeOptions)
          ),
          _react2.default.createElement(
            'div',
            { className: 'detail' },
            minTotalFare > 0 && _react2.default.createElement(
              'span',
              null,
              centsToString(minTotalFare),
              minTotalFare !== maxTotalFare && _react2.default.createElement(
                'span',
                null,
                ' - ',
                centsToString(maxTotalFare)
              ),
              _react2.default.createElement(
                'span',
                null,
                ' \u2022 '
              )
            ),
            Math.round(caloriesBurned),
            ' Cals'
          ),
          itinerary.transfers > 0 && _react2.default.createElement(
            'div',
            { className: 'detail' },
            itinerary.transfers,
            ' transfer',
            itinerary.transfers > 1 ? 's' : ''
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'routes' },
          itinerary.legs.filter(function (leg) {
            return !(leg.mode === 'WALK' && itinerary.transitTime > 0);
          }).map(function (leg, k) {
            var _getLegMode = (0, _itinerary.getLegMode)(companies, leg),
                legMode = _getLegMode.legMode;

            if (typeof customIcons.customModeForLeg === 'function') {
              var customMode = customIcons.customModeForLeg(leg);
              if (customMode) legMode = customMode;
            }
            return _react2.default.createElement(
              'div',
              { className: 'route-preview', key: k },
              _react2.default.createElement(
                'div',
                { className: 'mode-icon' },
                (0, _itinerary.getModeIcon)(legMode, customIcons)
              ),
              (0, _itinerary.isTransit)(leg.mode) ? _react2.default.createElement(
                'div',
                { className: 'short-name', style: { backgroundColor: getRouteColorForBadge(leg) } },
                getRouteNameForBadge(leg)
              ) : _react2.default.createElement('div', { style: { height: 30, overflow: 'hidden' } })
            );
          })
        )
      );
    }
  }]);
  return ItinerarySummary;
}(_react.Component), _class.propTypes = {
  itinerary: _propTypes2.default.object
}, _temp2);

// Helper functions

exports.default = ItinerarySummary;
function getRouteLongName(leg) {
  return leg.routes && leg.routes.length > 0 ? leg.routes[0].longName : leg.routeLongName;
}

function getRouteNameForBadge(leg) {
  var shortName = leg.routes && leg.routes.length > 0 ? leg.routes[0].shortName : leg.routeShortName;

  var longName = getRouteLongName(leg);

  // check for max
  if (longName && longName.toLowerCase().startsWith('max')) return null;

  // check for streetcar
  if (longName && longName.startsWith('Portland Streetcar')) return longName.split('-')[1].trim().split(' ')[0];

  return shortName || longName;
}

function getRouteColorForBadge(leg) {
  return leg.routeColor ? '#' + leg.routeColor : defaultRouteColor;
}
module.exports = exports['default'];

//# sourceMappingURL=itin-summary.js