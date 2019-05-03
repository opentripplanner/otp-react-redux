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

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _distance = require('../../util/distance');

var _itinerary = require('../../util/itinerary');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var AccessLeg = function (_Component) {
  (0, _inherits3.default)(AccessLeg, _Component);

  function AccessLeg() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, AccessLeg);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = AccessLeg.__proto__ || (0, _getPrototypeOf2.default)(AccessLeg)).call.apply(_ref, [this].concat(args))), _this), _this._onLegClick = function (e) {
      var _this$props = _this.props,
          active = _this$props.active,
          leg = _this$props.leg,
          index = _this$props.index,
          setActiveLeg = _this$props.setActiveLeg;

      if (active) {
        setActiveLeg(null);
      } else {
        setActiveLeg(index, leg);
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(AccessLeg, [{
    key: '_onStepClick',
    value: function _onStepClick(e, step, index) {
      if (index === this.props.activeStep) {
        this.props.setActiveStep(null);
      } else {
        this.props.setActiveStep(index, step);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          active = _props.active,
          activeStep = _props.activeStep,
          index = _props.index,
          leg = _props.leg;

      return _react2.default.createElement(
        'div',
        {
          key: index,
          className: 'leg' + (active ? ' active' : '') },
        _react2.default.createElement(
          'button',
          {
            className: 'header',
            onClick: this._onLegClick
          },
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_icon2.default, { type: 'caret-' + (active ? 'down' : 'right') })
          ),
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              'b',
              null,
              leg.mode
            )
          ),
          ' ',
          _react2.default.createElement(
            'span',
            { className: 'leg-duration' },
            (0, _time.formatDuration)(leg.duration)
          ),
          ' ',
          _react2.default.createElement(
            'span',
            { className: 'leg-distance' },
            '(',
            (0, _distance.distanceString)(leg.distance),
            ')'
          )
        ),
        active && _react2.default.createElement(
          'div',
          { className: 'step-by-step' },
          _react2.default.createElement(
            'div',
            { className: 'access-leg' },
            leg.steps.map(function (step, stepIndex) {
              var stepIsActive = activeStep === stepIndex;
              return _react2.default.createElement(
                'button',
                {
                  key: stepIndex,
                  className: 'step ' + (stepIsActive ? 'active' : ''),
                  onClick: function onClick(e) {
                    return _this2._onStepClick(e, step, stepIndex);
                  }
                },
                _react2.default.createElement(
                  'span',
                  { className: 'step-distance' },
                  (0, _distance.distanceString)(step.distance)
                ),
                _react2.default.createElement(
                  'span',
                  { className: 'step-text' },
                  (0, _itinerary.getStepInstructions)(step)
                )
              );
            })
          )
        )
      );
    }
  }]);
  return AccessLeg;
}(_react.Component);

AccessLeg.propTypes = {
  activeStep: _react.PropTypes.number,
  leg: _react.PropTypes.object,
  setActiveLeg: _react.PropTypes.func,
  setActiveStep: _react.PropTypes.func
};
exports.default = AccessLeg;
module.exports = exports['default'];

//# sourceMappingURL=access-leg.js