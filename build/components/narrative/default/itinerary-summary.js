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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _modeIcon = require('../../icons/mode-icon');

var _modeIcon2 = _interopRequireDefault(_modeIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItinerarySummary = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItinerarySummary, _Component);

  function ItinerarySummary() {
    (0, _classCallCheck3.default)(this, ItinerarySummary);
    return (0, _possibleConstructorReturn3.default)(this, (ItinerarySummary.__proto__ || (0, _getPrototypeOf2.default)(ItinerarySummary)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItinerarySummary, [{
    key: 'render',
    value: function render() {
      var itinerary = this.props.itinerary;


      var blocks = [];
      itinerary.legs.forEach(function (leg, i) {
        // Skip mid-itinerary walk transfer legs
        if (i > 0 && i < itinerary.legs.length - 1 && !leg.transitLeg && itinerary.legs[i - 1].transitLeg && itinerary.legs[i + 1].transitLeg) {
          return null;
        }

        // Add the mode icon
        blocks.push(_react2.default.createElement(
          'div',
          { className: 'summary-block mode-block' },
          _react2.default.createElement(_modeIcon2.default, { mode: leg.mode })
        ));

        // If a transit leg, add the name (preferably short; long if needed)
        if (leg.transitLeg) {
          blocks.push(_react2.default.createElement(
            'div',
            { className: 'summary-block name-block' },
            _react2.default.createElement(
              'span',
              { className: 'route-short-name' },
              leg.routeShortName || leg.routeLongName
            )
          ));
        }

        // If not the last leg, add a '►'
        if (i < itinerary.legs.length - 1) {
          blocks.push(_react2.default.createElement(
            'div',
            { className: 'summary-block arrow-block' },
            '\u25BA'
          ));
        }
      });

      return _react2.default.createElement(
        'div',
        { className: 'summary' },
        blocks
      );
    }
  }]);
  return ItinerarySummary;
}(_react.Component), _class.propTypes = {
  itinerary: _react.PropTypes.object
}, _temp);
exports.default = ItinerarySummary;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-summary.js