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

var _defaultMap = require('../map/default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _locationField = require('../form/location-field');

var _locationField2 = _interopRequireDefault(_locationField);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _ui = require('../../actions/ui');

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileWelcomeScreen = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileWelcomeScreen, _Component);

  function MobileWelcomeScreen() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileWelcomeScreen);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileWelcomeScreen.__proto__ || (0, _getPrototypeOf2.default)(MobileWelcomeScreen)).call.apply(_ref, [this].concat(args))), _this), _this._toFieldClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SET_INITIAL_LOCATION);
    }, _this._locationSetFromPopup = function (selection) {
      // If the tapped location was selected as the 'from' endpoint, set the 'to'
      // endpoint to be the current user location. (If selected as the 'to' point,
      // no action is needed since 'from' is the current location by default.)
      if (selection.type === 'from') {
        _this.props.setLocationToCurrent({ type: 'to' });
      }
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  /* Called when the user selects a from/to location using the selection
   * popup (invoked in mobile mode via a long tap). Note that BaseMap already
   * takes care of updating the query in the store w/ the selected location */

  (0, _createClass3.default)(MobileWelcomeScreen, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, { title: this.props.title }),
        _react2.default.createElement(
          'div',
          { className: 'mobile-padding' },
          _react2.default.createElement(_locationField2.default, {
            type: 'to',
            label: 'Where do you want to go?',
            onClick: this._toFieldClicked,
            showClearButton: false
          })
        ),
        _react2.default.createElement(
          'div',
          { className: 'welcome-map' },
          _react2.default.createElement(_defaultMap2.default, { onSetLocation: this._locationSetFromPopup })
        )
      );
    }
  }]);
  return MobileWelcomeScreen;
}(_react.Component), _class.propTypes = {
  map: _propTypes2.default.element,

  setLocationToCurrent: _propTypes2.default.func,
  setMobileScreen: _propTypes2.default.func
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setLocationToCurrent: _map.setLocationToCurrent,
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileWelcomeScreen);
module.exports = exports['default'];

//# sourceMappingURL=welcome-screen.js