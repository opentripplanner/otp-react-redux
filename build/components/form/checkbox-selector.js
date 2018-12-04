'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _defineProperty2 = require('babel-runtime/helpers/defineProperty');

var _defineProperty3 = _interopRequireDefault(_defineProperty2);

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

var _form = require('../../actions/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CheckboxSelector = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(CheckboxSelector, _Component);

  function CheckboxSelector() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, CheckboxSelector);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = CheckboxSelector.__proto__ || (0, _getPrototypeOf2.default)(CheckboxSelector)).call.apply(_ref, [this].concat(args))), _this), _this._onQueryParamChange = function (evt) {
      _this.props.setQueryParam((0, _defineProperty3.default)({}, _this.props.name, evt.target.checked));
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(CheckboxSelector, [{
    key: 'render',
    value: function render() {
      var label = this.props.label;

      var value = this.props.value;
      if (typeof value === 'string') value = value === 'true';

      return _react2.default.createElement(
        'div',
        null,
        _react2.default.createElement(
          _reactBootstrap.Row,
          null,
          _react2.default.createElement(
            _reactBootstrap.Col,
            { xs: 12, className: 'setting-label' },
            _react2.default.createElement(
              _reactBootstrap.Form,
              null,
              _react2.default.createElement(
                _reactBootstrap.FormGroup,
                null,
                _react2.default.createElement(
                  _reactBootstrap.Checkbox,
                  { checked: value, style: { margin: 'none' }, onChange: this._onQueryParamChange },
                  label
                )
              )
            )
          )
        )
      );
    }
  }]);
  return CheckboxSelector;
}(_react.Component), _class.propTypes = {
  name: _react.PropTypes.string,
  value: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.bool]),
  label: _react.PropTypes.string,
  setQueryParam: _react.PropTypes.func
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = { setQueryParam: _form.setQueryParam };

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(CheckboxSelector);
module.exports = exports['default'];

//# sourceMappingURL=checkbox-selector.js