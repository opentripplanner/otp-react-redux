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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var NarrativeItinerary = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(NarrativeItinerary, _Component);

  function NarrativeItinerary() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, NarrativeItinerary);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = NarrativeItinerary.__proto__ || (0, _getPrototypeOf2.default)(NarrativeItinerary)).call.apply(_ref, [this].concat(args))), _this), _this._onHeaderClick = function () {
      var _this$props = _this.props,
          active = _this$props.active,
          index = _this$props.index,
          onClick = _this$props.onClick,
          routingType = _this$props.routingType,
          setActiveItinerary = _this$props.setActiveItinerary;

      if (onClick) {
        onClick();
      } else if (!active) {
        setActiveItinerary(index);
      } else if (routingType === 'PROFILE') {
        setActiveItinerary(null);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(NarrativeItinerary, [{
    key: 'render',
    value: function render() {
      throw new Error('render() called on abstract class NarrativeItinerary');
    }
  }]);
  return NarrativeItinerary;
}(_react.Component), _class.propTypes = {
  active: _react.PropTypes.bool,
  activeLeg: _react.PropTypes.number,
  activeStep: _react.PropTypes.number,
  expanded: _react.PropTypes.bool,
  index: _react.PropTypes.number,
  itinerary: _react.PropTypes.object,
  onClick: _react.PropTypes.func,
  routingType: _react.PropTypes.string,
  setActiveItinerary: _react.PropTypes.func,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func
}, _temp2);
exports.default = NarrativeItinerary;
module.exports = exports['default'];

//# sourceMappingURL=narrative-itinerary.js