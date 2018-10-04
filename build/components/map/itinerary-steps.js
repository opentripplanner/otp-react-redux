'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

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

var _leaflet = require('leaflet');

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactLeaflet = require('react-leaflet');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItinerarySteps = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItinerarySteps, _Component);

  function ItinerarySteps() {
    (0, _classCallCheck3.default)(this, ItinerarySteps);
    return (0, _possibleConstructorReturn3.default)(this, (ItinerarySteps.__proto__ || (0, _getPrototypeOf2.default)(ItinerarySteps)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItinerarySteps, [{
    key: 'addItineraryStop',
    value: function addItineraryStop(array, item) {
      if (item.stopId && array.indexOf(item.stopId) === -1) {
        array.push(item);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          itinerary = _props.itinerary,
          activeLeg = _props.activeLeg,
          activeStep = _props.activeStep;

      var steps = [];
      itinerary.legs.map(function (l, legIndex) {
        steps = [].concat((0, _toConsumableArray3.default)(steps), (0, _toConsumableArray3.default)(l.steps.map(function (s, stepIndex) {
          s.legIndex = legIndex;
          s.stepIndex = stepIndex;
          return s;
        })));
      });
      return _react2.default.createElement(
        'div',
        null,
        steps.map(function (step, index) {
          if (step.relativeDirection === 'DEPART') {
            return null;
          }
          var active = step.legIndex === activeLeg && step.stepIndex === activeStep;
          var icon = (0, _leaflet.divIcon)({
            html: '<i class="fa fa-circle-o" style="' + (active ? 'color: #ffffff' : '') + '"></i>',
            className: ''
          });
          return _react2.default.createElement(_reactLeaflet.Marker, {
            icon: icon,
            title: (0, _itinerary.getStepInstructions)(step),
            position: [step.lat, step.lon],
            key: index
          });
        })
      );
    }
  }]);
  return ItinerarySteps;
}(_react.Component), _class.propTypes = {
  itinerary: _react.PropTypes.object
}, _temp);
exports.default = ItinerarySteps;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-steps.js