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

var _reactBootstrap = require('react-bootstrap');

var _defaultMap = require('./default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _legDiagram = require('./leg-diagram');

var _legDiagram2 = _interopRequireDefault(_legDiagram);

var _stylizedMap = require('./stylized-map');

var _stylizedMap2 = _interopRequireDefault(_stylizedMap);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var Map = function (_Component) {
  (0, _inherits3.default)(Map, _Component);

  function Map() {
    (0, _classCallCheck3.default)(this, Map);

    var _this = (0, _possibleConstructorReturn3.default)(this, (Map.__proto__ || (0, _getPrototypeOf2.default)(Map)).call(this));

    _this.state = {
      activeViewIndex: 0
    };
    return _this;
  }

  (0, _createClass3.default)(Map, [{
    key: 'getComponentForView',
    value: function getComponentForView(view) {
      // TODO: allow a 'CUSTOM' type
      switch (view.type) {
        case 'DEFAULT':
          return _react2.default.createElement(_defaultMap2.default, null);
        case 'STYLIZED':
          return _react2.default.createElement(_stylizedMap2.default, null);
      }
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          diagramLeg = _props.diagramLeg,
          mapConfig = _props.mapConfig;


      var showDiagram = diagramLeg;

      // Use the views defined in the config; if none defined, just show the default map
      var views = mapConfig.views || [{ type: 'DEFAULT' }];

      return _react2.default.createElement(
        'div',
        { className: 'map-container' },
        views.map(function (view, i) {
          return _react2.default.createElement(
            'div',
            { key: i,
              className: 'map-container',
              style: { visibility: i === _this2.state.activeViewIndex ? 'visible' : 'hidden' }
            },
            _this2.getComponentForView(view)
          );
        }),
        views.length > 1 && _react2.default.createElement(
          'div',
          { style: { position: 'absolute', bottom: 12 + (showDiagram ? 192 : 0), left: 12, zIndex: 100000 } },
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            null,
            views.map(function (view, i) {
              return _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  key: i,
                  bsSize: 'xsmall',
                  bsStyle: i === _this2.state.activeViewIndex ? 'success' : 'default',
                  style: { padding: '3px 6px' },
                  onClick: function onClick() {
                    _this2.setState({ activeViewIndex: i });
                  }
                },
                view.text || view.type
              );
            })
          )
        ),
        showDiagram && _react2.default.createElement(_legDiagram2.default, { leg: diagramLeg })
      );
    }
  }]);
  return Map;
}(_react.Component);

// Connect to Redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    diagramLeg: state.otp.ui.diagramLeg,
    mapConfig: state.otp.config.map
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(Map);
module.exports = exports['default'];

//# sourceMappingURL=map.js