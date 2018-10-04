'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var SwitchButton = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(SwitchButton, _Component);

  function SwitchButton() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, SwitchButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = SwitchButton.__proto__ || (0, _getPrototypeOf2.default)(SwitchButton)).call.apply(_ref, [this].concat(args))), _this), _this._onClick = function () {
      _this.props.switchLocations();
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(SwitchButton, [{
    key: 'render',
    value: function render() {
      var content = this.props.content;

      return _react2.default.createElement(
        _reactBootstrap.Button,
        { className: 'switch-button',
          onClick: this._onClick || this.props.onClick
        },
        content
      );
    }
  }]);
  return SwitchButton;
}(_react.Component), _class.propTypes = {
  onClick: _react.PropTypes.func,
  switchLocations: _react.PropTypes.func
}, _class.defaultProps = {
  content: 'Switch'
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = function mapDispatchToProps(dispatch, ownProps) {
  return {
    switchLocations: function switchLocations() {
      dispatch((0, _map.switchLocations)());
    }
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(SwitchButton);
module.exports = exports['default'];

//# sourceMappingURL=switch-button.js