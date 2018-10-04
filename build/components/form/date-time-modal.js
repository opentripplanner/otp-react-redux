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

var _class, _temp; // import necessary React/Redux libraries


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _dateTimeSelector = require('./date-time-selector');

var _dateTimeSelector2 = _interopRequireDefault(_dateTimeSelector);

var _form = require('../../actions/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Define default routingType labels and components
var rtDefaults = [{
  key: 'ITINERARY',
  text: 'Itinerary',
  component: _react2.default.createElement(_dateTimeSelector2.default, null)
}, {
  key: 'PROFILE',
  text: 'Profile',
  component: _react2.default.createElement(_dateTimeSelector2.default, { profile: true })
}];

var DateTimeModal = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(DateTimeModal, _Component);

  function DateTimeModal() {
    (0, _classCallCheck3.default)(this, DateTimeModal);
    return (0, _possibleConstructorReturn3.default)(this, (DateTimeModal.__proto__ || (0, _getPrototypeOf2.default)(DateTimeModal)).apply(this, arguments));
  }

  (0, _createClass3.default)(DateTimeModal, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          config = _props.config,
          routingType = _props.routingType,
          setQueryParam = _props.setQueryParam;


      return _react2.default.createElement(
        'div',
        { className: 'date-time-modal' },
        config.routingTypes.length > 1 && _react2.default.createElement(
          'div',
          { className: 'button-row' },
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            { justified: true },
            config.routingTypes.map(function (rtConfig) {
              return _react2.default.createElement(
                _reactBootstrap.ButtonGroup,
                { key: rtConfig.key },
                _react2.default.createElement(
                  _reactBootstrap.Button,
                  {
                    className: rtConfig.key === routingType ? 'selected' : '',
                    onClick: function onClick() {
                      setQueryParam({ routingType: rtConfig.key });
                    }
                  },
                  rtConfig.text || rtDefaults.find(function (d) {
                    return d.key === rtConfig.key;
                  }).text
                )
              );
            })
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'main-panel' },
          rtDefaults.find(function (d) {
            return d.key === routingType;
          }).component
        )
      );
    }
  }]);
  return DateTimeModal;
}(_react.Component), _class.propTypes = {
  routingType: _react.PropTypes.string,
  setQueryParam: _react.PropTypes.func
}, _temp);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      departArrive = _state$otp$currentQue.departArrive,
      date = _state$otp$currentQue.date,
      time = _state$otp$currentQue.time,
      routingType = _state$otp$currentQue.routingType;

  return {
    config: state.otp.config,
    departArrive: departArrive,
    date: date,
    time: time,
    routingType: routingType
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimeModal);
module.exports = exports['default'];

//# sourceMappingURL=date-time-modal.js