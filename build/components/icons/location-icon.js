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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var LocationIcon = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(LocationIcon, _Component);

  function LocationIcon() {
    (0, _classCallCheck3.default)(this, LocationIcon);
    return (0, _possibleConstructorReturn3.default)(this, (LocationIcon.__proto__ || (0, _getPrototypeOf2.default)(LocationIcon)).apply(this, arguments));
  }

  (0, _createClass3.default)(LocationIcon, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          type = _props.type,
          className = _props.className,
          style = _props.style;

      // from: #f5a81c
      // to: '#8ec449

      var classNameArr = ['fa', type + '-location-icon'];
      if (type === 'from') classNameArr.push('fa-map-marker');else if (type === 'to') classNameArr.push('fa-dot-circle-o');
      if (className) classNameArr = classNameArr.concat(className.split(' '));

      return _react2.default.createElement('i', { className: classNameArr.join(' '), style: style });
    }
  }]);
  return LocationIcon;
}(_react.Component), _class.propTypes = {
  type: _react.PropTypes.string,
  className: _react.PropTypes.string,
  style: _react.PropTypes.object
}, _temp);
exports.default = LocationIcon;
module.exports = exports['default'];

//# sourceMappingURL=location-icon.js