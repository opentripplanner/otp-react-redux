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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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

    _this._onExpandClick = function () {
      _this.props.showLegDiagram(_this.props.leg);
    };

    _this.state = { width: null };
    return _this;
  }

  (0, _createClass3.default)(LegDiagramPreview, [{
    key: 'render',
    value: function render() {
      var leg = this.props.leg;

      // Don't show for very short legs

      if (leg.distance < 500 || leg.mode === 'CAR') return null;

      return _react2.default.createElement(
        'div',
        { className: 'leg-diagram-preview' },
        _react2.default.createElement(
          'div',
          { className: 'diagram' },
          generateSvg(leg.steps, this.state.width),
          _react2.default.createElement(_reactResizeDetector2.default, { handleWidth: true, onResize: this._onResize })
        ),
        _react2.default.createElement(
          'div',
          { className: 'expand-button-container' },
          _react2.default.createElement(
            _reactBootstrap.Button,
            {
              className: 'expand-button',
              bsSize: 'xsmall',
              onClick: this._onExpandClick
            },
            _react2.default.createElement('i', { className: 'fa fa-expand' })
          )
        )
      );
    }
  }]);
  return LegDiagramPreview;
}(_react.Component), _class.propTypes = {
  leg: _react.PropTypes.object
}, _temp);


function generateSvg(steps, width) {
  var height = 30;
  var minElev = 100000;
  var maxElev = -100000;
  var traversed = 0;
  var ptArr = [];

  // Iterate through the steps, building the array of elevation points and
  // keeping track of the minimum and maximum elevations reached
  steps.forEach(function (step) {
    if (!step.elevation || step.elevation.length === 0) {
      traversed += step.distance;
      return;
    }
    for (var i = 0; i < step.elevation.length; i++) {
      var elev = step.elevation[i];
      if (elev.second < minElev) minElev = elev.second;
      if (elev.second > maxElev) maxElev = elev.second;
      ptArr.push([traversed + elev.first, elev.second]);
    }
    traversed += step.distance;
  });

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
      strokeWidth: 2
    })
  );
}

// Connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  return {};
};

var mapDispatchToProps = {
  showLegDiagram: _map.showLegDiagram
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(LegDiagramPreview);
module.exports = exports['default'];

//# sourceMappingURL=leg-diagram-preview.js