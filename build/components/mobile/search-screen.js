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

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _dateTimePreview = require('../form/date-time-preview');

var _dateTimePreview2 = _interopRequireDefault(_dateTimePreview);

var _defaultMap = require('../map/default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _locationField = require('../form/location-field');

var _locationField2 = _interopRequireDefault(_locationField);

var _planTripButton = require('../form/plan-trip-button');

var _planTripButton2 = _interopRequireDefault(_planTripButton);

var _settingsPreview = require('../form/settings-preview');

var _settingsPreview2 = _interopRequireDefault(_settingsPreview);

var _switchButton = require('../form/switch-button');

var _switchButton2 = _interopRequireDefault(_switchButton);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileSearchScreen = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileSearchScreen, _Component);

  function MobileSearchScreen() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileSearchScreen);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileSearchScreen.__proto__ || (0, _getPrototypeOf2.default)(MobileSearchScreen)).call.apply(_ref, [this].concat(args))), _this), _this._fromFieldClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_FROM_LOCATION);
    }, _this._toFieldClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_TO_LOCATION);
    }, _this._expandDateTimeClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_DATETIME);
    }, _this._expandOptionsClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_OPTIONS);
    }, _this._planTripClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.RESULTS_SUMMARY);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileSearchScreen, [{
    key: 'render',
    value: function render() {
      var icons = this.props.icons;


      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, { headerText: 'Plan Your Trip' }),
        _react2.default.createElement(
          'div',
          { className: 'mobile-padding' },
          _react2.default.createElement(_locationField2.default, {
            type: 'from',
            onClick: this._fromFieldClicked,
            showClearButton: false
          }),
          _react2.default.createElement(_locationField2.default, {
            type: 'to',
            onClick: this._toFieldClicked,
            showClearButton: false
          }),
          _react2.default.createElement(
            'div',
            { className: 'switch-button-container-mobile' },
            _react2.default.createElement(_switchButton2.default, { content: _react2.default.createElement('i', { className: 'fa fa-exchange fa-rotate-90' }) })
          ),
          _react2.default.createElement(
            _reactBootstrap.Row,
            null,
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6, style: { borderRight: '2px solid #ccc' } },
              _react2.default.createElement(_dateTimePreview2.default, {
                onClick: this._expandDateTimeClicked,
                compressed: true
              })
            ),
            _react2.default.createElement(
              _reactBootstrap.Col,
              { xs: 6 },
              _react2.default.createElement(_settingsPreview2.default, {
                onClick: this._expandOptionsClicked,
                icons: icons,
                compressed: true
              })
            )
          ),
          _react2.default.createElement(_planTripButton2.default, { onClick: this._planTripClicked })
        ),
        _react2.default.createElement(
          'div',
          { className: 'search-map' },
          _react2.default.createElement(_defaultMap2.default, null)
        )
      );
    }
  }]);
  return MobileSearchScreen;
}(_react.Component), _class.propTypes = {
  icons: _propTypes2.default.object,
  map: _propTypes2.default.element,

  setMobileScreen: _propTypes2.default.func
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileSearchScreen);
module.exports = exports['default'];

//# sourceMappingURL=search-screen.js