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

var _map = require('../../actions/map');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var METERS_TO_FEET = 3.28084;

var LegDiagram = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(LegDiagram, _Component);

  function LegDiagram(props) {
    (0, _classCallCheck3.default)(this, LegDiagram);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LegDiagram.__proto__ || (0, _getPrototypeOf2.default)(LegDiagram)).call(this, props));

    _this._onMouseMove = function (evt) {
      var m = evt.clientX - _this.container.getBoundingClientRect().left + _this.container.scrollLeft;
      _this.props.setElevationPoint(m / _this.state.xAxisCompression);
    };

    _this._onMouseLeave = function () {
      _this.props.setElevationPoint(null);
    };

    _this._onCloseButtonClick = function () {
      _this.props.showLegDiagram(null);
      _this.props.setElevationPoint(null);
    };

    _this.state = {
      useImperialUnits: true,
      xAxisCompression: 0.5
    };
    return _this;
  }

  (0, _createClass3.default)(LegDiagram, [{
    key: '_formatElevation',
    value: function _formatElevation(elev) {
      return Math.round(elev * 10) / 10 + (this.state.useImperialUnits ? '\'' : 'm');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var elevationPoint = this.props.elevationPoint;
      var _state = this.state,
          useImperialUnits = _state.useImperialUnits,
          xAxisCompression = _state.xAxisCompression;

      var unitConversion = useImperialUnits ? METERS_TO_FEET : 1;

      var leg = this.props.leg;

      if (!leg) return null;

      var yAxisPanelSvgContent = [];

      var backgroundSvgContent = [];
      var mainSvgContent = [];
      var foregroundSvgContent = [];

      // Do an initial iteration through all steps to determine the min/max elevation
      var minElev = 100000;
      var maxElev = -100000;
      var traversed = 0;
      leg.steps.forEach(function (step) {
        traversed += step.distance;
        if (!step.elevation || step.elevation.length === 0) return;
        for (var i = 0; i < step.elevation.length; i++) {
          var elev = step.elevation[i].second * unitConversion;
          if (elev < minElev) minElev = elev;
          if (elev > maxElev) maxElev = elev;
        }
      });

      var height = 160;
      var yAxisPanelWidth = 40;
      var lineY = height - 20;
      var topElevYPx = 20;
      var bottomElevYPx = height - 40;
      var elevHeight = bottomElevYPx - topElevYPx;
      var width = traversed * xAxisCompression;
      var rangeUnit = useImperialUnits ? 100 : 50;

      // Compute the displayed elevation range and draw the y-axis labels & guidelines
      var minDisplayed = Math.floor(minElev / rangeUnit) * rangeUnit;
      var maxDisplayed = Math.ceil(maxElev / rangeUnit) * rangeUnit;
      var displayedRange = maxDisplayed - minDisplayed;

      for (var elev = minDisplayed; elev <= maxDisplayed; elev += rangeUnit) {
        var y = topElevYPx + elevHeight - elevHeight * (elev - minDisplayed) / displayedRange;
        yAxisPanelSvgContent.push(_react2.default.createElement(
          'text',
          {
            key: 'axis-label-' + elev,
            x: yAxisPanelWidth - 3,
            y: y + 3,
            fontSize: 11,
            textAnchor: 'end'
          },
          this._formatElevation(elev)
        ));
        backgroundSvgContent.push(_react2.default.createElement('line', {
          key: 'axis-guideline-' + elev,
          x1: 0,
          y1: y,
          x2: width,
          y2: y,
          strokeWidth: 1,
          stroke: '#ccc',
          strokeDasharray: '1, 1'
        }));
      }

      // Process each step in this leg
      var currentX = 0;
      var ptArr = [];
      leg.steps.map(function (step, stepIndex) {
        var stepWidthPx = step.distance * xAxisCompression;

        // Add this step to the polyline coords
        if (step.elevation && step.elevation.length > 0) {
          for (var i = 0; i < step.elevation.length; i++) {
            var elevPair = step.elevation[i];
            var x = currentX + elevPair.first * xAxisCompression;
            var _y = topElevYPx + elevHeight - elevHeight * (elevPair.second * unitConversion - minDisplayed) / displayedRange;
            ptArr.push([x, _y]);
          }
        }

        // Add the street segment as a horizontal line at the bottom of the diagram
        mainSvgContent.push(_react2.default.createElement('line', {
          key: 'step-' + stepIndex + '-line',
          x1: currentX + 1,
          y1: lineY,
          x2: currentX + stepWidthPx - 1,
          y2: lineY,
          strokeWidth: 6,
          stroke: '#aaa'
        }));

        // Add The street name label, including clipping path to prevent overflow
        if (stepWidthPx > 100) {
          mainSvgContent.push(_react2.default.createElement(
            'g',
            { key: 'step-' + stepIndex + '-label' },
            _react2.default.createElement(
              'clipPath',
              { id: 'clip-' + stepIndex },
              _react2.default.createElement('rect', { x: currentX + 10, y: 0, width: stepWidthPx - 10, height: 200 })
            ),
            _react2.default.createElement(
              'text',
              {
                x: currentX + stepWidthPx / 2,
                y: lineY + 16,
                fontSize: 11,
                clipPath: 'url(#clip-' + stepIndex + ')',
                textAnchor: 'middle'
              },
              compressStreetName(step.streetName)
            )
          ));
        }
        currentX += stepWidthPx;
      });

      // Construct and add the main elevation contour line
      var pts = ptArr.map(function (pt) {
        return pt[0] + ',' + pt[1];
      }).join(' ');
      mainSvgContent.push(_react2.default.createElement('polyline', {
        key: 'elev-polyline',
        points: pts,
        strokeWidth: 2,
        stroke: '#000',
        fill: 'none'
      }));

      // Add the highlighted elevation point, if active
      if (elevationPoint) {
        var _elev = (0, _itinerary.legElevationAtDistance)(leg, elevationPoint) * unitConversion;
        var x = elevationPoint * xAxisCompression;
        var _y2 = topElevYPx + elevHeight - elevHeight * (_elev - minDisplayed) / displayedRange;
        backgroundSvgContent.push(_react2.default.createElement('line', {
          key: 'elev-point-line',
          x1: x,
          y1: _y2,
          x2: x,
          y2: lineY,
          strokeWidth: 1,
          stroke: '#aaa'
        }));
        foregroundSvgContent.push(_react2.default.createElement('circle', {
          key: 'elev-point-circle',
          cx: x,
          cy: _y2,
          r: '4',
          fill: 'blue',
          stroke: 'white',
          strokeWidth: '2'
        }));

        // Add the current elevation text label
        foregroundSvgContent.push(_react2.default.createElement(
          'text',
          { key: 'elev-point-label', x: x, y: _y2 - 10, fontSize: 11, textAnchor: 'middle' },
          this._formatElevation(_elev)
        ));
      }

      return _react2.default.createElement(
        'div',
        { className: 'leg-diagram' },
        _react2.default.createElement(
          'div',
          { className: 'y-axis-panel', style: { width: yAxisPanelWidth } },
          _react2.default.createElement(
            'svg',
            null,
            yAxisPanelSvgContent
          )
        ),
        _react2.default.createElement(
          'div',
          {
            ref: function ref(container) {
              _this2.container = container;
            },
            onMouseMove: this._onMouseMove,
            onMouseLeave: this._onMouseLeave,
            className: 'main-diagram',
            style: { left: 40 }
          },
          _react2.default.createElement(
            'svg',
            { height: height, width: width + 10 },
            backgroundSvgContent,
            mainSvgContent,
            foregroundSvgContent
          )
        ),
        _react2.default.createElement(
          _reactBootstrap.Button,
          {
            className: 'close-button clear-button-formatting',
            onClick: this._onCloseButtonClick
          },
          _react2.default.createElement('i', { className: 'fa fa-close' })
        )
      );
    }
  }]);
  return LegDiagram;
}(_react.Component), _class.propTypes = {
  elevationPoint: _react.PropTypes.number,
  showLegDiagram: _react.PropTypes.func,
  setElevationPoint: _react.PropTypes.func
}, _temp);


function compressStreetName(name) {
  return name.split(' ').map(function (str) {
    if (str === 'Northwest') return 'NW';
    if (str === 'Northeast') return 'NE';
    if (str === 'Southwest') return 'SW';
    if (str === 'Southeast') return 'SE';
    if (str === 'North') return 'N';
    if (str === 'East') return 'E';
    if (str === 'South') return 'S';
    if (str === 'West') return 'W';
    if (str === 'Street') return 'St';
    if (str === 'Avenue') return 'Ave';
    if (str === 'Road') return 'Rd';
    if (str === 'Drive') return 'Dr';
    if (str === 'Boulevard') return 'Blvd';
    return str;
  }).join(' ');
}

// Connect to Redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {
    elevationPoint: state.otp.ui.elevationPoint
  };
};

var mapDispatchToProps = {
  showLegDiagram: _map.showLegDiagram,
  setElevationPoint: _map.setElevationPoint
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LegDiagram);
module.exports = exports['default'];

//# sourceMappingURL=leg-diagram.js