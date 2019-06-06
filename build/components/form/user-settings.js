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

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactBootstrap = require('react-bootstrap');

var _icon = require('../narrative/icon');

var _icon2 = _interopRequireDefault(_icon);

var _api = require('../../actions/api');

var _form = require('../../actions/form');

var _map = require('../../actions/map');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var UserSettings = function (_Component) {
  (0, _inherits3.default)(UserSettings, _Component);

  function UserSettings() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, UserSettings);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = UserSettings.__proto__ || (0, _getPrototypeOf2.default)(UserSettings)).call.apply(_ref, [this].concat(args))), _this), _this._disableTracking = function () {
      return _this.props.toggleTracking(false);
    }, _this._enableTracking = function () {
      return _this.props.toggleTracking(true);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(UserSettings, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var user = this.props.user;
      var locations = user.locations,
          trackRecent = user.trackRecent,
          recentSearches = user.recentSearches;

      console.log(this.props);
      var order = ['home', 'work', 'suggested', 'recent'];
      var sortedLocations = locations.sort(function (a, b) {
        var aIndex = order.indexOf(a.type);
        var bIndex = order.indexOf(b.type);
        if (aIndex > bIndex) return 1;
        if (aIndex < bIndex) return -1;else return 0;
      });
      return _react2.default.createElement(
        'div',
        { style: {
            paddingTop: '10px',
            paddingLeft: '5px',
            paddingRight: '5px',
            paddingBottom: '20px',
            margin: '10px 10px 0 10px',
            minHeight: '150px',
            backgroundColor: '#f0f0f0'
          } },
        _react2.default.createElement(
          'div',
          null,
          'My places'
        ),
        _react2.default.createElement(
          'ul',
          { style: { padding: 0 } },
          sortedLocations.map(function (location) {
            return _react2.default.createElement(Place, (0, _extends3.default)({ key: location.id, location: location }, _this2.props));
          })
        ),
        trackRecent && _react2.default.createElement(
          'div',
          { className: 'recent-searches-container' },
          _react2.default.createElement(
            'div',
            null,
            'Recent searches'
          ),
          _react2.default.createElement(
            'ul',
            { style: { padding: 0 } },
            recentSearches.length > 0 ? recentSearches.map(function (search) {
              return _react2.default.createElement(RecentSearch, (0, _extends3.default)({ key: search.id, search: search }, _this2.props));
            }) : _react2.default.createElement(
              'small',
              null,
              'No recent searches'
            )
          )
        ),
        _react2.default.createElement('hr', { style: { borderTop: '1px solid #ccc' } }),
        _react2.default.createElement(
          'div',
          null,
          _react2.default.createElement(
            'div',
            null,
            'My preferences'
          ),
          _react2.default.createElement(
            'small',
            null,
            'Remember recent searches/places?'
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              onClick: this._enableTracking,
              style: trackRecent ? { backgroundColor: 'white' } : null,
              bsSize: 'xsmall',
              bsStyle: 'link' },
            'Yes'
          ),
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              onClick: this._disableTracking,
              style: !trackRecent ? { backgroundColor: 'white' } : null,
              bsSize: 'xsmall',
              bsStyle: 'link' },
            'No'
          )
        )
      );
    }
  }]);
  return UserSettings;
}(_react.Component);
// import PropTypes from 'prop-types'


var Place = function (_Component2) {
  (0, _inherits3.default)(Place, _Component2);

  function Place() {
    var _ref2;

    var _temp2, _this3, _ret2;

    (0, _classCallCheck3.default)(this, Place);

    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return _ret2 = (_temp2 = (_this3 = (0, _possibleConstructorReturn3.default)(this, (_ref2 = Place.__proto__ || (0, _getPrototypeOf2.default)(Place)).call.apply(_ref2, [this].concat(args))), _this3), _this3._onSelect = function () {
      var _this3$props = _this3.props,
          location = _this3$props.location,
          query = _this3$props.query,
          setLocation = _this3$props.setLocation;
      // console.log('selecting', this.props.id)

      if (!query.from) setLocation({ type: 'from', location: location });else if (!query.to) setLocation({ type: 'to', location: location });
    }, _this3._onForget = function () {
      return _this3.props.forgetPlace(_this3.props.location.id);
    }, _temp2), (0, _possibleConstructorReturn3.default)(_this3, _ret2);
  }

  (0, _createClass3.default)(Place, [{
    key: 'render',
    value: function render() {
      var _props$location = this.props.location,
          forgettable = _props$location.forgettable,
          icon = _props$location.icon,
          name = _props$location.name;

      return _react2.default.createElement(
        'li',
        { style: { listStyle: 'none' } },
        _react2.default.createElement(
          _reactBootstrap.Button,
          {
            bsStyle: 'link',
            title: name,
            style: {
              padding: '5px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '275px'
            },
            onClick: this._onSelect },
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_icon2.default, { type: icon }),
            ' ',
            name
          )
        ),
        _react2.default.createElement(
          'span',
          { className: 'pull-right' },
          forgettable && _react2.default.createElement(
            _reactBootstrap.Button,
            {
              onClick: this._onForget,
              bsSize: 'xsmall',
              style: { paddingTop: '6px' },
              bsStyle: 'link' },
            'Clear'
          )
        )
      );
    }
  }]);
  return Place;
}(_react.Component);

var RecentSearch = function (_Component3) {
  (0, _inherits3.default)(RecentSearch, _Component3);

  function RecentSearch() {
    var _ref3;

    var _temp3, _this4, _ret3;

    (0, _classCallCheck3.default)(this, RecentSearch);

    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return _ret3 = (_temp3 = (_this4 = (0, _possibleConstructorReturn3.default)(this, (_ref3 = RecentSearch.__proto__ || (0, _getPrototypeOf2.default)(RecentSearch)).call.apply(_ref3, [this].concat(args))), _this4), _this4._onSelect = function () {
      var _this4$props = _this4.props,
          search = _this4$props.search,
          setQueryParam = _this4$props.setQueryParam;

      setQueryParam(search.query);
    }, _this4._onForget = function () {
      return _this4.props.forgetSearch(_this4.props.search.id);
    }, _temp3), (0, _possibleConstructorReturn3.default)(_this4, _ret3);
  }

  (0, _createClass3.default)(RecentSearch, [{
    key: 'render',
    value: function render() {
      var search = this.props.search;
      var query = search.query;

      var name = query.mode + ' from ' + query.from.name + ' to ' + query.to.name;
      return _react2.default.createElement(
        'li',
        { style: { listStyle: 'none' } },
        _react2.default.createElement(
          _reactBootstrap.Button,
          {
            bsStyle: 'link',
            title: name,
            style: {
              padding: '5px 0 0 0',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              maxWidth: '275px'
            },
            onClick: this._onSelect },
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(_icon2.default, { type: 'clock-o' }),
            ' ',
            name
          )
        ),
        _react2.default.createElement(
          'span',
          { className: 'pull-right' },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              onClick: this._onForget,
              bsSize: 'xsmall',
              style: { paddingTop: '6px' },
              bsStyle: 'link' },
            'Clear'
          )
        )
      );
    }
  }]);
  return RecentSearch;
}(_react.Component);

// connect to redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    config: state.otp.config,
    user: state.otp.user,
    query: state.otp.currentQuery,
    currentPosition: state.otp.location.currentPosition,
    sessionSearches: state.otp.location.sessionSearches,
    nearbyStops: state.otp.location.nearbyStops,
    stopsIndex: state.otp.transitIndex.stops
  };
};

var mapDispatchToProps = {
  forgetPlace: _map.forgetPlace,
  forgetSearch: _api.forgetSearch,
  setLocation: _map.setLocation,
  setQueryParam: _form.setQueryParam,
  toggleTracking: _api.toggleTracking
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(UserSettings);
module.exports = exports['default'];

//# sourceMappingURL=user-settings.js