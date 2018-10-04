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

var _class, _temp; // import moment from 'moment'

// import { SingleDatePicker } from 'react-dates'


var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _moment = require('moment');

var _moment2 = _interopRequireDefault(_moment);

var _form = require('../../actions/form');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DateTimeSelector = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(DateTimeSelector, _Component);

  function DateTimeSelector(props) {
    (0, _classCallCheck3.default)(this, DateTimeSelector);

    var _this = (0, _possibleConstructorReturn3.default)(this, (DateTimeSelector.__proto__ || (0, _getPrototypeOf2.default)(DateTimeSelector)).call(this, props));

    _this._onDepartChange = function (evt) {
      _this.props.setQueryParam({ departArrive: evt.target.value });
      if (evt.target.value === 'NOW') {
        _this.props.setQueryParam({
          date: (0, _moment2.default)().format('YYYY-MM-DD'),
          time: (0, _moment2.default)().format('HH:mm')
        });
      }
    };

    _this._onDateChange = function (evt) {
      _this.props.setQueryParam({ date: evt.target.value });
    };

    _this._onDayOfWeekChange = function (evt) {
      _this.props.setQueryParam({
        date: (0, _moment2.default)().weekday(evt.target.value).format('YYYY-MM-DD')
      });
    };

    _this._onEndTimeChange = function (evt) {
      _this.props.setQueryParam({ endTime: evt.target.value });
    };

    _this._onStartTimeChange = function (evt) {
      _this.props.setQueryParam({ startTime: evt.target.value });
    };

    _this._onTimeChange = function (evt) {
      _this.props.setQueryParam({ time: evt.target.value });
    };

    _this.state = {
      dateFocused: false
    };
    return _this;
  }

  (0, _createClass3.default)(DateTimeSelector, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          departArrive = _props.departArrive,
          date = _props.date,
          time = _props.time,
          startTime = _props.startTime,
          endTime = _props.endTime;

      var options = ['NOW', 'DEPART', 'ARRIVE'];
      // TODO: choose date / time selectors (currently Chrome optimized)

      if (this.props.profile) {
        var dowOptions = [{
          text: 'WEEKDAY',
          weekday: 3
        }, {
          text: 'SATURDAY',
          weekday: 6
        }, {
          text: 'SUNDAY',
          weekday: 0
        }];

        return _react2.default.createElement(
          _reactBootstrap.Form,
          null,
          _react2.default.createElement(
            _reactBootstrap.FormGroup,
            { style: { marginBottom: '15px' }, className: 'date-time-selector' },
            _react2.default.createElement(
              _reactBootstrap.Row,
              null,
              _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 12 },
                _react2.default.createElement(
                  _reactBootstrap.FormControl,
                  {
                    componentClass: 'select',
                    style: { width: '100%' },
                    onChange: this._onDayOfWeekChange
                  },
                  dowOptions.map(function (o, i) {
                    return _react2.default.createElement(
                      'option',
                      { key: i, value: o.weekday },
                      o.text
                    );
                  })
                )
              )
            ),
            _react2.default.createElement(
              _reactBootstrap.Row,
              { style: { marginTop: 20 } },
              _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 5 },
                _react2.default.createElement(_reactBootstrap.FormControl, {
                  className: 'time-selector',
                  type: 'time',
                  value: startTime,
                  style: { width: '100%' },
                  onChange: this._onStartTimeChange
                })
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 2 },
                'TO'
              ),
              _react2.default.createElement(
                _reactBootstrap.Col,
                { xs: 5 },
                _react2.default.createElement(_reactBootstrap.FormControl, {
                  className: 'time-selector',
                  type: 'time',
                  value: endTime,
                  style: { width: '100%' },
                  onChange: this._onEndTimeChange
                })
              )
            )
          )
        );
      }

      return _react2.default.createElement(
        _reactBootstrap.Form,
        null,
        _react2.default.createElement(
          _reactBootstrap.FormGroup,
          { style: { marginBottom: '15px' }, className: 'date-time-selector' },
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 12 },
              _react2.default.createElement(
                _reactBootstrap.FormControl,
                {
                  componentClass: 'select',
                  value: departArrive,
                  onChange: this._onDepartChange,
                  style: { width: '100%' }
                },
                options.map(function (o, i) {
                  return _react2.default.createElement(
                    'option',
                    { key: i, value: o },
                    o
                  );
                })
              )
            )
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            { style: { marginTop: 20 } },
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6 },
              _react2.default.createElement(_reactBootstrap.FormControl, {
                className: 'time-selector',
                type: 'time',
                value: time,
                onChange: this._onTimeChange,
                style: { width: '100%', display: departArrive === 'NOW' && 'none' }
              })
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6 },
              _react2.default.createElement(_reactBootstrap.FormControl, {
                className: 'date-selector',
                type: 'date',
                value: date,
                onChange: this._onDateChange,
                style: { width: '100%', display: departArrive === 'NOW' && 'none' }
              })
            )
          )
        )
      );
    }
  }]);
  return DateTimeSelector;
}(_react.Component), _class.propTypes = {
  date: _react.PropTypes.string,
  departArrive: _react.PropTypes.string,
  time: _react.PropTypes.string,
  location: _react.PropTypes.object,
  label: _react.PropTypes.string,
  profile: _react.PropTypes.bool,
  startTime: _react.PropTypes.string,
  endTime: _react.PropTypes.string,

  setQueryParam: _react.PropTypes.func,
  type: _react.PropTypes.string // replace with locationType?
}, _temp);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var _state$otp$currentQue = state.otp.currentQuery,
      departArrive = _state$otp$currentQue.departArrive,
      date = _state$otp$currentQue.date,
      time = _state$otp$currentQue.time,
      startTime = _state$otp$currentQue.startTime,
      endTime = _state$otp$currentQue.endTime;

  return {
    config: state.otp.config,
    departArrive: departArrive,
    date: date,
    time: time,
    startTime: startTime,
    endTime: endTime
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimeSelector);
module.exports = exports['default'];

//# sourceMappingURL=date-time-selector.js