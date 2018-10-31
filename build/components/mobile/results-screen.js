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

var _class, _temp;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _defaultMap = require('../map/default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _errorMessage = require('../form/error-message');

var _errorMessage2 = _interopRequireDefault(_errorMessage);

var _itineraryCarousel = require('../narrative/itinerary-carousel');

var _itineraryCarousel2 = _interopRequireDefault(_itineraryCarousel);

var _realtimeAnnotation = require('../narrative/realtime-annotation');

var _realtimeAnnotation2 = _interopRequireDefault(_realtimeAnnotation);

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _ui = require('../../actions/ui');

var _narrative = require('../../actions/narrative');

var _state = require('../../util/state');

var _ui2 = require('../../util/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileResultsScreen = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(MobileResultsScreen, _Component);

  function MobileResultsScreen() {
    (0, _classCallCheck3.default)(this, MobileResultsScreen);

    var _this = (0, _possibleConstructorReturn3.default)(this, (MobileResultsScreen.__proto__ || (0, _getPrototypeOf2.default)(MobileResultsScreen)).call(this));

    _this._editSearchClicked = function () {
      _this.props.setMobileScreen(_ui.MobileScreens.SEARCH_FORM);
    };

    _this._optionClicked = function () {
      _this.setState({ expanded: !_this.state.expanded });
      _this.refs['narrative-container'].scrollTop = 0;
    };

    _this._toggleRealtime = function () {
      return _this.props.setUseRealtimeResponse({ useRealtime: !_this.props.useRealtime });
    };

    _this.state = {
      expanded: false
    };
    return _this;
  }

  (0, _createClass3.default)(MobileResultsScreen, [{
    key: 'componentDidMount',
    value: function componentDidMount() {
      // Get the target element that we want to persist scrolling for
      // FIXME Do we need to add something that removes the listeners when
      // component unmounts?
      (0, _ui2.enableScrollForSelector)('.mobile-narrative-container');
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          error = _props.error,
          itineraryClass = _props.itineraryClass,
          query = _props.query,
          realtimeEffects = _props.realtimeEffects,
          resultCount = _props.resultCount,
          useRealtime = _props.useRealtime,
          activeItineraryIndex = _props.activeItineraryIndex;
      var expanded = this.state.expanded;


      var narrativeContainerStyle = expanded ? { top: 140, overflowY: 'auto' } : { height: 80, overflowY: 'hidden'

        // Ensure that narrative covers map.
      };narrativeContainerStyle.backgroundColor = 'white';

      var headerAction = realtimeEffects.isAffectedByRealtimeData && (realtimeEffects.exceedsThreshold || realtimeEffects.routesDiffer || !useRealtime) && _react2.default.createElement(_realtimeAnnotation2.default, {
        componentClass: 'popover',
        toggleRealtime: this._toggleRealtime,
        realtimeEffects: realtimeEffects,
        useRealtime: useRealtime
      });

      var locationsSummary = _react2.default.createElement(
        _reactBootstrap.Row,
        { xs: 12, className: 'locations-summary', style: { padding: '4px 8px' } },
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 8, sm: 11, style: { fontSize: '1.1em', lineHeight: '1.2em' } },
          _react2.default.createElement(
            'div',
            { className: 'location' },
            _react2.default.createElement(_locationIcon2.default, { type: 'from' }),
            ' ',
            query.from ? query.from.name : ''
          ),
          _react2.default.createElement(
            'div',
            { className: 'location', style: { marginTop: '2px' } },
            _react2.default.createElement(_locationIcon2.default, { type: 'to' }),
            ' ',
            query.to ? query.to.name : ''
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Col,
          { xs: 4, sm: 1 },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              className: 'edit-search-button pull-right',
              onClick: this._editSearchClicked
            },
            'Edit'
          )
        )
      );

      if (error) {
        return _react2.default.createElement(
          _container2.default,
          null,
          _react2.default.createElement(_navigationBar2.default, { headerText: 'No Trip Found' }),
          locationsSummary,
          _react2.default.createElement(
            'div',
            { className: 'results-error-map' },
            _react2.default.createElement(_defaultMap2.default, null)
          ),
          _react2.default.createElement(
            'div',
            { className: 'results-error-message' },
            _react2.default.createElement(_errorMessage2.default, { error: error }),
            _react2.default.createElement(
              'div',
              { className: 'options-lower-tray mobile-padding' },
              _react2.default.createElement(
                _reactBootstrap.Button,
                { className: 'back-to-search-button', onClick: this._editSearchClicked, style: { width: '100%' } },
                _react2.default.createElement('i', { className: 'fa fa-arrow-left' }),
                ' Back to Search'
              )
            )
          ),
          _react2.default.createElement(_errorMessage2.default, { error: error })
        );
      }

      // Construct the 'dots'
      var dots = [];
      for (var i = 0; i < resultCount; i++) {
        dots.push(_react2.default.createElement('div', { className: 'dot' + (activeItineraryIndex === i ? ' active' : '') }));
      }

      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: resultCount ? 'We Found ' + resultCount + ' Option' + (resultCount > 1 ? 's' : '') : 'Waiting...',
          headerAction: headerAction
        }),
        locationsSummary,
        _react2.default.createElement(
          'div',
          { className: 'results-map' },
          this.props.map
        ),
        _react2.default.createElement(
          'div',
          {
            className: 'mobile-narrative-header',
            style: { bottom: expanded ? null : 100, top: expanded ? 100 : null },
            onClick: this._optionClicked
          },
          'Option ',
          activeItineraryIndex + 1,
          _react2.default.createElement('i', { className: 'fa fa-caret-' + (expanded ? 'down' : 'up'), style: { marginLeft: 8 } })
        ),
        _react2.default.createElement(
          'div',
          {
            ref: 'narrative-container',
            className: 'mobile-narrative-container',
            style: narrativeContainerStyle
          },
          _react2.default.createElement(_itineraryCarousel2.default, {
            itineraryClass: itineraryClass,
            hideHeader: true,
            expanded: this.state.expanded,
            onClick: this._optionClicked
          })
        ),
        _react2.default.createElement(
          'div',
          { className: 'dots-container', style: { padding: 'none' } },
          dots
        )
      );
    }
  }]);
  return MobileResultsScreen;
}(_react.Component), _class.propTypes = {
  activeItineraryIndex: _propTypes2.default.number,
  map: _propTypes2.default.element,
  query: _propTypes2.default.object,
  resultCount: _propTypes2.default.number,

  setMobileScreen: _propTypes2.default.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  var useRealtime = state.otp.useRealtime;

  var response = !activeSearch ? null : useRealtime ? activeSearch.response : activeSearch.nonRealtimeResponse;

  var realtimeEffects = (0, _state.getRealtimeEffects)(state.otp);

  return {
    query: state.otp.currentQuery,
    realtimeEffects: realtimeEffects,
    error: response && response.error,
    resultCount: response ? activeSearch.query.routingType === 'ITINERARY' ? response.plan ? response.plan.itineraries.length : 0 : response.otp.profile.length : null,
    useRealtime: useRealtime,
    activeItineraryIndex: activeSearch !== null ? activeSearch.activeItinerary : null
  };
};

var mapDispatchToProps = {
  setMobileScreen: _ui.setMobileScreen,
  setUseRealtimeResponse: _narrative.setUseRealtimeResponse
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileResultsScreen);
module.exports = exports['default'];

//# sourceMappingURL=results-screen.js