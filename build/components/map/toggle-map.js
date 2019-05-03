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

var _legDiagram = require('./leg-diagram');

var _legDiagram2 = _interopRequireDefault(_legDiagram);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ToggleMap = function (_Component) {
  (0, _inherits3.default)(ToggleMap, _Component);

  function ToggleMap() {
    (0, _classCallCheck3.default)(this, ToggleMap);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ToggleMap.__proto__ || (0, _getPrototypeOf2.default)(ToggleMap)).call(this));

    _this.state = {
      visibleChild: 0
    };
    return _this;
  }

  (0, _createClass3.default)(ToggleMap, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      var diagramLeg = this.props.diagramLeg;


      var showDiagram = diagramLeg;

      return _react2.default.createElement(
        'div',
        { className: 'map-container' },
        this.props.children.map(function (child, i) {
          return _react2.default.createElement(
            'div',
            { key: i,
              className: 'map-container',
              style: { visibility: i === _this2.state.visibleChild ? 'visible' : 'hidden' }
            },
            _this2.props.children[i]
          );
        }),
        _react2.default.createElement(
          'div',
          { style: { position: 'absolute', bottom: 12 + (showDiagram ? 192 : 0), left: 12, zIndex: 100000 } },
          _react2.default.createElement(
            _reactBootstrap.ButtonGroup,
            null,
            this.props.children.map(function (child, i) {
              return _react2.default.createElement(
                _reactBootstrap.Button,
                {
                  key: i,
                  bsSize: 'xsmall',
                  bsStyle: i === _this2.state.visibleChild ? 'success' : 'default',
                  style: { padding: '3px 6px' },
                  onClick: function onClick() {
                    _this2.setState({ visibleChild: i });
                  }
                },
                child.props.toggleLabel
              );
            })
          )
        ),
        showDiagram && _react2.default.createElement(_legDiagram2.default, { leg: diagramLeg })
      );
    }
  }]);
  return ToggleMap;
}(_react.Component);

// Connect to Redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return { diagramLeg: state.otp.ui.diagramLeg };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(ToggleMap);
module.exports = exports['default'];

//# sourceMappingURL=toggle-map.js