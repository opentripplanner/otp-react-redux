'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

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

var _class, _temp, _initialiseProps;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactRedux = require('react-redux');

var _reactLeaflet = require('react-leaflet');

var _reactContainerDimensions = require('react-container-dimensions');

var _reactContainerDimensions2 = _interopRequireDefault(_reactContainerDimensions);

var _map = require('../../actions/map');

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

var _map2 = require('../../util/map');

var _state = require('../../util/state');

var _itinerary = require('../../util/itinerary');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var BaseMap = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(BaseMap, _Component);

  /* Constructor */

  function BaseMap(props) {
    (0, _classCallCheck3.default)(this, BaseMap);

    // For controlled overlays, maintain a map of boolean visibility status,
    // indexed by controlName string
    var _this = (0, _possibleConstructorReturn3.default)(this, (BaseMap.__proto__ || (0, _getPrototypeOf2.default)(BaseMap)).call(this, props));

    _initialiseProps.call(_this);

    var overlayVisibility = {};
    _react2.default.Children.toArray(_this.props.children).forEach(function (child) {
      if (child.props.controlName && child.props.visible) {
        overlayVisibility[child.props.controlName] = child.props.visible;
      }
    });

    _this.state = { overlayVisibility: overlayVisibility };
    return _this;
  }

  /* Internal Methods */

  // TODO: make map controlled component


  (0, _createClass3.default)(BaseMap, [{
    key: '_updateBounds',
    value: function _updateBounds(oldProps, newProps) {
      // TODO: maybe setting bounds ought to be handled in map props...

      var map = this.refs.map;

      if (!map) return;

      var padding = [30, 30];

      // Fit map to to entire itinerary if active itinerary bounds changed
      var oldItinBounds = oldProps && oldProps.itinerary && (0, _itinerary.getItineraryBounds)(oldProps.itinerary);
      var newItinBounds = newProps.itinerary && (0, _itinerary.getItineraryBounds)(newProps.itinerary);
      if (!oldItinBounds && newItinBounds || oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds)) {
        map.leafletElement.fitBounds(newItinBounds, { padding: padding });

        // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
      } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
        map.leafletElement.fitBounds((0, _itinerary.getLegBounds)(newProps.itinerary.legs[newProps.activeLeg]), { padding: padding });

        // If no itinerary update but from/to locations are present, fit to those
      } else if (newProps.query.from && newProps.query.to) {
        map.leafletElement.fitBounds([[newProps.query.from.lat, newProps.query.from.lon], [newProps.query.to.lat, newProps.query.to.lon]], { padding: padding });

        // If only from or to is set, pan to that
      } else if (newProps.query.from) {
        map.leafletElement.panTo([newProps.query.from.lat, newProps.query.from.lon]);
      } else if (newProps.query.to) {
        map.leafletElement.panTo([newProps.query.to.lat, newProps.query.to.lon]);

        // Pan to to itinerary step if made active (clicked)
      } else if (newProps.itinerary && newProps.activeLeg !== null && newProps.activeStep !== null && newProps.activeStep !== oldProps.activeStep) {
        var leg = newProps.itinerary.legs[newProps.activeLeg];
        var step = leg.steps[newProps.activeStep];
        map.leafletElement.panTo([step.lat, step.lon]);
      }
    }

    /* React Lifecycle methods */

  }, {
    key: 'componentDidMount',
    value: function componentDidMount() {
      this._updateBounds(null, this.props);
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this._updateBounds(this.props, nextProps);
    }

    // remove custom overlays on unmount

  }, {
    key: 'componentWillUnmount',
    value: function componentWillUnmount() {
      var lmap = this.refs.map.leafletElement;
      lmap.eachLayer(function (layer) {
        lmap.removeLayer(layer);
      });
    }
  }, {
    key: 'render',
    value: function render() {
      var _this2 = this;

      var _props = this.props,
          config = _props.config,
          children = _props.children,
          diagramLeg = _props.diagramLeg,
          elevationPoint = _props.elevationPoint;
      var baseLayers = this.props.config.map.baseLayers;


      var userControlledOverlays = [];
      var fixedOverlays = [];
      _react2.default.Children.toArray(children).forEach(function (child) {
        if (child.props.controlName) {
          // Add the visibility flag to this layer and push to the interal
          // array of user-controlled overlays
          var visible = _this2.state.overlayVisibility[child.props.controlName];
          var childWithVisibility = _react2.default.cloneElement(child, { visible: visible });
          userControlledOverlays.push(childWithVisibility);
        } else {
          fixedOverlays.push(child);
        }
      });

      var popupPosition = this.state.popupPosition;


      var center = config.map && config.map.initLat && config.map.initLon ? [config.map.initLat, config.map.initLon] : null;

      /* TODO: currently mapProps is unused, but may later be used for controlling
       * map location state
       // const position = [+mapState.lat, +mapState.lon]
      // const zoom = +mapState.zoom
      const bounds = null // mapState.bounds
      const mapProps = {
        ref: 'map',
        className: 'map',
        // center: position,
        // bounds: mapState.bounds || null,
        // zoom: config.initZoom,
        // zoom: +mapState.zoom,
        onContextMenu: this._onRightClick
        // onMoveEnd: this._mapBoundsChanged,
        // onZoomEnd: this._mapBoundsChanged,
      }
      if (bounds) {
        mapProps.bounds = bounds
      } else if (position && zoom) {
        mapProps.center = position
        mapProps.zoom = zoom
      } else {
        console.error('no map position/bounds provided!', {position, zoom, bounds})
      } */

      // Compute the elevation point marker, if activeLeg
      var elevationPointMarker = null;
      if (diagramLeg && elevationPoint) {
        var pos = (0, _itinerary.legLocationAtDistance)(diagramLeg, elevationPoint);
        if (pos) {
          elevationPointMarker = _react2.default.createElement(_reactLeaflet.Marker, { position: pos });
        }
      }

      return _react2.default.createElement(
        _reactLeaflet.Map,
        {
          ref: 'map',
          className: 'map',
          center: center,
          zoom: config.map.initZoom || 13,
          onClick: this._onLeftClick,
          onContextMenu: this._onRightClick,
          onOverlayAdd: this._onOverlayAdd,
          onOverlayRemove: this._onOverlayRemove
        },
        _react2.default.createElement(
          _reactLeaflet.LayersControl,
          { position: 'topright' },
          /* base layers */
          baseLayers && baseLayers.map(function (l, i) {
            return _react2.default.createElement(
              _reactLeaflet.LayersControl.BaseLayer,
              {
                name: l.name,
                checked: i === 0,
                key: i },
              _react2.default.createElement(_reactLeaflet.TileLayer, {
                url: l.url,
                attribution: l.attribution,
                maxZoom: l.maxZoom,
                detectRetina: true })
            );
          }),
          /* user-controlled overlay layers */
          userControlledOverlays.map(function (child, i) {
            return _react2.default.createElement(
              _reactLeaflet.LayersControl.Overlay,
              { key: i,
                name: child.props.controlName,
                checked: child.props.visible
              },
              child
            );
          })
        ),
        fixedOverlays,
        popupPosition ? _react2.default.createElement(
          _reactLeaflet.Popup,
          { ref: 'clickPopup',
            key: popupPosition.toString() // hack to ensure the popup opens only on right click
            , position: popupPosition // FIXME: onOpen and onClose don't seem to work?
            // onOpen={() => this.setState({popupPosition: null})}
            // onClose={() => this.setState({popupPosition: null})}
          },
          _react2.default.createElement(
            'span',
            null,
            'Plan a trip:',
            _react2.default.createElement(
              'span',
              { style: { margin: '0px 5px' } },
              _react2.default.createElement(_locationIcon2.default, { type: 'from' })
            ),
            _react2.default.createElement(
              'button',
              { className: 'link-button',
                onClick: this._onClickFrom },
              'From here'
            ),
            ' ',
            '|',
            ' ',
            _react2.default.createElement(
              'span',
              { style: { margin: '0px 5px' } },
              _react2.default.createElement(_locationIcon2.default, { type: 'to' })
            ),
            _react2.default.createElement(
              'button',
              { className: 'link-button',
                onClick: this._onClickTo },
              'To here'
            )
          )
        ) : null,
        elevationPointMarker
      );
    }
  }]);
  return BaseMap;
}(_react.Component), _class.propTypes = {
  config: _react.PropTypes.object,
  mapClick: _react.PropTypes.func,
  setLocation: _react.PropTypes.func, // TODO: rename from action name to avoid namespace conflict?
  toggleName: _react.PropTypes.element }, _initialiseProps = function _initialiseProps() {
  var _this3 = this;

  this._setLocationFromPopup = function (type) {
    var setLocation = _this3.props.setLocation;

    var location = (0, _map2.constructLocation)(_this3.state.popupPosition);
    setLocation({ type: type, location: location, reverseGeocode: true });
    _this3.setState({ popupPosition: null });
    if (typeof _this3.props.onSetLocation === 'function') {
      _this3.props.onSetLocation({ type: type, location: location });
    }
  };

  this._onClickTo = function () {
    return _this3._setLocationFromPopup('to');
  };

  this._onClickFrom = function () {
    return _this3._setLocationFromPopup('from');
  };

  this._onLeftClick = function (e) {
    if (typeof _this3.props.onClick === 'function') _this3.props.onClick(e);
  };

  this._onRightClick = function (e) {
    _this3.setState({ popupPosition: e.latlng });
  };

  this._onOverlayAdd = function (evt) {
    var overlayVisibility = (0, _extends3.default)({}, _this3.state.overlayVisibility);
    overlayVisibility[evt.name] = true;
    _this3.setState({ overlayVisibility: overlayVisibility });
  };

  this._onOverlayRemove = function (evt) {
    var overlayVisibility = (0, _extends3.default)({}, _this3.state.overlayVisibility);
    overlayVisibility[evt.name] = false;
    _this3.setState({ overlayVisibility: overlayVisibility });
  };

  this._mapBoundsChanged = function (e) {
    // if (this.state.zoomToTarget) {
    //   setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
    //   return false
    // } else {
    // const zoom = e.target.getZoom()
    var bounds = e.target.getBounds();
    // if (this.props.mapState.zoom !== zoom) {
    //   this.props.updateMapState({zoom})
    // }
    if (!bounds.equals(_this3.props.mapState.bounds)) {
      _this3.props.updateMapState({ bounds: e.target.getBounds() });
    }
    // }
  };
}, _temp);

// connect to the redux store

var mapStateToProps = function mapStateToProps(state, ownProps) {
  var activeSearch = (0, _state.getActiveSearch)(state.otp);
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    config: state.otp.config,
    diagramLeg: state.otp.ui.diagramLeg,
    elevationPoint: state.otp.ui.elevationPoint,
    mapState: state.otp.mapState,
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat !== null && state.otp.currentQuery.from.lon !== null,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat !== null && state.otp.currentQuery.to.lon !== null,
    itinerary: (0, _state.getActiveItinerary)(state.otp),
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BaseMap);
module.exports = exports['default'];

//# sourceMappingURL=base-map.js