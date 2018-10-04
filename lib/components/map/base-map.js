import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Map, TileLayer, LayersControl, Popup, Marker } from 'react-leaflet'

import { setLocation } from '../../actions/map'
import LocationIcon from '../icons/location-icon'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { getItineraryBounds, getLegBounds, legLocationAtDistance } from '../../util/itinerary'

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
    // indexed by controlName string
    const overlayVisibility = {}
    React.Children.toArray(this.props.children).forEach(child => {
      if (child.props.controlName && child.props.visible) {
        overlayVisibility[child.props.controlName] = child.props.visible
      }
    })

    this.state = { overlayVisibility }
  }

  /* Internal Methods */

  _setLocationFromPopup = (type) => {
    const {setLocation} = this.props
    const location = constructLocation(this.state.popupPosition)
    setLocation({type, location, reverseGeocode: true})
    this.setState({popupPosition: null})
    if (typeof this.props.onSetLocation === 'function') {
      this.props.onSetLocation({type, location})
    }
  }

  _onClickTo = () => this._setLocationFromPopup('to')

  _onClickFrom = () => this._setLocationFromPopup('from')

  _onLeftClick = (e) => {
    if (typeof this.props.onClick === 'function') this.props.onClick(e)
  }

  _onRightClick = (e) => {
    this.setState({popupPosition: e.latlng})
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

    const { map } = this.refs
    if (!map) return

    const padding = [30, 30]

    // Fit map to to entire itinerary if active itinerary bounds changed
    const oldItinBounds = oldProps && oldProps.itinerary && getItineraryBounds(oldProps.itinerary)
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
    } else if (newProps.query.from && newProps.query.to) {
      map.leafletElement.fitBounds([
        [newProps.query.from.lat, newProps.query.from.lon],
        [newProps.query.to.lat, newProps.query.to.lon]
      ], { padding })

    // If only from or to is set, pan to that
    } else if (newProps.query.from) {
      map.leafletElement.panTo([newProps.query.from.lat, newProps.query.from.lon])
    } else if (newProps.query.to) {
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

  /* React Lifecycle methods */

  componentDidMount () {
    this._updateBounds(null, this.props)
  }

  componentWillReceiveProps (nextProps) {
    this._updateBounds(this.props, nextProps)
  }

  // remove custom overlays on unmount
  componentWillUnmount () {
    const lmap = this.refs.map.leafletElement
    lmap.eachLayer((layer) => {
      lmap.removeLayer(layer)
    })
  }

  render () {
    const { config, children, diagramLeg, elevationPoint } = this.props
    const { baseLayers } = this.props.config.map

    const userControlledOverlays = []
    const fixedOverlays = []
    React.Children.toArray(children).forEach(child => {
      if (child.props.controlName) {
        // Add the visibility flag to this layer and push to the interal
        // array of user-controlled overlays
        const visible = this.state.overlayVisibility[child.props.controlName]
        const childWithVisibility = React.cloneElement(child, { visible })
        userControlledOverlays.push(childWithVisibility)
      } else {
        fixedOverlays.push(child)
      }
    })

    const {popupPosition} = this.state

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

    // Compute the elevation point marker, if activeLeg
    let elevationPointMarker = null
    if (diagramLeg && elevationPoint) {
      const pos = legLocationAtDistance(diagramLeg, elevationPoint)
      if (pos) {
        elevationPointMarker = <Marker position={pos} />
      }
    }

    return (
      <Map
        ref='map'
        className='map'
        center={center}
        zoom={config.map.initZoom || 13}
        onClick={this._onLeftClick}
        onContextMenu={this._onRightClick}
        onOverlayAdd={this._onOverlayAdd}
        onOverlayRemove={this._onOverlayRemove}
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
                name={child.props.controlName}
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
        {popupPosition
          ? <Popup ref='clickPopup'
            key={popupPosition.toString()} // hack to ensure the popup opens only on right click
            position={popupPosition} // FIXME: onOpen and onClose don't seem to work?
            // onOpen={() => this.setState({popupPosition: null})}
            // onClose={() => this.setState({popupPosition: null})}
          >
            <span>
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
            </span>
          </Popup>
          : null
        }

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
    query: state.otp.currentQuery
  }
}

const mapDispatchToProps = {
  setLocation
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
