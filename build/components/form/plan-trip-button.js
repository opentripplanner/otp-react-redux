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

var _api = require('../../actions/api');

var _ui = require('../../actions/ui');

var _ui2 = require('../../util/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var PlanTripButton = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(PlanTripButton, _Component);

  function PlanTripButton() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, PlanTripButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = PlanTripButton.__proto__ || (0, _getPrototypeOf2.default)(PlanTripButton)).call.apply(_ref, [this].concat(args))), _this), _this._onClick = function () {
      _this.props.routingQuery();
      if (typeof _this.props.onClick === 'function') _this.props.onClick();
      if (!(0, _ui2.isMobile)()) _this.props.setMainPanelContent(null);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(PlanTripButton, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          currentQuery = _props.currentQuery,
          text = _props.text;

      var disabled = this.props.disabled === undefined ? !currentQuery.from || !currentQuery.to : this.props.disabled;

      return _react2.default.createElement(
        _reactBootstrap.Button,
        {
          className: 'plan-trip-button',
          disabled: disabled,
          onClick: this._onClick
        },
        text || 'Plan Trip'
      );
    }
  }]);
  return PlanTripButton;
}(_react.Component), _class.propTypes = {
  routingType: _react.PropTypes.string,
  text: _react.PropTypes.string,
  onClick: _react.PropTypes.func,
  planTrip: _react.PropTypes.func,
  profileTrip: _react.PropTypes.func
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return { currentQuery: state.otp.currentQuery };
};

var mapDispatchToProps = { routingQuery: _api.routingQuery, setMainPanelContent: _ui.setMainPanelContent };

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(PlanTripButton);
module.exports = exports['default'];

//# sourceMappingURL=plan-trip-button.js