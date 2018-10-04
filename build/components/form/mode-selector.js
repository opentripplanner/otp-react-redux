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

var _form = require('../../actions/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ModeSelector = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ModeSelector, _Component);

  function ModeSelector() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ModeSelector);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ModeSelector.__proto__ || (0, _getPrototypeOf2.default)(ModeSelector)).call.apply(_ref, [this].concat(args))), _this), _this._onChange = function (evt) {
      console.log(evt.target.value);
      _this.props.setQueryParam({ mode: evt.target.value });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ModeSelector, [{
    key: '_getDisplayText',
    value: function _getDisplayText(mode) {
      switch (mode) {
        case 'TRANSIT,WALK':
          return 'Walk to Transit';
        case 'TRANSIT,BICYCLE':
          return 'Bike to Transit';
        case 'WALK':
          return 'Walk Only';
        case 'BICYCLE':
          return 'Bike Only';
      }
      return mode;
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          config = _props.config,
          mode = _props.mode,
          label = _props.label,
          showLabel = _props.showLabel;


      return _react2.default.createElement(
        'form',
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { className: 'mode-selector' },
          showLabel ? _react2.default.createElement(
            _reactBootstrap.ControlLabel,
            null,
            label
          ) : null,
          _react2.default.createElement(
            _reactBootstrap.FormControl,
            {
              componentClass: 'select',
              value: mode,
              onChange: this._onChange
            },
            config.modes.map(function (m, i) {
              return _react2.default.createElement(
                'option',
                { key: i, value: m },
                _this2._getDisplayText(m)
              );
            })
          )
        )
      );
    }
  }]);
  return ModeSelector;
}(_react.Component), _class.propTypes = {
  config: _react.PropTypes.object,
  label: _react.PropTypes.string,
  mode: _react.PropTypes.string,
  setQueryParam: _react.PropTypes.func,
  showLabel: _react.PropTypes.bool
}, _class.defaultProps = {
  label: 'Mode',
  showLabel: true
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    mode: state.otp.currentQuery.mode
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ModeSelector);
module.exports = exports['default'];

//# sourceMappingURL=mode-selector.js