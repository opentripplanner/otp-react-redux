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

var ViewTripButton = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(ViewTripButton, _Component);

  function ViewTripButton() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, ViewTripButton);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = ViewTripButton.__proto__ || (0, _getPrototypeOf2.default)(ViewTripButton)).call.apply(_ref, [this].concat(args))), _this), _this._onClick = function () {
      _this.props.setMainPanelContent(null);
      _this.props.setViewedTrip({
        tripId: _this.props.tripId,
        fromIndex: _this.props.fromIndex,
        toIndex: _this.props.toIndex
      });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(ViewTripButton, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _reactBootstrap.Button,
        {
          bsSize: 'xsmall',
          className: 'view-trip-button',
          onClick: this._onClick
        },
        this.props.text || this.props.languageConfig.tripViewer || 'Trip Viewer'
      );
    }
  }]);
  return ViewTripButton;
}(_react.Component), _class.propTypes = {
  fromIndex: _propTypes2.default.number,
  tripId: _propTypes2.default.string,
  text: _propTypes2.default.string,
  toIndex: _propTypes2.default.number
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  setMainPanelContent: _ui.setMainPanelContent,
  setViewedTrip: _ui.setViewedTrip
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ViewTripButton);
module.exports = exports['default'];

//# sourceMappingURL=view-trip-button.js