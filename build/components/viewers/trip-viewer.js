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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _icon = require('../narrative/icon');

var _icon2 = _interopRequireDefault(_icon);

var _viewStopButton = require('./view-stop-button');

var _viewStopButton2 = _interopRequireDefault(_viewStopButton);

var _ui = require('../../actions/ui');

var _api = require('../../actions/api');

var _map = require('../../actions/map');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TripViewer = (_temp2 = _class = function (_Component) {
  (0, _inherits3.default)(TripViewer, _Component);

  function TripViewer() {
    var _ref;

    var _temp, _this, _ret;

    (0, _classCallCheck3.default)(this, TripViewer);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return _ret = (_temp = (_this = (0, _possibleConstructorReturn3.default)(this, (_ref = TripViewer.__proto__ || (0, _getPrototypeOf2.default)(TripViewer)).call.apply(_ref, [this].concat(args))), _this), _this._backClicked = function () {
      _this.props.setViewedTrip(null);
    }, _temp), (0, _possibleConstructorReturn3.default)(_this, _ret);
  }

  (0, _createClass3.default)(TripViewer, [{
    key: 'componentWillMount',
    value: function componentWillMount() {
      this.props.findTrip({ tripId: this.props.viewedTrip.tripId });
    }
  }, {
    key: 'render',
    value: function render() {
      var _props = this.props,
          viewedTrip = _props.viewedTrip,
          tripData = _props.tripData,
          hideBackButton = _props.hideBackButton,
          languageConfig = _props.languageConfig;


      return _react2.default.createElement(
        'div',
        { className: 'trip-viewer' },
        _react2.default.createElement(
          'div',
          { className: 'trip-viewer-header' },
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
            languageConfig.tripViewer || 'Trip Viewer'
          ),
          _react2.default.createElement('div', { style: { clear: 'both' } })
        ),
        _react2.default.createElement(
          'div',
          { className: 'trip-viewer-body' },
          tripData && _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              'div',
              null,
              'Route: ',
              _react2.default.createElement(
                'b',
                null,
                tripData.route.shortName
              ),
              ' ',
              tripData.route.longName
            ),
            _react2.default.createElement(
              'h4',
              null,
              tripData.wheelchairAccessible === 1 && _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'primary' },
                _react2.default.createElement(_icon2.default, { type: 'wheelchair-alt' }),
                ' Accessible'
              ),
              ' ',
              tripData.bikesAllowed === 1 && _react2.default.createElement(
                _reactBootstrap.Label,
                { bsStyle: 'success' },
                _react2.default.createElement(_icon2.default, { type: 'bicycle' }),
                ' Allowed'
              )
            )
          ),
          tripData && tripData.stops && tripData.stopTimes && tripData.stops.map(function (stop, i) {
            // determine whether to use special styling for first/last stop
            var stripMapLineClass = 'strip-map-line';
            if (i === 0) stripMapLineClass = 'strip-map-line-first';else if (i === tripData.stops.length - 1) stripMapLineClass = 'strip-map-line-last';

            // determine whether to show highlight in strip map
            var highlightClass = void 0;
            if (i === viewedTrip.fromIndex) highlightClass = 'strip-map-highlight-first';else if (i > viewedTrip.fromIndex && i < viewedTrip.toIndex) highlightClass = 'strip-map-highlight';else if (i === viewedTrip.toIndex) highlightClass = 'strip-map-highlight-last';

            return _react2.default.createElement(
              'div',
              { key: i },
              _react2.default.createElement(
                'div',
                { className: 'stop-time' },
                (0, _time.formatStopTime)(tripData.stopTimes[i].scheduledDeparture)
              ),
              _react2.default.createElement(
                'div',
                { className: 'strip-map-container' },
                highlightClass && _react2.default.createElement('div', { className: highlightClass }),
                _react2.default.createElement('div', { className: stripMapLineClass }),
                _react2.default.createElement(
                  'div',
                  { className: 'strip-map-icon' },
                  _react2.default.createElement(_icon2.default, { type: 'circle' })
                )
              ),
              _react2.default.createElement(
                'div',
                { className: 'stop-button-container' },
                _react2.default.createElement(_viewStopButton2.default, { stopId: stop.id, text: 'View' })
              ),
              _react2.default.createElement(
                'div',
                { className: 'stop-name' },
                stop.name
              ),
              _react2.default.createElement('div', { style: { clear: 'both' } })
            );
          })
        )
      );
    }
  }]);
  return TripViewer;
}(_react.Component), _class.propTypes = {
  hideBackButton: _propTypes2.default.bool,
  tripData: _propTypes2.default.object,
  viewedTrip: _propTypes2.default.object
}, _temp2);


var mapStateToProps = function mapStateToProps(state, ownProps) {
  var viewedTrip = state.otp.ui.viewedTrip;
  return {
    tripData: state.otp.transitIndex.trips[viewedTrip.tripId],
    viewedTrip: viewedTrip,
    languageConfig: state.otp.config.language
  };
};

var mapDispatchToProps = {
  setViewedTrip: _ui.setViewedTrip,
  findTrip: _api.findTrip,
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(TripViewer);
module.exports = exports['default'];

//# sourceMappingURL=trip-viewer.js