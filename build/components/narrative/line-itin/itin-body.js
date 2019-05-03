'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = undefined;

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

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

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _tripDetails = require('../trip-details');

var _tripDetails2 = _interopRequireDefault(_tripDetails);

var _tripTools = require('../trip-tools');

var _tripTools2 = _interopRequireDefault(_tripTools);

var _placeRow = require('./place-row');

var _placeRow2 = _interopRequireDefault(_placeRow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var ItineraryBody = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(ItineraryBody, _Component);

  function ItineraryBody(props) {
    (0, _classCallCheck3.default)(this, ItineraryBody);

    var _this = (0, _possibleConstructorReturn3.default)(this, (ItineraryBody.__proto__ || (0, _getPrototypeOf2.default)(ItineraryBody)).call(this, props));

    _this.rowKey = 0;
    return _this;
  }

  (0, _createClass3.default)(ItineraryBody, [{
    key: 'shouldComponentUpdate',
    value: function shouldComponentUpdate(nextProps, nextState) {
      return !(0, _lodash2.default)(this.props.companies, nextProps.companies) || !(0, _lodash2.default)(this.props.itinerary, nextProps.itinerary);
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          itinerary = _props.itinerary,
          setActiveLeg = _props.setActiveLeg,
          timeOptions = _props.timeOptions;


      var rows = [];
      var followsTransit = false;
      itinerary.legs.forEach(function (leg, i) {
        // Create a row containing this leg's start place and leg traversal details
        rows.push(_react2.default.createElement(_placeRow2.default, (0, _extends3.default)({ key: i,
          place: leg.from,
          time: leg.startTime,
          leg: leg,
          legIndex: i,
          followsTransit: followsTransit
        }, _this2.props)));
        // If this is the last leg, create a special PlaceRow for the destination only
        if (i === itinerary.legs.length - 1) {
          rows.push(_react2.default.createElement(_placeRow2.default, { place: leg.to, time: leg.endTime, timeOptions: timeOptions, setActiveLeg: setActiveLeg, key: i + 1 }));
        }
        if (leg.transitLeg) followsTransit = true;
      });

      return _react2.default.createElement(
        'div',
        { className: 'itin-body' },
        rows,
        _react2.default.createElement(_tripDetails2.default, { itinerary: itinerary }),
        _react2.default.createElement(_tripTools2.default, { itinerary: itinerary })
      );
    }
  }]);
  return ItineraryBody;
}(_react.Component), _class.propTypes = {
  companies: _propTypes2.default.string,
  itinerary: _propTypes2.default.object,
  routingType: _propTypes2.default.string
}, _temp);
exports.default = ItineraryBody;
module.exports = exports['default'];

//# sourceMappingURL=itin-body.js