import objectPath from 'object-path'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'

import { Map, TileLayer, LayersControl, Popup } from 'react-leaflet'

import { setLocation } from '../../actions/map'
import Icon from '../narrative/icon'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'
import { getItineraryBounds } from '../../util/itinerary'

class BaseMap extends Component {
  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    setLocation: PropTypes.func, // TODO: rename from action name to avoid namespace conflict?
    toggleName: PropTypes.string
  }

  state = {}

  _setLocationFromPopup = (type) => {
    const {setLocation} = this.props
    const location = constructLocation(this.state.popupPosition)
    setLocation({type, location, reverseGeocode: true})
    this.setState({popupPosition: null})
  }

  _onClickTo = () => this._setLocationFromPopup('to')

  _onClickFrom = () => this._setLocationFromPopup('from')

  _onRightClick = (e) => {
    this.setState({popupPosition: e.latlng})
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

  componentWillReceiveProps(nextProps) {
    // TODO: maybe setting bounds ought to be handled in map props...

    // Fit map to to entire itinerary if active itinerary bounds changed
    const oldItinBounds = this.props.itinerary && getItineraryBounds(this.props.itinerary)
    const newItinBounds = nextProps.itinerary && getItineraryBounds(nextProps.itinerary)
    if (
      (!oldItinBounds && newItinBounds) ||
      (oldItinBounds && newItinBounds && !oldItinBounds.equals(newItinBounds))
    ) {
      this.refs.map &&
        this.refs.map.leafletElement.fitBounds(newItinBounds, {
          padding: [3, 3]
        })
    }
    // Pan to to itinerary step if made active (clicked)
    if (
      nextProps.itinerary &&
      nextProps.activeLeg !== null &&
      nextProps.activeStep !== null &&
      nextProps.activeStep !== this.props.activeStep
    ) {
      const leg = nextProps.itinerary.legs[nextProps.activeLeg]
      const step = leg.steps[nextProps.activeStep]
      this.refs.map && this.refs.map.leafletElement.panTo([step.lat, step.lon])
    }
    // Pan to to itinerary leg if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg !== this.props.activeLeg) {
      this.refs.map &&
        this.refs.map.leafletElement.eachLayer(l => {
          if (
            objectPath.has(l, 'feature.geometry.index') &&
            l.feature.geometry.index === nextProps.activeLeg
          ) {
            this.refs.map.leafletElement.fitBounds(l.getBounds())
          }
        })
    }
  }

  resized () {
    this.refs.map.leafletElement.invalidateSize()
    if (this.props.itinerary) {
      this.refs.map &&
        this.refs.map.leafletElement.fitBounds(getItineraryBounds(this.props.itinerary), {
          padding: [3, 3]
        })
    }
  }

  render () {
    const { config, children } = this.props
    const { baseLayers } = this.props.config.map

    const position = [config.map.initLat, config.map.initLon]
    const controlledChildren = []
    const uncontrolledChildren = []
    React.Children.toArray(children).forEach(child => {
      if (child.props.controlName) controlledChildren.push(child)
      else uncontrolledChildren.push(child)
    })

    const {popupPosition} = this.state
    // const position = [+mapState.lat, +mapState.lon]
    // const zoom = +mapState.zoom
    const zoom = config.map.initZoom || 13
    const bounds = null // mapState.bounds
    // TODO: currently mapProps is unused, but may later be used for controlling
    // map location state
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
    }
    return (
      <Map
        ref="map"
        className="map"
        center={position}
        zoom={config.map.initZoom || 13}
        onContextMenu={this._onRightClick}
      >

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
                  detectRetina />
              </LayersControl.BaseLayer>
            ))
          }

          { /* controlled child overlays */
          controlledChildren.map(child => {
            return (
              <LayersControl.Overlay name={child.props.controlName}>
                {child}
              </LayersControl.Overlay>
            )
          })}
        </LayersControl>

        {uncontrolledChildren}
        {popupPosition
          ? <Popup ref='clickPopup'
            key={popupPosition.toString()} // hack to ensure the popup opens only on right click
            position={popupPosition} // FIXME: onOpen and onClose don't seem to work?
            // onOpen={() => this.setState({popupPosition: null})}
            // onClose={() => this.setState({popupPosition: null})}
          >
            <span>
              Plan a trip:{' '}
              <Icon type='dot-circle-o' />{' '}
              <a role='button'
                onClick={this._onClickFrom}>
                From here
              </a>{' '}|{' '}
              <Icon type='map-marker' />{' '}
              <a role='button'
                onClick={this._onClickTo}>
                To here
              </a>
            </span>
          </Popup>
          : null
        }
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
    mapState: state.otp.mapState,
    isFromSet:
      state.otp.currentQuery.from &&
      state.otp.currentQuery.from.lat !== null &&
      state.otp.currentQuery.from.lon !== null,
    isToSet:
      state.otp.currentQuery.to &&
      state.otp.currentQuery.to.lat !== null &&
      state.otp.currentQuery.to.lon !== null,
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = {
  setLocation
}

// allow access to the wrapped BaseMap (for access to resized())
export default connect(mapStateToProps, mapDispatchToProps, null, {
  withRef: true
})(BaseMap)
