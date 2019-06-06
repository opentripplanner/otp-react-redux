'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

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

var _lodash = require('lodash.isequal');

var _lodash2 = _interopRequireDefault(_lodash);

var _reactLeaflet = require('react-leaflet');

var _map = require('../../actions/map');

var _locationIcon = require('../icons/location-icon');

var _locationIcon2 = _interopRequireDefault(_locationIcon);

var _map2 = require('../../util/map');

var _state = require('../../util/state');

var _itinerary = require('../../util/itinerary');

var _leaflet = require('leaflet');

var _leaflet2 = _interopRequireDefault(_leaflet);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_leaflet2.default.Evented.addInitHook(function () {
  this._singleClickTimeout = null;
  this.on('click', this._scheduleSingleClick, this);
  this.on('dblclick dragstart zoomstart', this._cancelSingleClick, this);
});

_leaflet2.default.Evented.include({
  _cancelSingleClick: function _cancelSingleClick() {
    // This timeout is key to workaround an issue where double-click events
    // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
    // instead of ['click', 'click', 'dblclick']
    setTimeout(this._clearSingleClickTimeout.bind(this), 0);
  },

  _scheduleSingleClick: function _scheduleSingleClick(e) {
    this._clearSingleClickTimeout();

    this._singleClickTimeout = setTimeout(this._fireSingleClick.bind(this, e), this.options.singleClickTimeout || 500);
  },

  _fireSingleClick: function _fireSingleClick(e) {
    if (!e.originalEvent._stopped) {
      this.fire('singleclick', _leaflet2.default.Util.extend(e, { type: 'singleclick' }));
    }
  },

  _clearSingleClickTimeout: function _clearSingleClickTimeout() {
    if (this._singleClickTimeout !== null) {
      clearTimeout(this._singleClickTimeout);
      this._singleClickTimeout = null;
    }
  }
});

var BaseMap = (_temp = _class = function (_Component) {
  (0, _inherits3.default)(BaseMap, _Component);

  /* Constructor */

  function BaseMap(props) {
    (0, _classCallCheck3.default)(this, BaseMap);

    // For controlled overlays, maintain a map of boolean visibility status,
    // indexed by 'name' string
    var _this = (0, _possibleConstructorReturn3.default)(this, (BaseMap.__proto__ || (0, _getPrototypeOf2.default)(BaseMap)).call(this, props));

    _initialiseProps.call(_this);

    var overlayVisibility = {};
    _react2.default.Children.toArray(_this.props.children).forEach(function (child) {
      if (child.props.name && child.props.visible) {
        overlayVisibility[child.props.name] = child.props.visible;
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

      oldProps = oldProps || {};
      newProps = newProps || {};

      // Don't auto-fit if popup us active
      if (oldProps.popupLocation || newProps.popupLocation) return;

      var map = this.refs.map;

      if (!map) return;

      var padding = [30, 30];

      // Fit map to to entire itinerary if active itinerary bounds changed
      var oldItinBounds = oldProps.itinerary && (0, _itinerary.getItineraryBounds)(oldProps.itinerary);
      var fromChanged = !(0, _lodash2.default)(oldProps.query && oldProps.query.from, newProps.query && newProps.query.from);
      var toChanged = !(0, _lodash2.default)(oldProps.query && oldProps.query.to, newProps.query && newProps.query.to);
      var newItinBounds = newProps.itinerary && (0, _itinerary.getItineraryBounds)(newProps.itinerary);
      if (!oldItinBounds && newItinBounds || oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds)) {
        map.leafletElement.fitBounds(newItinBounds, { padding: padding });

        // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
      } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
        map.leafletElement.fitBounds((0, _itinerary.getLegBounds)(newProps.itinerary.legs[newProps.activeLeg]), { padding: padding });

        // If no itinerary update but from/to locations are present, fit to those
      } else if (newProps.query.from && newProps.query.to && (fromChanged || toChanged)) {
        map.leafletElement.fitBounds([[newProps.query.from.lat, newProps.query.from.lon], [newProps.query.to.lat, newProps.query.to.lon]], { padding: padding });

        // If only from or to is set, pan to that
      } else if (newProps.query.from && fromChanged) {
        map.leafletElement.panTo([newProps.query.from.lat, newProps.query.from.lon]);
      } else if (newProps.query.to && toChanged) {
        map.leafletElement.panTo([newProps.query.to.lat, newProps.query.to.lon]);

        // Pan to to itinerary step if made active (clicked)
      } else if (newProps.itinerary && newProps.activeLeg !== null && newProps.activeStep !== null && newProps.activeStep !== oldProps.activeStep) {
        var leg = newProps.itinerary.legs[newProps.activeLeg];
        var step = leg.steps[newProps.activeStep];
        map.leafletElement.panTo([step.lat, step.lon]);
      }
    }
  }, {
    key: 'componentDidMount',


    /* React Lifecycle methods */

    value: function componentDidMount() {
      var _this2 = this;

      this._updateBounds(null, this.props);

      var lmap = this.refs.map.leafletElement;
      lmap.options.singleClickTimeout = 250;
      lmap.on('singleclick', function (e) {
        _this2._onLeftClick(e);
      });
    }
  }, {
    key: 'componentWillReceiveProps',
    value: function componentWillReceiveProps(nextProps) {
      this._updateBounds(this.props, nextProps);

      // Check if any overlays should be toggled due to mode change
      var overlaysConfig = this.props.config.map.overlays;

      if (overlaysConfig && this.props.query.mode) {
        // Determine any added/removed modes
        var oldModes = this.props.query.mode.split(',');
        var newModes = nextProps.query.mode.split(',');
        var removed = oldModes.filter(function (m) {
          return !newModes.includes(m);
        });
        var added = newModes.filter(function (m) {
          return !oldModes.includes(m);
        });

        var overlayVisibility = (0, _extends3.default)({}, this.state.overlayVisibility);

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)(overlaysConfig), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var oConfig = _step.value;

            if (!oConfig.modes || oConfig.modes.length !== 1) continue;
            // TODO: support multi-mode overlays
            var overlayMode = oConfig.modes[0];

            if ((overlayMode === 'CAR_RENT' || overlayMode === 'CAR_HAIL') && oConfig.companies) {
              // Special handling for company-based mode overlays (e.g. carshare, car-hail)
              var overlayCompany = oConfig.companies[0]; // TODO: handle multi-company overlays
              if (added.includes(overlayMode)) {
                // Company-based mode was just selected; enable overlay iff overlay's company is active
                if (nextProps.query.companies.includes(overlayCompany)) overlayVisibility[oConfig.name] = true;
              } else if (removed.includes(overlayMode)) {
                // Company-based mode was just deselected; disable overlay (regardless of company)
                overlayVisibility[oConfig.name] = false;
              } else if (newModes.includes(overlayMode) && this.props.query.companies !== nextProps.query.companies) {
                // Company-based mode remains selected but companies change
                overlayVisibility[oConfig.name] = nextProps.query.companies.includes(overlayCompany);
              }
            } else {
              // Default handling for other modes
              if (added.includes(overlayMode)) overlayVisibility[oConfig.name] = true;
              if (removed.includes(overlayMode)) overlayVisibility[oConfig.name] = false;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        this.setState({ overlayVisibility: overlayVisibility });
      }
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
      var _this3 = this;

      var _props = this.props,
          config = _props.config,
          children = _props.children,
          diagramLeg = _props.diagramLeg,
          elevationPoint = _props.elevationPoint,
          popupLocation = _props.popupLocation;
      var baseLayers = config.map.baseLayers;

      var showElevationProfile = Boolean(config.elevationProfile);
      var userControlledOverlays = [];
      var fixedOverlays = [];
      _react2.default.Children.toArray(children).forEach(function (child) {
        if (child.props.name) {
          // Add the visibility flag to this layer and push to the internal
          // array of user-controlled overlays
          var visible = _this3.state.overlayVisibility[child.props.name];
          var childWithVisibility = _react2.default.cloneElement(child, { visible: visible });
          userControlledOverlays.push(childWithVisibility);
        } else {
          fixedOverlays.push(child);
        }
      });

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

      // Compute the elevation point marker, if activeLeg and elevation profile is enabled.
      var elevationPointMarker = null;
      if (showElevationProfile && diagramLeg && elevationPoint) {
        var pos = (0, _itinerary.legLocationAtDistance)(diagramLeg, elevationPoint);
        if (pos) {
          elevationPointMarker = _react2.default.createElement(_reactLeaflet.CircleMarker, {
            center: pos,
            fillColor: '#084c8d',
            weight: 6,
            color: '#555',
            opacity: 0.4,
            radius: 5,
            fill: true,
            fillOpacity: 1 });
        }
      }

      return _react2.default.createElement(
        _reactLeaflet.Map,
        {
          ref: 'map',
          className: 'map',
          center: center,
          zoom: config.map.initZoom || 13,
          onOverlayAdd: this._onOverlayAdd,
          onOverlayRemove: this._onOverlayRemove
          /* Note: Map-click is handled via single-click plugin, set up in componentDidMount() */
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
                name: child.props.name,
                checked: child.props.visible
              },
              child
            );
          })
        ),
        fixedOverlays,
        popupLocation && _react2.default.createElement(
          _reactLeaflet.Popup,
          { ref: 'clickPopup',
            position: [popupLocation.lat, popupLocation.lon],
            onClose: this._popupClosed
          },
          _react2.default.createElement(
            'div',
            { style: { width: 240 } },
            _react2.default.createElement(
              'div',
              { style: { fontSize: 14, marginBottom: 6 } },
              popupLocation.name.split(',').length > 3 ? popupLocation.name.split(',').splice(0, 3).join(',') : popupLocation.name
            ),
            _react2.default.createElement(
              'div',
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
          )
        ),
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
  var _this4 = this;

  this._setLocationFromPopup = function (type) {
    var _props2 = _this4.props,
        setMapPopupLocation = _props2.setMapPopupLocation,
        setLocation = _props2.setLocation,
        location = _props2.popupLocation;

    setMapPopupLocation({ location: null });
    setLocation({ type: type, location: location, reverseGeocode: true });
    if (typeof _this4.props.onSetLocation === 'function') {
      _this4.props.onSetLocation({ type: type, location: location });
    }
  };

  this._onClickTo = function () {
    return _this4._setLocationFromPopup('to');
  };

  this._onClickFrom = function () {
    return _this4._setLocationFromPopup('from');
  };

  this._onLeftClick = function (e) {
    _this4.props.setMapPopupLocationAndGeocode({ location: (0, _map2.constructLocation)(e.latlng) });
    if (typeof _this4.props.onClick === 'function') _this4.props.onClick(e);
  };

  this._onOverlayAdd = function (evt) {
    var overlayVisibility = (0, _extends3.default)({}, _this4.state.overlayVisibility);
    overlayVisibility[evt.name] = true;
    _this4.setState({ overlayVisibility: overlayVisibility });
  };

  this._onOverlayRemove = function (evt) {
    var overlayVisibility = (0, _extends3.default)({}, _this4.state.overlayVisibility);
    overlayVisibility[evt.name] = false;
    _this4.setState({ overlayVisibility: overlayVisibility });
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
    if (!bounds.equals(_this4.props.mapState.bounds)) {
      _this4.props.updateMapState({ bounds: e.target.getBounds() });
    }
    // }
  };

  this._popupClosed = function () {
    _this4.props.setMapPopupLocation({ location: null });
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
    popupLocation: state.otp.ui.mapPopupLocation,
    query: state.otp.currentQuery
  };
};

var mapDispatchToProps = {
  setLocation: _map.setLocation,
  setMapPopupLocation: _map.setMapPopupLocation,
  setMapPopupLocationAndGeocode: _map.setMapPopupLocationAndGeocode
};

exports.default = (0, _reactRedux.connect)(mapStateToProps, mapDispatchToProps)(BaseMap);
module.exports = exports['default'];

//# sourceMappingURL=base-map.js