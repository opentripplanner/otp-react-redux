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

var _accessLeg = require('./access-leg');

var _accessLeg2 = _interopRequireDefault(_accessLeg);

var _transitLeg = require('./transit-leg');

var _transitLeg2 = _interopRequireDefault(_transitLeg);

var _itinerary = require('../../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItineraryDetails = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryDetails, _Component);

  function ItineraryDetails() {
    (0, _classCallCheck3.default)(this, ItineraryDetails);
    return (0, _possibleConstructorReturn3.default)(this, (ItineraryDetails.__proto__ || (0, _getPrototypeOf2.default)(ItineraryDetails)).apply(this, arguments));
  }

  (0, _createClass3.default)(ItineraryDetails, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          itinerary = _props.itinerary,
          activeLeg = _props.activeLeg,
          activeStep = _props.activeStep,
          setActiveLeg = _props.setActiveLeg,
          setActiveStep = _props.setActiveStep;

      return _react2.default.createElement(
        'div',
        { className: 'detail' },
        itinerary.legs.map(function (leg, index) {
          var legIsActive = activeLeg === index;
          return (0, _itinerary.isTransit)(leg.mode) ? _react2.default.createElement(_transitLeg2.default, {
            active: legIsActive,
            index: index,
            key: index,
            leg: leg,
            setActiveLeg: setActiveLeg }) : _react2.default.createElement(_accessLeg2.default, {
            active: legIsActive,
            activeStep: activeStep,
            index: index,
            key: index,
            leg: leg,
            setActiveLeg: setActiveLeg,
            setActiveStep: setActiveStep });
        })
      );
    }
  }]);
  return ItineraryDetails;
}(_react.Component), _class.propTypes = {
  itinerary: _react.PropTypes.object
}, _temp);
exports.default = ItineraryDetails;
module.exports = exports['default'];

//# sourceMappingURL=itinerary-details.js