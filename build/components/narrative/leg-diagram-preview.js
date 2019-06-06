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

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _reactResizeDetector = require('react-resize-detector');

var _reactResizeDetector2 = _interopRequireDefault(_reactResizeDetector);

var _map = require('../../actions/map');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var METERS_TO_FEET = 3.28084;

var LegDiagramPreview = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(LegDiagramPreview, _Component);

  function LegDiagramPreview(props) {
    (0, _classCallCheck3.default)(this, LegDiagramPreview);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LegDiagramPreview.__proto__ || (0, _getPrototypeOf2.default)(LegDiagramPreview)).call(this, props));

    _this._onResize = function (width, height) {
      if (width > 0) {
        _this.setState({ width: width });
      }
    };

    _this._isActive = function () {
      var _this$props = _this.props,
          diagramVisible = _this$props.diagramVisible,
          leg = _this$props.leg;

      return diagramVisible && diagramVisible.startTime === leg.startTime;
    };

    _this._onExpandClick = function () {
      var _this$props2 = _this.props,
          diagramVisible = _this$props2.diagramVisible,
          leg = _this$props2.leg,
          showLegDiagram = _this$props2.showLegDiagram;

      if (_this._isActive()) showLegDiagram(null);else showLegDiagram(leg);
    };

    _this._formatElevation = function (elev) {
      return Math.round(elev) + '\'';
    };

    _this.state = { width: null };
    return _this;
  }

  /**
   * Determine if the diagram currently visible is for this leg (based on start
   * time).
   */


  /** Round elevation to whole number and add symbol. */


  (0, _createClass3.default)(LegDiagramPreview, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          diagramVisible = _props.diagramVisible,
          leg = _props.leg,
          showElevationProfile = _props.showElevationProfile;

      if (!showElevationProfile) return null;
      var profile = (0, _itinerary.getElevationProfile)(leg.steps);
      // Don't show for very short legs
      if (leg.distance < 500 || leg.mode === 'CAR') return null;

      return _react2.default.createElement(
        'div',
        { className: 'leg-diagram-preview ' + (this._isActive() ? 'on' : '') },
        _react2.default.createElement(
          'div',
          {
            className: 'diagram',
            tabIndex: '0',
            title: 'Toggle elevation chart',
            role: 'button',
            onClick: this._onExpandClick },
          _react2.default.createElement(
            'div',
            { className: 'diagram-title text-center' },
            'Elevation chart',
            ' ',
            _react2.default.createElement(
              'span',
              { style: { fontSize: 'xx-small', color: 'red' } },
              '\u2191',
              this._formatElevation(profile.gain * METERS_TO_FEET),
              '  '
            ),
            _react2.default.createElement(
              'span',
              { style: { fontSize: 'xx-small', color: 'green' } },
              '\u2193',
              this._formatElevation(-profile.loss * METERS_TO_FEET)
            )
          ),
          profile.points.length > 0 ? generateSvg(profile, this.state.width) : 'No elevation data available.',
          _react2.default.createElement(_reactResizeDetector2.default, { handleWidth: true, onResize: this._onResize })
        )
      );
    }
  }]);
  return LegDiagramPreview;
}(_react.Component), _class.propTypes = {
  leg: _react.PropTypes.object
}, _temp);


function generateSvg(profile, width) {
  var height = 30;
  var minElev = profile.minElev,
      maxElev = profile.maxElev,
      ptArr = profile.points,
      traversed = profile.traversed;
  // Pad the min-max range by 25m on either side

  minElev -= 25;
  maxElev += 25;

  // Transform the point array and store it as an SVG-ready string
  var pts = ptArr.map(function (pt) {
    var x = pt[0] / traversed * width;
    var y = height - height * (pt[1] - minElev) / (maxElev - minElev);
    return x + ',' + y;
  }).join(' ');

  // Render the SVG
  return _react2.default.createElement(
    'svg',
    { height: height, width: width },
    _react2.default.createElement('polyline', {
      points: pts,
      fill: 'none',
      stroke: 'black',
      strokeWidth: 1.3
    })
  );
}

// Connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    diagramVisible: state.otp.ui.diagramLeg,
    showElevationProfile: Boolean(state.otp.config.elevationProfile)
  };
};

var mapDispatchToProps = {
  showLegDiagram: _map.showLegDiagram
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LegDiagramPreview);
module.exports = exports['default'];

//# sourceMappingURL=leg-diagram-preview.js