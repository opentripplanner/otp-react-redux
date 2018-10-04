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

var _stopViewer = require('./stop-viewer');

var _stopViewer2 = _interopRequireDefault(_stopViewer);

var _tripViewer = require('./trip-viewer');

var _tripViewer2 = _interopRequireDefault(_tripViewer);

var _routeViewer = require('./route-viewer');

var _routeViewer2 = _interopRequireDefault(_routeViewer);

var _ui = require('../../actions/ui');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ViewerContainer = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ViewerContainer, _Component);

  function ViewerContainer() {
    (0, _classCallCheck3.default)(this, ViewerContainer);
    return (0, _possibleConstructorReturn3.default)(this, (ViewerContainer.__proto__ || (0, _getPrototypeOf2.default)(ViewerContainer)).apply(this, arguments));
  }

  (0, _createClass3.default)(ViewerContainer, [{
    key: 'render',
    value: function render() {
      var uiState = this.props.uiState;

      // check for main panel content

      if (uiState.mainPanelContent === _ui.MainPanelContent.ROUTE_VIEWER) {
        return _react2.default.createElement(_routeViewer2.default, null);
      }

      // check for stop viewer
      if (uiState.viewedStop) {
        return _react2.default.createElement(_stopViewer2.default, null);
      }

      if (uiState.viewedTrip) {
        return _react2.default.createElement(_tripViewer2.default, null);
      }

      // check for trip viewer

      // otherwise, return default content
      return _react2.default.createElement(
        'div',
        null,
        this.props.children
      );
    }
  }]);
  return ViewerContainer;
}(_react.Component), _class.propTypes = {
  uiState: _propTypes2.default.object
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    uiState: state.otp.ui
  };
};

exports.default = (0, _reactRedux.connect)(mapStateToProps)(ViewerContainer);
module.exports = exports['default'];

//# sourceMappingURL=viewer-container.js