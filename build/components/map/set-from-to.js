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

var _reactBootstrap = require('react-bootstrap');

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SetFromToButtons = function (_Component) {
  (0, _inherits3.default)(SetFromToButtons, _Component);

  function SetFromToButtons() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, SetFromToButtons);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = SetFromToButtons.__proto__ || (0, _getPrototypeOf2.default)(SetFromToButtons)).call.apply(_ref, [this].concat(args))), _this), _this._setLocation = function (type) {
      _this.props.setLocation({
        type: type,
        location: _this.props.location,
        reverseGeocode: false
      });
      _this.props.map.closePopup();
    }, _this._setFromClicked = function () {
      _this._setLocation('from');
    }, _this._setToClicked = function () {
      _this._setLocation('to');
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(SetFromToButtons, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        'div',
        { style: { display: 'inline-block' } },
        _react2.default.createElement(
          'span',
          null,
          'Set as: '
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsSize: 'xsmall', className: 'set-from-button',
            onClick: this._setFromClicked
          },
          _react2.default.createElement(_locationIcon2.default, { type: 'from' }),
          ' Start'
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          { bsSize: 'xsmall', className: 'set-to-button',
            onClick: this._setToClicked
          },
          _react2.default.createElement(_locationIcon2.default, { type: 'to' }),
          ' End'
        )
      );
    }
  }]);
  return SetFromToButtons;
}(_react.Component);

exports.default = SetFromToButtons;
module.exports = exports['default'];

//# sourceMappingURL=set-from-to.js