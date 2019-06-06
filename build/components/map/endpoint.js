'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

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

var _server = require('react-dom/server');

var _server2 = _interopRequireDefault(_server);

var _reactBootstrap = require('react-bootstrap');

var _reactLeaflet = require('react-leaflet');

var _leaflet = require('leaflet');

var _map = require('../../util/map');

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Endpoint = function (_Component) {
  (0, _inherits3.default)(Endpoint, _Component);

  function Endpoint() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, Endpoint);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = Endpoint.__proto__ || (0, _getPrototypeOf2.default)(Endpoint)).call.apply(_ref, [this].concat(args))), _this), _this._rememberAsHome = function () {
      var rememberPlace = _this.props.rememberPlace;

      var location = (0, _assign2.default)({}, _this.props.location);
      location.id = 'home';
      location.name = 'Home (' + location.name + ')';
      location.icon = 'home';
      location.forgettable = true;
      location.type = 'home';
      rememberPlace({ type: 'home', location: location });
    }, _this._rememberAsWork = function () {
      var rememberPlace = _this.props.rememberPlace;

      var location = (0, _assign2.default)({}, _this.props.location);
      location.id = 'work';
      location.name = 'Work (' + location.name + ')';
      location.icon = 'briefcase';
      location.forgettable = true;
      location.type = 'work';
      rememberPlace({ type: 'work', location: location });
    }, _this._onDragEnd = function (e) {
      var _this$props = _this.props,
          setLocation = _this$props.setLocation,
          type = _this$props.type;

      var location = (0, _map.constructLocation)(e.target.getLatLng());
      setLocation({ type: type, location: location, reverseGeocode: true });
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(Endpoint, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          type = _props.type,
          location = _props.location;

      var position = location && location.lat && location.lon ? [location.lat, location.lon] : null;
      if (!position) return null;
      var fgStyle = { fontSize: 24, width: 32, height: 32 };
      var bgStyle = { fontSize: 32, width: 32, height: 32, paddingTop: 1 };
      var iconHtml = _server2.default.renderToStaticMarkup(_react2.default.createElement(
        'span',
        { title: location.name, className: 'fa-stack endpoint-' + type + '-icon', style: { opacity: 1.0, marginLeft: -10, marginTop: -7 } },
        type === 'from'
        // From icon should have white circle background
        ? _react2.default.createElement('i', { className: 'fa-stack-1x fa fa-circle', style: (0, _extends3.default)({ color: '#fff' }, fgStyle) }) : _react2.default.createElement(
          'span',
          null,
          _react2.default.createElement(_locationIcon2.default, { type: type, className: 'fa-stack-1x', style: (0, _extends3.default)({ color: '#333' }, bgStyle) }),
          _react2.default.createElement('i', { className: 'fa-stack-1x fa fa-circle', style: (0, _extends3.default)({ color: '#fff' }, bgStyle, { fontSize: 12, marginTop: -4 }) })
        ),
        _react2.default.createElement(_locationIcon2.default, { type: type, className: 'fa-stack-1x', style: fgStyle })
      ));

      return _react2.default.createElement(
        _reactLeaflet.Marker,
        {
          draggable: true,
          icon: (0, _leaflet.divIcon)({ html: iconHtml, className: '' }),
          position: position,
          onDragEnd: this._onDragEnd },
        _react2.default.createElement(
          _reactLeaflet.Popup,
          null,
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this._rememberAsHome },
              'Set as home'
            ),
            _react2.default.createElement(
              _reactBootstrap.Button,
              { onClick: this._rememberAsWork },
              'Set as work'
            )
          )
        )
      );
    }
  }]);
  return Endpoint;
}(_react.Component);

exports.default = Endpoint;
module.exports = exports['default'];

//# sourceMappingURL=endpoint.js