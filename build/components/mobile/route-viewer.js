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

var _routeViewer = require('../viewers/route-viewer');

var _routeViewer2 = _interopRequireDefault(_routeViewer);

var _defaultMap = require('../map/default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileRouteViewer = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(MobileRouteViewer, _Component);

  function MobileRouteViewer() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, MobileRouteViewer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = MobileRouteViewer.__proto__ || (0, _getPrototypeOf2.default)(MobileRouteViewer)).call.apply(_ref, [this].concat(args))), _this), _this._backClicked = function () {
      _this.props.setViewedRoute(null);
      _this.props.setMainPanelContent(null);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(MobileRouteViewer, [{
    key: 'render',
    value: function render() {
      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: 'Route Viewer',
          showBackButton: true,
          onBackClicked: this._backClicked
        }),
        _react2.default.createElement(
          'div',
          { className: 'viewer-map' },
          _react2.default.createElement(_defaultMap2.default, null)
        ),
        _react2.default.createElement(
          'div',
          { className: 'viewer-container' },
          _react2.default.createElement(_routeViewer2.default, { hideBackButton: true })
        )
      );
    }
  }]);
  return MobileRouteViewer;
}(_react.Component), _class.propTypes = {
  setViewedRoute: _propTypes2.default.func,
  setMainPanelContent: _propTypes2.default.func
}, _temp2);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  setViewedRoute: _ui.setViewedRoute,
  setMainPanelContent: _ui.setMainPanelContent
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileRouteViewer);
module.exports = exports['default'];

//# sourceMappingURL=route-viewer.js