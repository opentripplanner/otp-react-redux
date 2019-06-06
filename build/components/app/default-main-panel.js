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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _viewerContainer = require('../viewers/viewer-container');

var _viewerContainer2 = _interopRequireDefault(_viewerContainer);

var _defaultSearchForm = require('../form/default-search-form');

var _defaultSearchForm2 = _interopRequireDefault(_defaultSearchForm);

var _planTripButton = require('../form/plan-trip-button');

var _planTripButton2 = _interopRequireDefault(_planTripButton);

var _userSettings = require('../form/user-settings');

var _userSettings2 = _interopRequireDefault(_userSettings);

var _narrativeRoutingResults = require('../narrative/narrative-routing-results');

var _narrativeRoutingResults2 = _interopRequireDefault(_narrativeRoutingResults);

var _state = require('../../util/state');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var DefaultMainPanel = function (_Component) {
  (0, _inherits3.default)(DefaultMainPanel, _Component);

  function DefaultMainPanel() {
    (0, _classCallCheck3.default)(this, DefaultMainPanel);
    return (0, _possibleConstructorReturn3.default)(this, (DefaultMainPanel.__proto__ || (0, _getPrototypeOf2.default)(DefaultMainPanel)).apply(this, arguments));
  }

  (0, _createClass3.default)(DefaultMainPanel, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          customIcons = _props.customIcons,
          itineraryClass = _props.itineraryClass,
          itineraryFooter = _props.itineraryFooter,
          mainPanelContent = _props.mainPanelContent,
          currentQuery = _props.currentQuery,
          activeSearch = _props.activeSearch;

      var showPlanTripButton = mainPanelContent === 'EDIT_DATETIME' || mainPanelContent === 'EDIT_SETTINGS';
      var mostRecentQuery = activeSearch ? activeSearch.query : null;
      var planDisabled = (0, _lodash2.default)(currentQuery, mostRecentQuery);
      return _react2.default.createElement(
        _viewerContainer2.default,
        null,
        _react2.default.createElement(
          'div',
          { style: {
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: showPlanTripButton ? 55 : 0,
              paddingBottom: 15,
              overflow: 'auto'
            } },
          _react2.default.createElement(_defaultSearchForm2.default, { icons: customIcons }),
          !activeSearch && !showPlanTripButton && _react2.default.createElement(_userSettings2.default, null),
          _react2.default.createElement(
            'div',
            { className: 'desktop-narrative-container' },
            _react2.default.createElement(_narrativeRoutingResults2.default, {
              itineraryClass: itineraryClass,
              itineraryFooter: itineraryFooter,
              customIcons: customIcons })
          )
        ),
        showPlanTripButton && _react2.default.createElement('div', {
          style: {
            position: 'absolute',
            left: 0,
            right: 10,
            bottom: 55,
            height: 15
          },
          className: 'white-fade' }),
        showPlanTripButton && _react2.default.createElement(
          'div',
          { className: 'bottom-fixed' },
          _react2.default.createElement(_planTripButton2.default, { disabled: planDisabled })
        )
      );
    }
  }]);
  return DefaultMainPanel;
}(_react.Component);

// connect to the redux store


var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    mainPanelContent: state.otp.ui.mainPanelContent,
    currentQuery: state.otp.currentQuery,
    activeSearch: (0, _state.getActiveSearch)(state.otp)
  };
};

var mapDispatchToProps = {};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(DefaultMainPanel);
module.exports = exports['default'];

//# sourceMappingURL=default-main-panel.js