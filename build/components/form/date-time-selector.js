"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("core-js/modules/es7.symbol.async-iterator");

require("core-js/modules/es6.symbol");

var _react = _interopRequireWildcard(require("react"));

var _propTypes = _interopRequireDefault(require("prop-types"));

var _reactBootstrap = require("react-bootstrap");

var _reactRedux = require("react-redux");

var _moment = _interopRequireDefault(require("moment"));

var _form = require("../../actions/form");

var _time = require("../../util/time");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var DateTimeSelector =
/*#__PURE__*/
function (_Component) {
  _inherits(DateTimeSelector, _Component);

  function DateTimeSelector(props) {
    var _this;

    _classCallCheck(this, DateTimeSelector);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(DateTimeSelector).call(this, props));

    _defineProperty(_assertThisInitialized(_this), "_onDateChange", function (evt) {
      _this.props.setQueryParam({
        date: evt.target.value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onDayOfWeekChange", function (evt) {
      _this.props.setQueryParam({
        date: (0, _moment.default)().weekday(evt.target.value).format(_time.OTP_API_DATE_FORMAT)
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onEndTimeChange", function (evt) {
      _this.props.setQueryParam({
        endTime: evt.target.value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onStartTimeChange", function (evt) {
      _this.props.setQueryParam({
        startTime: evt.target.value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onTimeChange", function (evt) {
      _this.props.setQueryParam({
        time: evt.target.value
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onBackupTimeChange", function (evt) {
      var _this$props = _this.props,
          setQueryParam = _this$props.setQueryParam,
          timeFormat = _this$props.timeFormat;
      var time = (0, _moment.default)(evt.target.value, timeFormat).format(_time.OTP_API_TIME_FORMAT);
      setQueryParam({
        time: time
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_onBackupDateChange", function (evt) {
      var _this$props2 = _this.props,
          setQueryParam = _this$props2.setQueryParam,
          dateFormat = _this$props2.dateFormat;
      var date = (0, _moment.default)(evt.target.value, dateFormat).format(_time.OTP_API_DATE_FORMAT);
      setQueryParam({
        date: date
      });
    });

    _defineProperty(_assertThisInitialized(_this), "_setDepartArrive", function (type) {
      var setQueryParam = _this.props.setQueryParam;
      setQueryParam({
        departArrive: type
      });

      if (type === 'NOW') {
        setQueryParam({
          date: (0, _moment.default)().format(_time.OTP_API_DATE_FORMAT),
          time: (0, _moment.default)().format(_time.OTP_API_TIME_FORMAT)
        });
      }
    });

    _this.state = {
      dateFocused: false
    };
    return _this;
  }

  _createClass(DateTimeSelector, [{
    key: "componentWillMount",
    value: function componentWillMount() {
      var checkInput = function checkInput(type) {
        var input = document.createElement('input');
        input.setAttribute('type', type);
        return input.type === type;
      };

      this._supportsDateTimeInputs = checkInput('date') && checkInput('time');
    }
  }, {
    key: "render",
    value: function render() {
      var _this2 = this;

      var _this$props3 = this.props,
          departArrive = _this$props3.departArrive,
          date = _this$props3.date,
          time = _this$props3.time,
          timeFormat = _this$props3.timeFormat,
          dateFormat = _this$props3.dateFormat; // TODO: restore for profile mode

      /* if (this.props.profile) {
        const dowOptions = [{
          text: 'WEEKDAY',
          weekday: 3
        }, {
          text: 'SATURDAY',
          weekday: 6
        }, {
          text: 'SUNDAY',
          weekday: 0
        }]
         return (
          <Form>
            <FormGroup style={{marginBottom: '15px'}} className='date-time-selector'>
              <Row>
                <Col xs={12}>
                  <FormControl
                    className='dropdown-selector'
                    componentClass='select'
                    style={{width: '100%'}}
                    onChange={this._onDayOfWeekChange}
                  >
                    {dowOptions.map((o, i) => (
                      <option key={i} value={o.weekday}>{o.text}</option>
                    ))}
                  </FormControl>
                </Col>
              </Row>
              <Row style={{ marginTop: 20 }}>
                <Col xs={5}>
                  <FormControl
                    className='time-selector'
                    type='time'
                    required='true'
                    value={startTime}
                    style={{width: '100%'}}
                    onChange={this._onStartTimeChange}
                  />
                </Col>
                <Col xs={2}>TO</Col>
                <Col xs={5}>
                  <FormControl
                    className='time-selector'
                    type='time'
                    required='true'
                    value={endTime}
                    style={{width: '100%'}}
                    onChange={this._onEndTimeChange}
                  />
                </Col>
              </Row>
            </FormGroup>
          </Form>
        )
      } */

      return _react.default.createElement(_reactBootstrap.Form, null, _react.default.createElement(_reactBootstrap.FormGroup, {
        style: {
          marginBottom: '15px'
        },
        className: "date-time-selector"
      }, _react.default.createElement(_reactBootstrap.Row, null, ['NOW', 'DEPART', 'ARRIVE'].map(function (type, i) {
        return _react.default.createElement(_reactBootstrap.Col, {
          key: i,
          xs: 4
        }, _react.default.createElement(DateOptionButton, {
          type: type,
          active: departArrive === type,
          setDepartArrive: _this2._setDepartArrive
        }));
      })), departArrive !== 'NOW' && !this._supportsDateTimeInputs && _react.default.createElement(_reactBootstrap.Row, {
        style: {
          marginTop: 20
        }
      }, _react.default.createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react.default.createElement(_reactBootstrap.FormControl, {
        className: "time-selector",
        type: "text",
        defaultValue: (0, _moment.default)(time, _time.OTP_API_TIME_FORMAT).format(timeFormat),
        required: "true",
        onChange: this._onBackupTimeChange
      })), _react.default.createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react.default.createElement(_reactBootstrap.FormControl, {
        className: "date-selector",
        type: "text",
        defaultValue: (0, _moment.default)(date, _time.OTP_API_DATE_FORMAT).format(dateFormat),
        required: "true",
        onChange: this._onBackupDateChange
      }))), departArrive !== 'NOW' && this._supportsDateTimeInputs && _react.default.createElement(_reactBootstrap.Row, {
        style: {
          marginTop: 20
        }
      }, _react.default.createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react.default.createElement(_reactBootstrap.FormControl, {
        className: "time-selector",
        type: "time",
        value: time,
        required: "true",
        onChange: this._onTimeChange,
        style: {
          width: '100%',
          display: departArrive === 'NOW' && 'none'
        }
      })), _react.default.createElement(_reactBootstrap.Col, {
        xs: 6
      }, _react.default.createElement(_reactBootstrap.FormControl, {
        className: "date-selector",
        type: "date",
        value: date,
        required: "true",
        onChange: this._onDateChange,
        style: {
          width: '100%',
          display: departArrive === 'NOW' && 'none'
        }
      })))));
    }
  }]);

  return DateTimeSelector;
}(_react.Component);

_defineProperty(DateTimeSelector, "propTypes", {
  date: _propTypes.default.string,
  departArrive: _propTypes.default.string,
  time: _propTypes.default.string,
  location: _propTypes.default.object,
  label: _propTypes.default.string,
  profile: _propTypes.default.bool,
  startTime: _propTypes.default.string,
  endTime: _propTypes.default.string,
  setQueryParam: _propTypes.default.func,
  type: _propTypes.default.string // replace with locationType?

});

var DateOptionButton =
/*#__PURE__*/
function (_Component2) {
  _inherits(DateOptionButton, _Component2);

  function DateOptionButton() {
    var _getPrototypeOf2;

    var _this3;

    _classCallCheck(this, DateOptionButton);

    for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    _this3 = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(DateOptionButton)).call.apply(_getPrototypeOf2, [this].concat(args)));

    _defineProperty(_assertThisInitialized(_this3), "_onClick", function () {
      _this3.props.setDepartArrive(_this3.props.type);
    });

    return _this3;
  }

  _createClass(DateOptionButton, [{
    key: "render",
    value: function render() {
      var _this$props4 = this.props,
          active = _this$props4.active,
          type = _this$props4.type;
      var text = type;
      if (type === 'NOW') text = 'Leave now';
      if (type === 'DEPART') text = 'Depart at';
      if (type === 'ARRIVE') text = 'Arrive by';
      var classNames = ['date-option-button', 'select-button'];
      if (active) classNames.push('active');
      return _react.default.createElement(_reactBootstrap.Button, {
        className: classNames.join(' '),
        onClick: this._onClick
      }, text);
    }
  }]);

  return DateOptionButton;
}(_react.Component);

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
    endTime: endTime,
    timeFormat: (0, _time.getTimeFormat)(state.otp.config),
    dateFormat: (0, _time.getDateFormat)(state.otp.config)
  };
};

var mapDispatchToProps = {
  setQueryParam: _form.setQueryParam
};

var _default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DateTimeSelector);

exports.default = _default;
module.exports = exports.default;

//# sourceMappingURL=date-time-selector.js