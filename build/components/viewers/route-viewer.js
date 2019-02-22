'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _values = require('babel-runtime/core-js/object/values');

var _values2 = _interopRequireDefault(_values);

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

var _velocityReact = require('velocity-react');

var _reactRedux = require('react-redux');

var _icon = require('../narrative/icon');

var _icon2 = _interopRequireDefault(_icon);

var _ui = require('../../actions/ui');

var _api = require('../../actions/api');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RouteViewer = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(RouteViewer, _Component);

  function RouteViewer() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, RouteViewer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = RouteViewer.__proto__ || (0, _getPrototypeOf2.default)(RouteViewer)).call.apply(_ref, [this].concat(args))), _this), _this._backClicked = function () {
      _this.props.setMainPanelContent(null);
      _this.props.setViewedRoute(null);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(RouteViewer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.findRoutes();
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      //this.props.findRoute({ routeId: 'TriMet:1' })
      //this.props.setViewedRoute({ routeId: 'TriMet:1' })
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          routes = _props.routes,
          hideBackButton = _props.hideBackButton,
          languageConfig = _props.languageConfig;


      return _react2.default.createElement(
        'div',
        { className: 'route-viewer' },
        _react2.default.createElement(
          'div',
          { className: 'route-viewer-header' },
          !hideBackButton && _react2.default.createElement(
            'div',
            { className: 'back-button-container' },
            _react2.default.createElement(
              _reactBootstrap.Button,
              {
                bsSize: 'small',
                onClick: this._backClicked
              },
              _react2.default.createElement(_icon2.default, { type: 'arrow-left' }),
              'Back'
            )
          ),
          _react2.default.createElement(
            'div',
            { className: 'header-text' },
            languageConfig.routeViewer || 'Route Viewer'
          ),
          _react2.default.createElement('div', { style: { clear: 'both' } })
        ),
        _react2.default.createElement(
          'div',
          { className: 'route-viewer-body' },
          routes && (0, _values2.default)(routes).sort(_itinerary.routeComparator).map(function (route) {
            return _react2.default.createElement(RouteRow, (0, _extends3.default)({ key: route.id, route: route }, _this2.props));
          })
        )
      );
    }
  }]);
  return RouteViewer;
}(_react.Component), _class.propTypes = {
  hideBackButton: _propTypes2.default.bool,
  routes: _propTypes2.default.object
}, _temp2);

var RouteRow = function (_Component2) {
  (0, _inherits3.default)(RouteRow, _Component2);

  function RouteRow() {
    var _ref2;

    var _temp3, _this3, _ret2;

    (0, _classCallCheck3.default)(this, RouteRow);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp3 = (_this3 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = RouteRow.__proto__ || (0, _getPrototypeOf2.default)(RouteRow)).call.apply(_ref2, [this].concat(args))), _this3), _this3._onClick = function () {
      var _this3$props = _this3.props,
          route = _this3$props.route,
          findRoute = _this3$props.findRoute,
          setViewedRoute = _this3$props.setViewedRoute;

      findRoute({ routeId: route.id });
      setViewedRoute({ routeId: route.id });
    }, _temp3), (0, _possibleConstructorReturn3.default)(_this3, _ret2);
  }

  (0, _createClass3.default)(RouteRow, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          route = _props2.route,
          routes = _props2.routes,
          viewedRoute = _props2.viewedRoute;

      var isActiveRoute = viewedRoute && viewedRoute.routeId === route.id;
      var activeRouteData = void 0;
      if (isActiveRoute) {
        activeRouteData = routes[viewedRoute.routeId];
      }

      return _react2.default.createElement(
        'div',
        { style: { borderBottom: '1px solid gray' }, key: route.id },
        _react2.default.createElement(
          _reactBootstrap.Button,
          { className: 'clear-button-formatting', style: { padding: 8 },
            onClick: this._onClick
          },
          _react2.default.createElement(
            'b',
            null,
            route.shortName
          ),
          ' ',
          route.longName
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
          isActiveRoute && _react2.default.createElement(
            'div',
            { style: { padding: 8 } },
            activeRouteData.url && _react2.default.createElement(
              'a',
              { href: activeRouteData.url, target: '_blank' },
              'Route Details'
            )
          )
        )
      );
    }
  }]);
  return RouteRow;
}(_react.Component);
// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    routes: state.otp.transitIndex.routes,
    viewedRoute: state.otp.ui.viewedRoute,
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  findRoute: _api.findRoute,
  findRoutes: _api.findRoutes,
  setMainPanelContent: _ui.setMainPanelContent,
  setViewedRoute: _ui.setViewedRoute
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(RouteViewer);
module.exports = exports['default'];

//# sourceMappingURL=route-viewer.js