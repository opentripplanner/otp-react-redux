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

var DropdownSelector = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(DropdownSelector, _Component);

  function DropdownSelector() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, DropdownSelector);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = DropdownSelector.__proto__ || (0, _getPrototypeOf2.default)(DropdownSelector)).call.apply(_ref, [this].concat(args))), _this), _this._onQueryParamChange = function (evt) {
      var val = evt.target.value;
      _this.props.setQueryParam((0, _defineProperty3.default)({}, _this.props.name, isNaN(val) ? val : parseFloat(val)));
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(DropdownSelector, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          value = _props.value,
          label = _props.label,
          options = _props.options;


      return _react2.default.createElement(
        _reactBootstrap.Row,
        null,
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 6, className: 'setting-label' },
          label
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 6 },
          _react2.default.createElement(
            _reactBootstrap.Form,
            null,
            _react2.default.createElement(
              _reactBootstrap.FormGroup,
              null,
              _react2.default.createElement(
                _reactBootstrap.FormControl,
                {
                  className: 'dropdown-selector',
                  componentClass: 'select',
                  value: value,
                  onChange: this._onQueryParamChange
                },
                options.map(function (o, i) {
                  return _react2.default.createElement(
                    'option',
                    { key: i, value: o.value },
                    o.text
                  );
                })
              )
            )
          )
        )
      );
    }
  }]);
  return DropdownSelector;
}(_react.Component), _class.propTypes = {
  name: _react.PropTypes.string,
  value: _react.PropTypes.oneOfType([_react.PropTypes.string, _react.PropTypes.number]),
  label: _react.PropTypes.string,
  options: _react.PropTypes.array,
  setQueryParam: _react.PropTypes.func
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = { setQueryParam: _form.setQueryParam };

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DropdownSelector);
module.exports = exports['default'];

//# sourceMappingURL=dropdown-selector.js