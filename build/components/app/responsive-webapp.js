'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactRouterDom = require('react-router-dom');

var _qs = require('qs');

var _qs2 = _interopRequireDefault(_qs);

var _printLayout = require('./print-layout');

var _printLayout2 = _interopRequireDefault(_printLayout);

var _config = require('../../actions/config');

var _map = require('../../actions/map');

var _location = require('../../actions/location');

var _api = require('../../actions/api');

var _form = require('../../actions/form');

var _ui = require('../../actions/ui');

var _query = require('../../util/query');

var _ui2 = require('../../util/ui');

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ResponsiveWebapp = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ResponsiveWebapp, _Component);

  function ResponsiveWebapp() {
    (0, _classCallCheck3.default)(this, ResponsiveWebapp);
    return (0, _possibleConstructorReturn3.default)(this, (ResponsiveWebapp.__proto__ || (0, _getPrototypeOf2.default)(ResponsiveWebapp)).apply(this, arguments));
  }

  (0, _createClass3.default)(ResponsiveWebapp, [{
    key: 'componentWillReceiveProps',


    /** Lifecycle methods **/

    value: function componentWillReceiveProps(nextProps) {
      var query = this.props.query;


      if (!(0, _lodash2.default)(query, nextProps.query)) {
        this.props.formChanged(query, nextProps.query);
      }

      // check if device position changed (typically only set once, on initial page load)
      if (this.props.currentPosition !== nextProps.currentPosition) {
        if (nextProps.currentPosition.error || !nextProps.currentPosition.coords) return;
        var pt = {
          lat: nextProps.currentPosition.coords.latitude,
          lon: nextProps.currentPosition.coords.longitude

          // if in mobile mode and from field is not set, use current location as from and recenter map
        };if ((0, _ui2.isMobile)() && this.props.query.from === null) {
          this.props.setLocationToCurrent({ type: 'from' });
          this.props.setMapCenter(pt);
          if (this.props.initZoomOnLocate) {
            this.props.setMapZoom({ zoom: this.props.initZoomOnLocate });
          }
        }
      }

      // Check for change between ITINERARY and PROFILE routingTypes
      // TODO: restore this for profile mode
      /*if (query.routingType !== nextProps.query.routingType) {
        let queryModes = nextProps.query.mode.split(',')
        // If we are entering 'ITINERARY' mode, ensure that one and only one access mode is selected
        if (nextProps.query.routingType === 'ITINERARY') {
          queryModes = ensureSingleAccessMode(queryModes)
          this.props.setQueryParam({ mode: queryModes.join(',') })
        }
        // If we are entering 'PROFILE' mode, ensure that CAR_HAIL is not selected
        // TODO: make this more generic, i.e. introduce concept of mode->routingType permissions
        if (nextProps.query.routingType === 'ITINERARY') {
          queryModes = queryModes.filter(mode => mode !== 'CAR_HAIL')
          this.props.setQueryParam({ mode: queryModes.join(',') })
        }
      }*/

      // Check for any updates to tracked UI state properties and update URL as needed
      if (!(0, _lodash2.default)(this.props.uiUrlParams, nextProps.uiUrlParams)) {
        (0, _query.updateUiUrlParams)(nextProps.uiUrlParams);
      }
    }
  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      var _this2 = this;

      var _props = this.props,
          location = _props.location,
          initialDisplay = _props.initialDisplay;

      if (location && location.search) {
        // Set search params and plan trip if routing enabled and a query exists
        // in the URL.
        this.props.parseUrlQueryString(location.search);
      }

      if ((0, _ui2.isMobile)()) {
        // If on mobile browser, check position on load
        this.props.getCurrentPosition();

        // Also, watch for changes in position on mobile
        navigator.geolocation.watchPosition(
        // On success
        function (position) {
          _this2.props.receivedPositionResponse({ position: position });
        },
        // On error
        function (error) {
          console.log('error in watchPosition', error);
        },
        // Options
        { enableHighAccuracy: true });
      }

      // Check for initial display state
      if (initialDisplay === 'route' && location.search) {
        var params = _qs2.default.parse(location.search.substring(1));
        this.props.setMainPanelContent(_ui.MainPanelContent.ROUTE_VIEWER);
        if (params.id) {
          this.props.findRoute({ routeId: params.id });
          this.props.setViewedRoute({ routeId: params.id });
        }
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _props2 = this.props,
          desktopView = _props2.desktopView,
          mobileView = _props2.mobileView;

      return (0, _ui2.isMobile)() ? mobileView : desktopView;
    }
  }]);
  return ResponsiveWebapp;
}(_react.Component), _class.propTypes = {
  desktopView: _propTypes2.default.element,
  initZoomOnLocate: _propTypes2.default.number,
  mobileView: _propTypes2.default.element,
  query: _propTypes2.default.object }, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    activeItinerary: (0, _state.getActiveItinerary)(state.otp),
    uiUrlParams: (0, _query.getUiUrlParams)(state.otp),
    currentPosition: state.otp.location.currentPosition,
    query: state.otp.currentQuery,
    mobileScreen: state.otp.ui.mobileScreen,
    initZoomOnLocate: state.otp.config.map && state.otp.config.map.initZoomOnLocate,
    modeGroups: state.otp.config.modeGroups
  };
};

var mapDispatchToProps = {
  setLocationToCurrent: _map.setLocationToCurrent,
  setMapCenter: _config.setMapCenter,
  setMapZoom: _config.setMapZoom,
  getCurrentPosition: _location.getCurrentPosition,
  findRoute: _api.findRoute,
  formChanged: _form.formChanged,
  receivedPositionResponse: _location.receivedPositionResponse,
  setMainPanelContent: _ui.setMainPanelContent,
  setQueryParam: _form.setQueryParam,
  parseUrlQueryString: _form.parseUrlQueryString
};

var WebappWithRouter = (0, _reactRouterDom.withRouter)((0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(ResponsiveWebapp));

var RouterWrapper = function (_Component2) {
  (0, _inherits3.default)(RouterWrapper, _Component2);

  function RouterWrapper() {
    (0, _classCallCheck3.default)(this, RouterWrapper);
    return (0, _possibleConstructorReturn3.default)(this, (RouterWrapper.__proto__ || (0, _getPrototypeOf2.default)(RouterWrapper)).apply(this, arguments));
  }

  (0, _createClass3.default)(RouterWrapper, [{
    key: 'render',
    value: function render() {
      var _this4 = this;

      var routerConfig = this.props.routerConfig;

      return _react2.default.createElement(
        _reactRouterDom.HashRouter,
        { basename: routerConfig && routerConfig.basename,
          hashType: 'slash'
          // TODO: Use react-router-redux once it is out of beta?
          // history={history}
        },
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(_reactRouterDom.Route, {
            exact: true,
            path: '/',
            component: function component() {
              return _react2.default.createElement(WebappWithRouter, _this4.props);
            }
          }),
          _react2.default.createElement(_reactRouterDom.Route, {
            exact: true,
            path: '/route',
            component: function component() {
              return _react2.default.createElement(WebappWithRouter, (0, _extends3.default)({ initialDisplay: 'route' }, _this4.props));
            }
          }),
          _react2.default.createElement(_reactRouterDom.Route, {
            path: '/print',
            component: _printLayout2.default
          })
        )
      );
    }
  }]);
  return RouterWrapper;
}(_react.Component);

exports.default = (0, _reactRedux.connect)(function (state, ownProps) {
  return { routerConfig: state.otp.config.reactRouter };
})(RouterWrapper);
module.exports = exports['default'];

//# sourceMappingURL=responsive-webapp.js