'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

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

var _reactBootstrap = require('react-bootstrap');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var RealtimeAnnotation = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(RealtimeAnnotation, _Component);

  function RealtimeAnnotation() {
    (0, _classCallCheck3.default)(this, RealtimeAnnotation);
    return (0, _possibleConstructorReturn3.default)(this, (RealtimeAnnotation.__proto__ || (0, _getPrototypeOf2.default)(RealtimeAnnotation)).apply(this, arguments));
  }

  (0, _createClass3.default)(RealtimeAnnotation, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          componentClass = _props.componentClass,
          realtimeEffects = _props.realtimeEffects,
          toggleRealtime = _props.toggleRealtime,
          useRealtime = _props.useRealtime;
      // Keep only the unique route IDs (so that duplicates are not listed).

      var filteredRoutes = realtimeEffects.normalRoutes.filter(function (routeId, index, self) {
        return self.indexOf(routeId) === index;
      });
      // FIXME: there are some weird css things happening in desktop vs. mobile,
      // so I removed the divs with classNames and opted for h4 and p for now
      var innerContent = _react2.default.createElement(
        'div',
        { className: 'realtime-alert' },
        _react2.default.createElement(
          'div',
          { className: 'content' },
          _react2.default.createElement(
            'h3',
            null,
            _react2.default.createElement('i', { className: 'fa fa-exclamation-circle' }),
            ' Service update'
          ),
          _react2.default.createElement(
            'p',
            null,
            useRealtime ? _react2.default.createElement(
              'span',
              { className: 'small' },
              'Your trip results have been adjusted based on real-time information. Under normal conditions, this trip would take',
              ' ',
              _react2.default.createElement(
                'b',
                null,
                (0, _time.formatDuration)(realtimeEffects.normalDuration),
                ' '
              ),
              'using the following routes:',
              ' ',
              filteredRoutes.map(function (route, idx) {
                return _react2.default.createElement(
                  'span',
                  { key: idx },
                  _react2.default.createElement(
                    'b',
                    null,
                    route
                  ),
                  filteredRoutes.length - 1 > idx && ', '
                );
              }),
              '.'
            ) : _react2.default.createElement(
              'span',
              { className: 'small' },
              'Your trip results are currently being affected by service delays. These delays do not factor into travel times shown below.'
            )
          ),
          _react2.default.createElement(
            'div',
            null,
            _react2.default.createElement(
              _reactBootstrap.Button,
              {
                block: componentClass === 'popover' // display as block in popover
                , className: 'toggle-realtime',
                onClick: toggleRealtime
              },
              useRealtime ? 'Ignore' : 'Apply',
              ' service delays'
            )
          )
        )
      );

      if (componentClass === 'popover') {
        return _react2.default.createElement(
          _reactBootstrap.OverlayTrigger,
          {
            trigger: 'click',
            placement: 'bottom'
            // container={this}
            // containerPadding={40}
            , overlay: _react2.default.createElement(
              _reactBootstrap.Popover,
              { style: { maxWidth: '300px' }, id: 'popover-positioned-bottom' },
              innerContent
            ) },
          _react2.default.createElement(
            _reactBootstrap.Button,
            { bsStyle: 'link' },
            _react2.default.createElement('i', { className: 'fa fa-2x fa-exclamation-circle' })
          )
        );
      } else {
        return innerContent;
      }
    }
  }]);
  return RealtimeAnnotation;
}(_react.Component), _class.propTypes = {
  realtimeEffects: _react.PropTypes.object,
  toggleRealtime: _react.PropTypes.func,
  useRealtime: _react.PropTypes.bool
}, _temp);
exports.default = RealtimeAnnotation;
module.exports = exports['default'];

//# sourceMappingURL=realtime-annotation.js