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

var _container = require('./container');

var _container2 = _interopRequireDefault(_container);

var _navigationBar = require('./navigation-bar');

var _navigationBar2 = _interopRequireDefault(_navigationBar);

var _stopViewer = require('../viewers/stop-viewer');

var _stopViewer2 = _interopRequireDefault(_stopViewer);

var _defaultMap = require('../map/default-map');

var _defaultMap2 = _interopRequireDefault(_defaultMap);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var MobileStopViewer = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(MobileStopViewer, _Component);

  function MobileStopViewer() {
    (0, _classCallCheck3.default)(this, MobileStopViewer);
    return (0, _possibleConstructorReturn3.default)(this, (MobileStopViewer.__proto__ || (0, _getPrototypeOf2.default)(MobileStopViewer)).apply(this, arguments));
  }

  (0, _createClass3.default)(MobileStopViewer, [{
    key: 'render',
    value: function render() {
      var _this2 = this;

      return _react2.default.createElement(
        _container2.default,
        null,
        _react2.default.createElement(_navigationBar2.default, {
          headerText: 'Stop Viewer',
          showBackButton: true,
          onBackClicked: function onBackClicked() {
            _this2.props.clearViewedStop();
          }
        }),
        _react2.default.createElement(
          'div',
          { style: { height: 200 } },
          _react2.default.createElement(_defaultMap2.default, null)
        ),
        _react2.default.createElement(
          'div',
          { className: 'viewer-container' },
          _react2.default.createElement(_stopViewer2.default, { hideBackButton: true })
        )
      );
    }
  }]);
  return MobileStopViewer;
}(_react.Component), _class.propTypes = {
  clearViewedStop: _propTypes2.default.func
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  clearViewedStop: _ui.clearViewedStop
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(MobileStopViewer);
module.exports = exports['default'];

//# sourceMappingURL=stop-viewer.js