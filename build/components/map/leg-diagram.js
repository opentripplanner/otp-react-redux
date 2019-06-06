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

var _lodash = require('lodash.memoize');

var _lodash2 = _interopRequireDefault(_lodash);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactBootstrap = require('react-bootstrap');

var _reactRedux = require('react-redux');

var _reactResizeDetector = require('react-resize-detector');

var _reactResizeDetector2 = _interopRequireDefault(_reactResizeDetector);

var _map = require('../../actions/map');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Fixed dimensions for chart
var height = 160;
var yAxisPanelWidth = 40; // width of y axis labels
var BASELINE_Y = height - 20;
var topElevYPx = 20;
var bottomElevYPx = height - 40;
var elevHeight = bottomElevYPx - topElevYPx;

var METERS_TO_FEET = 3.28084;

var LegDiagram = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(LegDiagram, _Component);

  function LegDiagram(props) {
    (0, _classCallCheck3.default)(this, LegDiagram);

    var _this = (0, _possibleConstructorReturn3.default)(this, (LegDiagram.__proto__ || (0, _getPrototypeOf2.default)(LegDiagram)).call(this, props));

    _this._determineCompressionFactor = function (width, leg) {
      var _this$_getElevationPr = _this._getElevationProfile(leg),
          traversed = _this$_getElevationPr.traversed;

      if (traversed > 0) {
        // Determine the appropriate compression factor to scale the elevation
        // chart to fit the container width (i.e., remove the need for x-scrolling).
        var xAxisCompression = width / (traversed + yAxisPanelWidth);
        _this.setState({ xAxisCompression: xAxisCompression, width: width });
      }
    };

    _this._onResize = function (width, height) {
      _this._determineCompressionFactor(width, _this.props.leg);
    };

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

    _this._unitConversion = function () {
      return _this.state.useImperialUnits ? METERS_TO_FEET : 1;
    };

    _this._getElevationProfile = (0, _lodash2.default)(function (leg) {
      if (!leg) return {};
      return (0, _itinerary.getElevationProfile)(leg.steps, _this._unitConversion());
    });

    _this.state = {
      useImperialUnits: true,
      xAxisCompression: 0.5
    };
    return _this;
  }

  (0, _createClass3.default)(LegDiagram, [{
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      var leg = nextProps.leg;

      if (leg && this.props.leg && leg.startTime !== this.props.leg.startTime) {
        this._determineCompressionFactor(this.state.width, leg);
      }
    }

    /** Set mouse hover location for drawing elevation point. */

  }, {
    key: '_formatElevation',


    /** Round elevation to whole number and add symbol. */
    value: function _formatElevation(elev) {
      return Math.round(elev) + (this.state.useImperialUnits ? '\'' : 'm');
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var elevationPoint = this.props.elevationPoint;
      var xAxisCompression = this.state.xAxisCompression;
      var leg = this.props.leg;

      if (!leg) return null;

      var yAxisPanelSvgContent = [];

      var backgroundSvgContent = [];
      var mainSvgContent = [];
      var foregroundSvgContent = [];

      var _getElevationProfile = this._getElevationProfile(leg),
          minElev = _getElevationProfile.minElev,
          maxElev = _getElevationProfile.maxElev,
          points = _getElevationProfile.points,
          traversed = _getElevationProfile.traversed;

      var SVG_WIDTH = traversed * xAxisCompression;
      var range = maxElev - minElev;
      var rangeUnit = range >= 500 ? 100 : 50;

      // Compute the displayed elevation range
      var minDisplayed = Math.floor(minElev / rangeUnit) * rangeUnit;
      var maxDisplayed = Math.ceil(maxElev / rangeUnit) * rangeUnit;
      var displayedRange = maxDisplayed - minDisplayed;

      // Draw the y-axis labels & guidelines
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
          x2: SVG_WIDTH,
          y2: y,
          strokeWidth: 1,
          stroke: '#ccc',
          strokeDasharray: '1, 1'
        }));
      }

      // Process each step in this leg
      var currentX = 0;
      var ptArr = [];
      var stepArr = [currentX];
      var stepDetails = [];
      var previousPair = void 0;
      leg.steps.map(function (step, stepIndex) {
        var stepWidthPx = step.distance * xAxisCompression;
        var gain = 0;
        var loss = 0;
        // Add this step to the polyline coords
        if (step.elevation && step.elevation.length > 0) {
          for (var _i = 0; _i < step.elevation.length; _i++) {
            var elevPair = step.elevation[_i];
            if (previousPair) {
              var diff = (elevPair.second - previousPair.second) * _this2._unitConversion();
              if (diff > 0) gain += diff;else loss += diff;
            }
            var x = currentX + elevPair.first * xAxisCompression; // - firstX
            var _y = topElevYPx + elevHeight - elevHeight * (elevPair.second * _this2._unitConversion() - minDisplayed) / displayedRange;
            ptArr.push([x, _y]);
            previousPair = elevPair;
          }
        }

        // Add the street segment as a horizontal line at the bottom of the diagram
        mainSvgContent.push(_react2.default.createElement('line', {
          key: 'step-' + stepIndex + '-line',
          x1: currentX + 1,
          y1: BASELINE_Y,
          x2: currentX + stepWidthPx - 1,
          y2: BASELINE_Y,
          strokeWidth: 6,
          stroke: '#aaa'
        }));
        // Add The street name label, including clipping path to prevent overflow
        if (stepWidthPx > 30) {
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
                y: BASELINE_Y + 16,
                fontSize: 11,
                textAnchor: 'middle'
              },
              gain >= 10 && _react2.default.createElement(
                'tspan',
                { fill: 'red' },
                '\u2191',
                _this2._formatElevation(gain),
                '  '
              ),
              loss <= -10 && _react2.default.createElement(
                'tspan',
                { fill: 'green' },
                '\u2193',
                _this2._formatElevation(-loss)
              )
            )
          ));
        }
        currentX += stepWidthPx;
        stepArr.push(currentX);
        stepDetails.push({ gain: gain, loss: loss });
      });
      if (ptArr.length === 0) {
        console.warn('There is no elevation data to render for leg', leg);
        return null;
      }
      // Add initial point if the first elevation entry does not start at zero
      // distance.
      if (ptArr[0][0] !== 0) ptArr.unshift([0, ptArr[0][1]]);
      // Add final points in order to round out area field.
      ptArr.push([SVG_WIDTH, ptArr[ptArr.length - 1][1]]);
      ptArr.push([ptArr[ptArr.length - 1][0], BASELINE_Y]);
      ptArr.push([0, BASELINE_Y]);
      // Construct and add the main elevation contour area
      var pts = ptArr.map(function (pt, i) {
        return i === 0 ? 'M' + pt[0] + ' ' + pt[1] : 'L' + pt[0] + ' ' + pt[1];
      }).join(' ');
      mainSvgContent.unshift(_react2.default.createElement('path', {
        key: 'elev-polyline',
        d: pts + ' Z',
        strokeWidth: 0,
        fill: 'lightsteelblue',
        fillOpacity: 0.5
      }));

      // Add the highlighted elevation point (on mouse hover), if actively hovering.
      if (elevationPoint) {
        var _elev = (0, _itinerary.legElevationAtDistance)(points, elevationPoint);
        var elevConverted = _elev * this._unitConversion();
        var x = elevationPoint * xAxisCompression;
        for (var i = 0; i < stepArr.length; i++) {
          if (x >= stepArr[i] && x <= stepArr[i + 1]) {
            var beginStep = stepArr[i];
            // Mouse hover is at step i, add hover fill for street step and draw
            // street label
            var stepWidth = stepArr[i + 1] - beginStep;
            backgroundSvgContent.push(_react2.default.createElement('rect', {
              key: 'step-hover-' + i,
              x: beginStep,
              y: 0,
              width: stepWidth,
              height: 200,
              fillOpacity: 0.5,
              fill: '#eee' }));
            var name = compressStreetName(leg.steps[i].streetName);
            var fontSize = 22;
            var midPoint = beginStep + stepWidth / 2;
            // Determine where to anchor hover street label text (to avoid
            // clipping on edges of svg).
            var anchor = 'middle';
            var _x = midPoint;
            var halfLabelWidth = (0, _itinerary.getTextWidth)(name) / 2;
            if (midPoint - halfLabelWidth < 0) {
              // Anchor left edge of text to left of svg
              anchor = 'start';
              _x = 0 + 3;
            } else if (midPoint + halfLabelWidth > SVG_WIDTH) {
              // Anchor right edge of text to right of svg
              anchor = 'end';
              _x = SVG_WIDTH - 3;
            }
            backgroundSvgContent.push(_react2.default.createElement(
              'text',
              {
                key: 'step-text-hover-' + i,
                x: _x,
                y: height / 2,
                fontSize: fontSize,
                textAnchor: anchor,
                fill: '#777',
                opacity: 0.6
              },
              name
            ));
          }
        }
        var _y2 = _elev !== null ? topElevYPx + elevHeight - elevHeight * (elevConverted - minDisplayed) / displayedRange : height / 2;
        backgroundSvgContent.push(_react2.default.createElement('line', {
          key: 'elev-point-line',
          x1: x,
          y1: _elev !== null ? _y2 : topElevYPx,
          x2: x,
          y2: BASELINE_Y,
          strokeWidth: 1,
          stroke: '#aaa'
        }));
        // Only add the current elevation indicator and label if there is a data
        // point available.
        if (_elev !== null) {
          foregroundSvgContent.push(_react2.default.createElement('circle', {
            key: 'elev-point-circle',
            cx: x,
            cy: _y2,
            r: '4',
            fill: '#084c8d',
            stroke: 'white',
            strokeWidth: '0'
          }));
          // Add the current elevation text label
          foregroundSvgContent.push(_react2.default.createElement(
            'text',
            {
              key: 'elev-point-label',
              x: x,
              y: _y2 - 10,
              fontSize: 11,
              textAnchor: 'middle' },
            this._formatElevation(elevConverted)
          ));
        }
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
            { height: height, width: SVG_WIDTH + 10 },
            backgroundSvgContent,
            mainSvgContent,
            foregroundSvgContent
          ),
          _react2.default.createElement(_reactResizeDetector2.default, { handleWidth: true, onResize: this._onResize })
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