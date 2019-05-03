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

var _icon = require('./icon');

var _icon2 = _interopRequireDefault(_icon);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _modeIcon = require('./mode-icon');

var _modeIcon2 = _interopRequireDefault(_modeIcon);

var _itinerary = require('../../util/itinerary');

var _time = require('../../util/time');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var TransitLeg = function (_Component) {
  (0, _inherits3.default)(TransitLeg, _Component);

  function TransitLeg(props) {
    (0, _classCallCheck3.default)(this, TransitLeg);

    var _this = (0, _possibleConstructorReturn3.default)(this, (TransitLeg.__proto__ || (0, _getPrototypeOf2.default)(TransitLeg)).call(this, props));

    _this._onClick = function () {
      _this.setState({ expanded: !_this.state.expanded });
    };

    _this.state = {
      expanded: false
    };
    return _this;
  }

  (0, _createClass3.default)(TransitLeg, [{
    key: '_onLegClick',
    value: function _onLegClick(e, leg, index) {
      if (this.props.active) {
        this.props.setActiveLeg(null);
      } else {
        this.props.setActiveLeg(index, leg);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          active = _props.active,
          index = _props.index,
          leg = _props.leg;
      var expanded = this.state.expanded;

      var numStops = leg.to.stopIndex - leg.from.stopIndex - 1;
      return _react2.default.createElement(
        'div',
        {
          className: 'leg' + (active ? ' active' : '') },
        _react2.default.createElement(
          'button',
          {
            className: 'header',
            onClick: function onClick(e) {
              return _this2._onLegClick(e, leg, index);
            }
          },
          leg.realTime ? _react2.default.createElement(_icon2.default, { type: 'rss' }) : null,
          _react2.default.createElement(
            'span',
            null,
            _react2.default.createElement(
              _reactBootstrap.Label,
              null,
              leg.routeShortName
            ),
            ' ',
            _react2.default.createElement(
              'b',
              null,
              leg.routeLongName
            ),
            ' ',
            leg.headsign
          )
        ),
        _react2.default.createElement(
          'div',
          { className: 'step-by-step' },
          _react2.default.createElement(
            'div',
            { className: 'transit-leg' },
            _react2.default.createElement(
              'div',
              { className: 'from-stop' },
              _react2.default.createElement(_modeIcon2.default, { mode: leg.mode }),
              leg.from.name
            ),
            _react2.default.createElement(
              'div',
              { className: 'intermediate-stops' },
              _react2.default.createElement(
                'div',
                {
                  className: 'stop-count',
                  style: { borderLeft: '3px solid ' + (0, _itinerary.getMapColor)(leg.mode) }
                },
                _react2.default.createElement(
                  'button',
                  {
                    onClick: this._onClick
                  },
                  _react2.default.createElement(_icon2.default, { type: 'caret-' + (expanded ? 'down' : 'right') }),
                  _react2.default.createElement(
                    'span',
                    { className: 'transit-duration' },
                    (0, _time.formatDuration)(leg.duration)
                  ),
                  ' ',
                  '(',
                  numStops ? numStops + ' stops' : 'non-stop',
                  ')'
                ),
                leg.alerts && _react2.default.createElement(
                  'div',
                  null,
                  _react2.default.createElement(
                    'div',
                    { className: 'item' },
                    _react2.default.createElement(_icon2.default, { type: 'exclamation-circle' }),
                    ' Information'
                  ),
                  expanded && _react2.default.createElement(
                    'div',
                    null,
                    leg.alerts.map(function (alert, i) {
                      return _react2.default.createElement(
                        'div',
                        { className: 'alert-item item', key: i },
                        alert.alertDescriptionText,
                        ' ',
                        alert.alertUrl ? _react2.default.createElement(
                          'a',
                          { target: '_blank', href: alert.alertUrl },
                          'more info'
                        ) : null
                      );
                    })
                  )
                )
              ),
              expanded && _react2.default.createElement(
                'div',
                null,
                _react2.default.createElement(
                  'div',
                  {
                    style: { borderLeft: '3px solid ' + (0, _itinerary.getMapColor)(leg.mode) },
                    className: 'stop-list' },
                  leg.intermediateStops.map(function (s, i) {
                    return _react2.default.createElement(
                      'div',
                      { key: i, className: 'stop-item item' },
                      _react2.default.createElement(
                        'span',
                        { className: 'stop-bullet',
                          style: {
                            color: (0, _itinerary.getMapColor)(leg.mode),
                            fontWeight: 800,
                            paddingRight: '8px',
                            marginLeft: '-1px'
                          }
                        },
                        '-'
                      ),
                      _react2.default.createElement(
                        'span',
                        { className: 'stop-name' },
                        s.name
                      )
                    );
                  }),
                  _react2.default.createElement(
                    'div',
                    { className: 'item info-item' },
                    _react2.default.createElement(
                      'span',
                      { className: 'agency-info' },
                      'Service operated by ',
                      _react2.default.createElement(
                        'a',
                        { href: leg.agencyUrl },
                        leg.agencyName
                      )
                    )
                  )
                )
              )
            ),
            _react2.default.createElement(
              'div',
              { className: 'to-stop' },
              _react2.default.createElement(_modeIcon2.default, { mode: leg.mode }),
              leg.to.name
            )
          )
        )
      );
    }
  }]);
  return TransitLeg;
}(_react.Component);

TransitLeg.propTypes = {
  itinerary: _react.PropTypes.object
};
exports.default = TransitLeg;
module.exports = exports['default'];

//# sourceMappingURL=transit-leg.js