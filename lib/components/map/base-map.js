import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash.isequal'

import { Map, TileLayer, LayersControl, Popup, CircleMarker } from 'react-leaflet'

import { setLocation, setMapPopupLocation, setMapPopupLocationAndGeocode } from '../../actions/map'
import LocationIcon from '../icons/location-icon'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { getItineraryBounds, getLegBounds, legLocationAtDistance } from '../../util/itinerary'

import L from 'leaflet'

L.Evented.addInitHook(function () {
  this._singleClickTimeout = null
  this.on('click', this._scheduleSingleClick, this)
  this.on('dblclick dragstart zoomstart', this._cancelSingleClick, this)
})

L.Evented.include({
  _cancelSingleClick: function () {
    // This timeout is key to workaround an issue where double-click events
    // are fired in this order on some touch browsers: ['click', 'dblclick', 'click']
    // instead of ['click', 'click', 'dblclick']
    setTimeout(this._clearSingleClickTimeout.bind(this), 0)
  },

  _scheduleSingleClick: function (e) {
    this._clearSingleClickTimeout()

    this._singleClickTimeout = setTimeout(
      this._fireSingleClick.bind(this, e),
      (this.options.singleClickTimeout || 500)
    )
  },

  _fireSingleClick: function (e) {
    if (!e.originalEvent._stopped) {
      this.fire('singleclick', L.Util.extend(e, { type: 'singleclick' }))
    }
  },

  _clearSingleClickTimeout: function () {
    if (this._singleClickTimeout !== null) {
      clearTimeout(this._singleClickTimeout)
      this._singleClickTimeout = null
    }
  }
})

class BaseMap extends Component {
  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    setLocation: PropTypes.func, // TODO: rename from action name to avoid namespace conflict?
    toggleName: PropTypes.element
  }

  /* Constructor */

  constructor (props) {
    super(props)

    // For controlled overlays, maintain a map of boolean visibility status,
    // indexed by 'name' string
    const overlayVisibility = {}
    React.Children.toArray(this.props.children).forEach(child => {
      if (child.props.name && child.props.visible) {
        overlayVisibility[child.props.name] = child.props.visible
      }
    })

    this.state = { overlayVisibility }
  }

  /* Internal Methods */

  _setLocationFromPopup = (type) => {
    const { setMapPopupLocation, setLocation, popupLocation: location } = this.props
    setMapPopupLocation({ location: null })
    setLocation({ type, location, reverseGeocode: true })
    if (typeof this.props.onSetLocation === 'function') {
      this.props.onSetLocation({type, location})
    }
  }

  _onClickTo = () => this._setLocationFromPopup('to')

  _onClickFrom = () => this._setLocationFromPopup('from')

  _onLeftClick = (e) => {
    this.props.setMapPopupLocationAndGeocode({ location: constructLocation(e.latlng) })
    if (typeof this.props.onClick === 'function') this.props.onClick(e)
  }

  _onOverlayAdd = (evt) => {
    const overlayVisibility = {...this.state.overlayVisibility}
    overlayVisibility[evt.name] = true
    this.setState({ overlayVisibility })
  }

  _onOverlayRemove = (evt) => {
    const overlayVisibility = {...this.state.overlayVisibility}
    overlayVisibility[evt.name] = false
    this.setState({ overlayVisibility })
  }

  // TODO: make map controlled component
  _mapBoundsChanged = e => {
    // if (this.state.zoomToTarget) {
    //   setTimeout(() => { this.setState({zoomToTarget: false}) }, 200)
    //   return false
    // } else {
    // const zoom = e.target.getZoom()
    const bounds = e.target.getBounds()
    // if (this.props.mapState.zoom !== zoom) {
    //   this.props.updateMapState({zoom})
    // }
    if (!bounds.equals(this.props.mapState.bounds)) {
      this.props.updateMapState({ bounds: e.target.getBounds() })
    }
    // }
  }

  _updateBounds (oldProps, newProps) {
    // TODO: maybe setting bounds ought to be handled in map props...

    oldProps = oldProps || {}
    newProps = newProps || {}

    // Don't auto-fit if popup us active
    if (oldProps.popupLocation || newProps.popupLocation) return

    const { map } = this.refs
    if (!map) return

    const padding = [30, 30]

    // Fit map to to entire itinerary if active itinerary bounds changed
    const oldItinBounds = oldProps.itinerary && getItineraryBounds(oldProps.itinerary)
    const fromChanged = !isEqual(oldProps.query && oldProps.query.from, newProps.query && newProps.query.from)
    const toChanged = !isEqual(oldProps.query && oldProps.query.to, newProps.query && newProps.query.to)
    const newItinBounds = newProps.itinerary && getItineraryBounds(newProps.itinerary)
    if (
      (!oldItinBounds && newItinBounds) ||
      (oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds))
    ) {
      map.leafletElement.fitBounds(newItinBounds, { padding })

    // Pan to to itinerary leg if made active (clicked); newly active leg must be non-null
    } else if (newProps.itinerary && newProps.activeLeg !== oldProps.activeLeg && newProps.activeLeg !== null) {
      map.leafletElement.fitBounds(
        getLegBounds(newProps.itinerary.legs[newProps.activeLeg]),
        { padding }
      )

    // If no itinerary update but from/to locations are present, fit to those
    } else if (newProps.query.from && newProps.query.to && (fromChanged || toChanged)) {
      map.leafletElement.fitBounds([
        [newProps.query.from.lat, newProps.query.from.lon],
        [newProps.query.to.lat, newProps.query.to.lon]
      ], { padding })

    // If only from or to is set, pan to that
    } else if (newProps.query.from && fromChanged) {
      map.leafletElement.panTo([newProps.query.from.lat, newProps.query.from.lon])
    } else if (newProps.query.to && toChanged) {
      map.leafletElement.panTo([newProps.query.to.lat, newProps.query.to.lon])

    // Pan to to itinerary step if made active (clicked)
    } else if (
      newProps.itinerary &&
      newProps.activeLeg !== null &&
      newProps.activeStep !== null &&
      newProps.activeStep !== oldProps.activeStep
    ) {
      const leg = newProps.itinerary.legs[newProps.activeLeg]
      const step = leg.steps[newProps.activeStep]
      map.leafletElement.panTo([step.lat, step.lon])
    }
  }

  _popupClosed = () => {
    this.props.setMapPopupLocation({ location: null })
  }

  /* React Lifecycle methods */

  componentDidMount () {
    this._updateBounds(null, this.props)

    const lmap = this.refs.map.leafletElement
    lmap.options.singleClickTimeout = 250
    lmap.on('singleclick', (e) => { this._onLeftClick(e) })
  }

  componentWillReceiveProps (nextProps) {
    this._updateBounds(this.props, nextProps)

    // Check if any overlays should be toggled due to mode change
    const overlaysConfig = this.props.config.map.overlays

    if (overlaysConfig && this.props.query.mode) {
      // Determine any added/removed modes
      const oldModes = this.props.query.mode.split(',')
      const newModes = nextProps.query.mode.split(',')
      const removed = oldModes.filter(m => !newModes.includes(m))
      const added = newModes.filter(m => !oldModes.includes(m))

      const overlayVisibility = {...this.state.overlayVisibility}

      for (const oConfig of overlaysConfig) {
        if (!oConfig.modes || oConfig.modes.length !== 1) continue
        // TODO: support multi-mode overlays
        const overlayMode = oConfig.modes[0]

        if ((overlayMode === 'CAR_RENT' || overlayMode === 'CAR_HAIL') && oConfig.companies) {
          // Special handling for company-based mode overlays (e.g. carshare, car-hail)
          const overlayCompany = oConfig.companies[0] // TODO: handle multi-company overlays
          if (added.includes(overlayMode)) {
            // Company-based mode was just selected; enable overlay iff overlay's company is active
            if (nextProps.query.companies.includes(overlayCompany)) overlayVisibility[oConfig.name] = true
          } else if (removed.includes(overlayMode)) {
            // Company-based mode was just deselected; disable overlay (regardless of company)
            overlayVisibility[oConfig.name] = false
          } else if (newModes.includes(overlayMode) && this.props.query.companies !== nextProps.query.companies) {
            // Company-based mode remains selected but companies change
            overlayVisibility[oConfig.name] = nextProps.query.companies.includes(overlayCompany)
          }
        } else { // Default handling for other modes
          if (added.includes(overlayMode)) overlayVisibility[oConfig.name] = true
          if (removed.includes(overlayMode)) overlayVisibility[oConfig.name] = false
        }
      }

      this.setState({ overlayVisibility })
    }
  }

  // remove custom overlays on unmount
  componentWillUnmount () {
    const lmap = this.refs.map.leafletElement
    lmap.eachLayer((layer) => {
      lmap.removeLayer(layer)
    })
  }

  render () {
    const { config, children, diagramLeg, elevationPoint, popupLocation } = this.props
    const { baseLayers } = config.map
    const showElevationProfile = Boolean(config.elevationProfile)
    const userControlledOverlays = []
    const fixedOverlays = []
    React.Children.toArray(children).forEach(child => {
      if (child.props.name) {
        // Add the visibility flag to this layer and push to the internal
        // array of user-controlled overlays
        const visible = this.state.overlayVisibility[child.props.name]
        const childWithVisibility = React.cloneElement(child, { visible })
        userControlledOverlays.push(childWithVisibility)
      } else {
        fixedOverlays.push(child)
      }
    })

    const center = config.map && config.map.initLat && config.map.initLon
      ? [config.map.initLat, config.map.initLon]
      : null

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
    let elevationPointMarker = null
    if (showElevationProfile && diagramLeg && elevationPoint) {
      const pos = legLocationAtDistance(diagramLeg, elevationPoint)
      if (pos) {
        elevationPointMarker = (
          <CircleMarker
            center={pos}
            fillColor='#084c8d'
            weight={6}
            color='#555'
            opacity={0.4}
            radius={5}
            fill
            fillOpacity={1} />
        )
      }
    }

    return (
      <Map
        ref='map'
        className='map'
        center={center}
        zoom={config.map.initZoom || 13}
        onOverlayAdd={this._onOverlayAdd}
        onOverlayRemove={this._onOverlayRemove}
        /* Note: Map-click is handled via single-click plugin, set up in componentDidMount() */
      >
        {/* Create the layers control, including base map layers and any
          * user-controlled overlays. */}
        <LayersControl position='topright'>
          { /* base layers */
            baseLayers && baseLayers.map((l, i) => (
              <LayersControl.BaseLayer
                name={l.name}
                checked={i === 0}
                key={i}>
                <TileLayer
                  url={l.url}
                  attribution={l.attribution}
                  maxZoom={l.maxZoom}
                  detectRetina />
              </LayersControl.BaseLayer>
            ))
          }

          { /* user-controlled overlay layers */
            userControlledOverlays.map((child, i) => {
              return (
                <LayersControl.Overlay key={i}
                  name={child.props.name}
                  checked={child.props.visible}
                >
                  {child}
                </LayersControl.Overlay>
              )
            })}
        </LayersControl>

        {/* Add the fixed, i.e. non-user-controllable overlays */}
        {fixedOverlays}

        {/* Add the location selection popup, if visible */}
        {popupLocation && (
          <Popup ref='clickPopup'
            position={[popupLocation.lat, popupLocation.lon]}
            onClose={this._popupClosed}
          >
            <div style={{ width: 240 }}>
              <div style={{ fontSize: 14, marginBottom: 6 }}>
                {popupLocation.name.split(',').length > 3
                  ? popupLocation.name.split(',').splice(0, 3).join(',')
                  : popupLocation.name
                }
              </div>
              <div>
                Plan a trip:
                <span style={{ margin: '0px 5px' }}><LocationIcon type='from' /></span>
                <button className='link-button'
                  onClick={this._onClickFrom}>
                  From here
                </button>{' '}|{' '}
                <span style={{ margin: '0px 5px' }}><LocationIcon type='to' /></span>
                <button className='link-button'
                  onClick={this._onClickTo}>
                  To here
                </button>
              </div>
            </div>
          </Popup>
        )}

        {/* Add the elevation point marker */}
        {elevationPointMarker}
      </Map>
    )
  }
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  return {
    activeLeg: activeSearch && activeSearch.activeLeg,
    activeStep: activeSearch && activeSearch.activeStep,
    config: state.otp.config,
    diagramLeg: state.otp.ui.diagramLeg,
    elevationPoint: state.otp.ui.elevationPoint,
    mapState: state.otp.mapState,
    isFromSet:
      state.otp.currentQuery.from &&
      state.otp.currentQuery.from.lat !== null &&
      state.otp.currentQuery.from.lon !== null,
    isToSet:
      state.otp.currentQuery.to &&
      state.otp.currentQuery.to.lat !== null &&
      state.otp.currentQuery.to.lon !== null,
    itinerary: getActiveItinerary(state.otp),
    popupLocation: state.otp.ui.mapPopupLocation,
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  setLocation,
  setMapPopupLocation,
  setMapPopupLocationAndGeocode
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
