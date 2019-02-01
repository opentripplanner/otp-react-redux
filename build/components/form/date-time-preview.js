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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateTimePreview = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(DateTimePreview, _Component);

  function DateTimePreview() {
    (0, _classCallCheck3.default)(this, DateTimePreview);
    return (0, _possibleConstructorReturn3.default)(this, (DateTimePreview.__proto__ || (0, _getPrototypeOf2.default)(DateTimePreview)).apply(this, arguments));
  }

  (0, _createClass3.default)(DateTimePreview, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          caret = _props.caret,
          date = _props.date,
          editButtonText = _props.editButtonText,
          time = _props.time,
          departArrive = _props.departArrive,
          routingType = _props.routingType,
          startTime = _props.startTime,
          endTime = _props.endTime;


      var timeStr = void 0;
      if (routingType === 'ITINERARY') {
        if (departArrive === 'NOW') timeStr = 'Leave now';else if (departArrive === 'ARRIVE') timeStr = 'Arrive ' + time;else if (departArrive === 'DEPART') timeStr = 'Depart ' + time;
      } else if (routingType === 'PROFILE') {
        timeStr = startTime + ' to ' + endTime;
      }

      var summary = _react2.default.createElement(
        'div',
        { className: 'summary' },
        _react2.default.createElement('i', { className: 'fa fa-calendar' }),
        ' ',
        (0, _moment2.default)(date).calendar().split(' ')[0],
        _react2.default.createElement('br', null),
        _react2.default.createElement('i', { className: 'fa fa-clock-o' }),
        ' ',
        timeStr
      );

      var button = _react2.default.createElement(
        'div',
        { className: 'button-container' },
        _react2.default.createElement(
          _reactBootstrap.Button,
          { onClick: this.props.onClick },
          editButtonText,
          caret && _react2.default.createElement(
            'span',
            null,
            ' ',
            _react2.default.createElement('i', { className: 'fa fa-caret-' + caret })
          )
        )
      );

      return _react2.default.createElement(
        'div',
        { className: 'settings-preview', onClick: this.props.onClick },
        summary,
        button,
        _react2.default.createElement('div', { style: { clear: 'both' } })
      );
    }
  }]);
  return DateTimePreview;
}(_react.Component), _class.propTypes = {
  caret: _react.PropTypes.string,
  compressed: _react.PropTypes.bool,
  date: _react.PropTypes.string,
  departArrive: _react.PropTypes.string,
  editButtonText: _react.PropTypes.element,
  time: _react.PropTypes.string,
  onClick: _react.PropTypes.func,
  routingType: _react.PropTypes.string
}, _class.defaultProps = {
  editButtonText: _react2.default.createElement('i', { className: 'fa fa-pencil' })
}, _temp);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      departArrive = _state$otp$currentQue.departArrive,
      date = _state$otp$currentQue.date,
      time = _state$otp$currentQue.time,
      routingType = _state$otp$currentQue.routingType,
      startTime = _state$otp$currentQue.startTime,
      endTime = _state$otp$currentQue.endTime;

  return {
    config: state.otp.config,
    routingType: routingType,
    departArrive: departArrive,
    date: date,
    time: time,
    startTime: startTime,
    endTime: endTime
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimePreview);
module.exports = exports['default'];

//# sourceMappingURL=date-time-preview.js