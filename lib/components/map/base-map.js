import { latLngBounds } from 'leaflet'
import polyline from '@mapbox/polyline'
import objectPath from 'object-path'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map, TileLayer, LayersControl, Marker, Popup } from 'react-leaflet'

import { setLocation } from '../../actions/map'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'

class BaseMap extends Component {
  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    setLocation: PropTypes.func, // TODO: rename from action name to avoid namespace conflict?
    toggleName: PropTypes.string
  }

  _onClick = e => {
    const location = constructLocation(e.latlng)
    const reverseGeocode = true
    if (!this.props.isFromSet)
      this.props.setLocation({ type: 'from', location, reverseGeocode })
    else if (!this.props.isToSet)
      this.props.setLocation({ type: 'to', location, reverseGeocode })
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
    // Pan to to entire itinerary if made active (clicked)
    /*if (nextProps.itinerary && nextProps.activeLeg === null) {
      let coords = []
      nextProps.itinerary.legs.forEach(leg => {
        const legCoords = polyline
          .toGeoJSON(leg.legGeometry.points)
          .coordinates.map(c => [c[1], c[0]])
        coords = [...coords, ...legCoords]
      })
      this.refs.map &&
        this.refs.map.leafletElement.fitBounds(latLngBounds(coords), {
          padding: [3, 3]
        })
    }*/
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

    return (
      <Map
        ref="map"
        className="map"
        center={position}
        zoom={config.map.initZoom || 13}
        onClick={this._onClick}
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
