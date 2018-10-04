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

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ViewStopButton = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ViewStopButton, _Component);

  function ViewStopButton() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ViewStopButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ViewStopButton.__proto__ || (0, _getPrototypeOf2.default)(ViewStopButton)).call.apply(_ref, [this].concat(args))), _this), _this._onClick = function () {
      _this.props.setMainPanelContent(null);
      _this.props.setViewedStop({ stopId: _this.props.stopId });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ViewStopButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Button,
        {
          bsSize: 'xsmall',
          className: 'view-stop-button',
          onClick: this._onClick
        },
        this.props.text || 'Stop Viewer'
      );
    }
  }]);
  return ViewStopButton;
}(_react.Component), _class.propTypes = {
  stopId: _propTypes2.default.string,
  text: _propTypes2.default.string
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMainPanelContent: _ui.setMainPanelContent,
  setViewedStop: _ui.setViewedStop
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ViewStopButton);
module.exports = exports['default'];

//# sourceMappingURL=view-stop-button.js