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

function operatorForRoute(operators, route) {
  return operators.find(function (o) {
    return o.id.toLowerCase() === route.agency.id.split(':')[0].toLowerCase();
  });
}

function operatorIndexForRoute(operators, route) {
  var index = operators.findIndex(function (o) {
    return o.id.toLowerCase() === route.agency.id.split(':')[0].toLowerCase();
  });
  if (index !== -1 && typeof operators[index].order !== 'undefined') return operators[index].order;else return 0;
}

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
          operators = _props.operators,
          routes = _props.routes,
          hideBackButton = _props.hideBackButton,
          languageConfig = _props.languageConfig;

      var sortedRoutes = routes ? (0, _values2.default)(routes).sort(_itinerary.routeComparator) : [];
      var agencySortedRoutes = operators.length > 0 ? sortedRoutes.sort(function (a, b) {
        var aOperator = operatorIndexForRoute(operators, a);
        var bOperator = operatorIndexForRoute(operators, b);
        if (aOperator - bOperator > 0) return 1;
        if (aOperator - bOperator < 0) return -1;else return 0;
      }) : sortedRoutes;
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
          _react2.default.createElement(
            'div',
            { className: '' },
            languageConfig.routeViewerDetails
          ),
          _react2.default.createElement('div', { style: { clear: 'both' } })
        ),
        _react2.default.createElement(
          'div',
          { className: 'route-viewer-body' },
          agencySortedRoutes.map(function (route) {
            // Find operator based on agency_id (extracted from OTP route ID).
            var operator = operatorForRoute(operators, route) || {};
            return _react2.default.createElement(RouteRow, (0, _extends3.default)({
              key: route.id,
              operator: operator,
              route: route
            }, _this2.props));
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

    return _ret2 = (_temp3 = (_this3 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = RouteRow.__proto__ || (0, _getPrototypeOf2.default)(RouteRow)).call.apply(_ref2, [this].concat(args))), _this3), _this3.isActiveRoute = function () {
      var _this3$props = _this3.props,
          route = _this3$props.route,
          viewedRoute = _this3$props.viewedRoute;

      return viewedRoute && viewedRoute.routeId === route.id;
    }, _this3._onClick = function () {
      var _this3$props2 = _this3.props,
          route = _this3$props2.route,
          findRoute = _this3$props2.findRoute,
          setViewedRoute = _this3$props2.setViewedRoute;

      if (_this3.isActiveRoute()) {
        // Deselect current route if active.
        setViewedRoute({ routeId: null });
      } else {
        // Otherwise, set active and fetch route patterns.
        findRoute({ routeId: route.id });
        setViewedRoute({ routeId: route.id });
      }
    }, _temp3), (0, _possibleConstructorReturn3.default)(_this3, _ret2);
  }

  (0, _createClass3.default)(RouteRow, [{
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          operator = _props2.operator,
          route = _props2.route,
          routes = _props2.routes,
          viewedRoute = _props2.viewedRoute;

      var isActive = this.isActiveRoute();
      var defaultRouteColor = operator.defaultRouteColor,
          defaultRouteTextColor = operator.defaultRouteTextColor,
          longNameSplitter = operator.longNameSplitter;

      var activeRouteData = isActive ? routes[viewedRoute.routeId] : null;
      var color = '#' + (defaultRouteTextColor || route.textColor || '000000');
      var backgroundColor = '#' + (defaultRouteColor || route.color || 'ffffff');
      var longName = longNameSplitter && route.longName && route.longName.split(longNameSplitter).length > 1 ? route.longName.split(longNameSplitter)[1] : route.longName;
      return _react2.default.createElement(
        'div',
        {
          style: {
            borderBottom: '1px solid gray',
            backgroundColor: isActive ? '#f6f8fa' : 'white'
          } },
        _react2.default.createElement(
          _reactBootstrap.Button,
          { className: 'clear-button-formatting', style: { padding: 8, width: '100%' },
            onClick: this._onClick
          },
          _react2.default.createElement(
            'div',
            { style: { display: 'inline-block' } },
            operator && _react2.default.createElement('img', { src: operator.logo, style: { marginRight: '5px' }, height: 25 })
          ),
          _react2.default.createElement(
            'div',
            { style: { display: 'inline-block', marginTop: '2px' } },
            _react2.default.createElement(
              _reactBootstrap.Label,
              {
                style: {
                  backgroundColor: backgroundColor === '#ffffff' ? 'rgba(0,0,0,0)' : backgroundColor,
                  fontSize: 'medium',
                  fontWeight: 400,
                  color: color
                } },
              _react2.default.createElement(
                'b',
                null,
                route.shortName
              ),
              ' ',
              longName
            )
          )
        ),
        _react2.default.createElement(
          _velocityReact.VelocityTransitionGroup,
          { enter: { animation: 'slideDown' }, leave: { animation: 'slideUp' } },
          isActive && _react2.default.createElement(
            'div',
            { style: { padding: 8 } },
            activeRouteData.url ? _react2.default.createElement(
              'a',
              { href: activeRouteData.url, target: '_blank' },
              'Route Details'
            ) : 'No route URL provided.'
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
    operators: state.otp.config.operators,
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