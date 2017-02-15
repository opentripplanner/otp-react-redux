import {latLngBounds} from 'leaflet'
import polyline from '@mapbox/polyline'
import objectPath from 'object-path'
import React, { Component, PropTypes } from 'react'
import { connect } from 'react-redux'
import { Map } from 'react-leaflet'

import { setLocation } from '../../actions/map'
import { constructLocation } from '../../util/map'
import { getActiveItinerary, getActiveSearch } from '../../util/state'

class BaseMap extends Component {

  static propTypes = {
    config: PropTypes.object,
    mapClick: PropTypes.func,
    setLocation: PropTypes.func // TODO: rename from action name to avoid namespace conflict?
  }
  _onClick = (e) => {
    const location = constructLocation(e.latlng)
    if (!this.props.isFromSet) this.props.setLocation('from', location)
    else if (!this.props.isToSet) this.props.setLocation('to', location)
  }
  componentWillReceiveProps (nextProps) {
    // TODO: maybe setting bounds ought to be handled in map props...
    // Pan to to entire itinerary if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg === null) {
      let coords = []
      nextProps.itinerary.legs.forEach(leg => {
        const legCoords = polyline.toGeoJSON(leg.legGeometry.points).coordinates.map(c => [c[1], c[0]])
        coords = [
          ...coords,
          ...legCoords
        ]
      })
      this.refs.map && this.refs.map.leafletElement.fitBounds(latLngBounds(coords), {padding: [3, 3]})
    }
    // Pan to to itinerary step if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg !== null && nextProps.activeStep !== null && nextProps.activeStep !== this.props.activeStep) {
      const leg = nextProps.itinerary.legs[nextProps.activeLeg]
      const step = leg.steps[nextProps.activeStep]
      this.refs.map && this.refs.map.leafletElement.panTo([step.lat, step.lon])
    }
    // Pan to to itinerary leg if made active (clicked)
    if (nextProps.itinerary && nextProps.activeLeg !== this.props.activeLeg) {
      this.refs.map && this.refs.map.leafletElement.eachLayer(l => {
        if (objectPath.has(l, 'feature.geometry.index') && l.feature.geometry.index === nextProps.activeLeg) {
          this.refs.map.leafletElement.fitBounds(l.getBounds())
        }
      })
    }
  }
  render () {
    const {
      config,
      children
    } = this.props
    const position = [config.map.initLat, config.map.initLon]

    return (
      <Map
        ref='map'
        className='map'
        center={position}
        zoom={config.map.initZoom || 13}
        onClick={this._onClick}
      >
        {children}
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
    isFromSet: state.otp.currentQuery.from && state.otp.currentQuery.from.lat && state.otp.currentQuery.from.lon,
    isToSet: state.otp.currentQuery.to && state.otp.currentQuery.to.lat && state.otp.currentQuery.to.lon,
    itinerary: getActiveItinerary(state.otp)
  }
}

const mapDispatchToProps = (dispatch, ownProps) => {
  return {
    setLocation: (type, location) => { dispatch(setLocation({ type, location })) }
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BaseMap)
