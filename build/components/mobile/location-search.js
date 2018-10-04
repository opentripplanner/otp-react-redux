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

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _locationField = require('../form/location-field');

var _locationField2 = _interopRequireDefault(_locationField);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileLocationSearch = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileLocationSearch, _Component);

  function MobileLocationSearch() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileLocationSearch);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileLocationSearch.__proto__ || (0, _getPrototypeOf2.default)(MobileLocationSearch)).call.apply(_ref, [this].concat(args))), _this), _this._locationSelected = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SEARCH_FORM);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileLocationSearch, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          backScreen = _props.backScreen,
          locationType = _props.locationType;

      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: 'Set ' + locationType + ' Location',
          showBackButton: true,
          backScreen: backScreen
        }),
        _react2.default.createElement(
          'div',
          { className: 'mobile-padding' },
          _react2.default.createElement(_locationField2.default, {
            type: locationType,
            hideExistingValue: true,
            label: 'Enter location',
            'static': true,
            onLocationSelected: this._locationSelected
          })
        )
      );
    }
  }]);
  return MobileLocationSearch;
}(_react.Component), _class.propTypes = {
  backScreen: _propTypes2.default.number,
  locationType: _propTypes2.default.string
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileLocationSearch);
module.exports = exports['default'];

//# sourceMappingURL=location-search.js