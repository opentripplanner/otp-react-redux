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

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NarrativeProfileSummary = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(NarrativeProfileSummary, _Component);

  function NarrativeProfileSummary() {
    (0, _classCallCheck3.default)(this, NarrativeProfileSummary);
    return (0, _possibleConstructorReturn3.default)(this, (NarrativeProfileSummary.__proto__ || (0, _getPrototypeOf2.default)(NarrativeProfileSummary)).apply(this, arguments));
  }

  (0, _createClass3.default)(NarrativeProfileSummary, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var options = this.props.options;


      var bestTransit = 0;
      var walk = 0;
      var bicycle = 0;
      var bicycleRent = 0;

      options.forEach(function (option, i) {
        if (option.transit) {
          if (option.time < bestTransit || bestTransit === 0) {
            bestTransit = option.time;
          }
        } else {
          if (option.modes.length === 1 && option.modes[0] === 'bicycle') bicycle = option.time;else if (option.modes.length === 1 && option.modes[0] === 'walk') walk = option.time;else if (option.modes.indexOf('bicycle_rent') !== -1) bicycleRent = option.time;
        }
      });

      var summary = [{
        icon: 'BUS',
        title: 'Transit',
        time: bestTransit
      }, {
        icon: 'BICYCLE',
        title: 'Bicycle',
        time: bicycle
      }, {
        icon: 'BICYCLE_RENT',
        title: 'Bikeshare',
        time: bicycleRent
      }, {
        icon: 'WALK',
        title: 'Walk',
        time: walk
      }];

      return _react2.default.createElement(
        'div',
        { style: {} },
        summary.map(function (option, k) {
          return _react2.default.createElement(
            'div',
            { key: k, style: {
                backgroundColor: option.time > 0 ? '#084C8D' : '#bbb',
                width: '22%',
                display: 'inline-block',
                verticalAlign: 'top',
                marginRight: k < 3 ? '4%' : 0,
                padding: '3px',
                textAlign: 'center',
                color: 'white' }
            },
            _react2.default.createElement(
              'div',
              { style: { height: '24px', width: '24px', display: 'inline-block', fill: 'white', marginTop: '6px', textAlign: 'center' } },
              (0, _itinerary.getModeIcon)(option.icon, _this2.props.customIcons)
            ),
            _react2.default.createElement(
              'div',
              { style: { fontSize: '10px', textAlign: 'center', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '2px' } },
              option.title
            ),
            _react2.default.createElement(
              'div',
              { style: { textAlign: 'center', marginTop: '2px', height: '30px' } },
              option.time > 0 ? _react2.default.createElement(
                'span',
                null,
                _react2.default.createElement(
                  'span',
                  { style: { fontSize: 24, fontWeight: '500' } },
                  Math.round(option.time / 60)
                ),
                ' min'
              ) : _react2.default.createElement(
                'span',
                { style: { fontSize: '11px' } },
                '(Not Found)'
              )
            )
          );
        })
      );
    }
  }]);
  return NarrativeProfileSummary;
}(_react.Component), _class.propTypes = {
  options: _react.PropTypes.array,
  customIcons: _react.PropTypes.object
}, _temp);
exports.default = NarrativeProfileSummary;
module.exports = exports['default'];

//# sourceMappingURL=narrative-profile-summary.js