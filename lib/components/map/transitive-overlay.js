import { PropTypes } from 'react'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import { connect } from 'react-redux'

import * as d3 from 'd3'

import { getActiveSearch } from '../../util/state'
import { isTransit } from '../../util/itinerary'

const zoomFactors = [{
  minScale: 0,
  gridCellSize: 0,
  internalVertexFactor: 0,
  angleConstraint: 5,
  mergeVertexThreshold: 0
}]

import Transitive from 'transitive-js'

class TransitiveOverlay extends MapLayer {
  static propTypes = {
    transitiveData: PropTypes.object
  }

  componentDidMount () {
    const map = this.context.map

    // create a new Leaflet SVG layer and add it to the map
    L.svg().addTo(map)

    // retrieve and store the main 'g' element for the layer we just created
    this._svgMain = d3.select('.leaflet-container').select('svg').select('g')

    // store the current pixel bounds for use when computing pan-based offsets
    this._initialPixelBounds = map.getPixelBounds()

    // the current pan-based offsets
    this._pdx = 0
    this._pdy = 0

    // the current zoom-based offsets
    this._zdx = 0
    this._zdy = 0

    // zoom handler
    map.on('zoom', () => {
      // reset the initial pixel bounds for this zoom level
      this._initialPixelBounds = map.getPixelBounds()

      // calculate the new zoom-based offsets based on the previous zoom level's final state
      this._zdx = this._zdx + this._pdx
      this._zdy = this._zdy + this._pdy
    })

    // move-end handler -- called at end of pan or zoom action
    map.on('moveend', () => {
      // calculate the pan-based offsets
      const pxBounds = map.getPixelBounds()
      this._pdx = pxBounds.min.x - this._initialPixelBounds.min.x
      this._pdy = pxBounds.min.y - this._initialPixelBounds.min.y

      // offset the main SVG group by the combined zoom- and pan-based offsets
      this._svgMain.attr('transform', 'translate(' + (this._zdx + this._pdx) + ',' + (this._zdy + this._pdy) + ')')

      // refresh the transitive map
      this._redraw()
    })

    const leafletContainer = document.getElementsByClassName('leaflet-container')[0]

    // set up the transitive instance
    const mapBounds = map.getBounds()
    this._transitive = new Transitive({
      data: this.props.transitiveData,
      svgContainer: leafletContainer,
      svg: this._svgMain,
      initialBounds: [[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]],
      zoomEnabled: false,
      autoResize: false,
      styles: require('./transitive-styles'),
      drawGrid: false,
      gridCellSize: 300,
      zoomFactors
    })

    // the initial map draw
    this._redraw()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.transitiveData !== this.props.transitiveData) {
      this._transitive.updateData(nextProps.transitiveData)
      this._transitive.render()
      this._redraw()
    }

    if (nextProps.activeItinerary !== this.props.activeItinerary) {
      if (nextProps.activeItinerary == null) { // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.refresh()
      } else if (nextProps.transitiveData) {
        this._transitive.focusJourney(nextProps.transitiveData.journeys[nextProps.activeItinerary].journey_id)
        this._transitive.refresh()
      }
    }
  }

  _resize () {
    const map = this.context.map
    this.svg.attr('width', map.getSize().x).attr('height', map.getSize().y)
  }

  _redraw () {
    const mapBounds = this.context.map.getBounds()
    this._transitive.setDisplayBounds([[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]])
    this._transitive.refresh()
  }

  createLeafletElement (props) {
  }

  updateLeafletElement (fromProps, toProps) {
  }
}

function itineraryToTransitive (itin) {
  // console.log('itineraryToTransitive', itin);
  const tdata = {
    journeys: [],
    streetEdges: [],
    places: [],
    patterns: [],
    routes: [],
    stops: []
  }
  const routes = {}
  const stops = {}
  let streetEdgeId = 0
  let patternId = 0

  const journey = {
    journey_id: 'itin',
    journey_name: 'Iterarary-derived Journey',
    segments: []
  }
  itin.legs.forEach(leg => {
    if (leg.mode === 'WALK' || leg.mode === 'BICYCLE') {
      const fromPlaceId = `itin_street_${streetEdgeId}_from`
      const toPlaceId = `itin_street_${streetEdgeId}_to`
      journey.segments.push({
        type: leg.mode,
        streetEdges: [streetEdgeId],
        from: { type: 'PLACE', place_id: fromPlaceId },
        to: { type: 'PLACE', place_id: toPlaceId }
      })
      tdata.streetEdges.push({
        edge_id: streetEdgeId,
        geometry: leg.legGeometry
      })
      tdata.places.push({
        place_id: fromPlaceId,
        place_lat: leg.from.lat,
        place_lon: leg.from.lon
      })
      tdata.places.push({
        place_id: toPlaceId,
        place_lat: leg.to.lat,
        place_lon: leg.to.lon
      })
      streetEdgeId++
    }
    if (isTransit(leg.mode)) {
      // create leg-specific pattern
      const ptnId = 'ptn_' + patternId
      let pattern = {
        pattern_id: ptnId,
        pattern_name: 'Pattern ' + patternId,
        route_id: leg.routeId,
        stops: []
      }

      // add from stop to stops dictionary and pattern object
      stops[leg.from.stopId] = {
        stop_id: leg.from.stopId,
        stop_name: leg.from.name,
        stop_lat: leg.from.lat,
        stop_lon: leg.from.lon
      }
      pattern.stops.push({ stop_id: leg.from.stopId })

      // add intermediate stops to stops dictionary and pattern object
      leg.intermediateStops.forEach(stop => {
        stops[stop.stopId] = {
          stop_id: stop.stopId,
          stop_name: stop.name,
          stop_lat: stop.lat,
          stop_lon: stop.lon
        }
        pattern.stops.push({ stop_id: stop.stopId })
      })

      // add to stop to stops dictionary and pattern object
      stops[leg.to.stopId] = {
        stop_id: leg.to.stopId,
        stop_name: leg.to.name,
        stop_lat: leg.to.lat,
        stop_lon: leg.to.lon
      }
      pattern.stops.push({ stop_id: leg.to.stopId })

      // add route to the route dictionary
      routes[leg.routeId] = {
        agency_id: leg.agencyId,
        route_id: leg.routeId,
        route_short_name: leg.routeShortName || '',
        route_long_name: leg.routeLongName || '',
        route_type: leg.routeType
      }

      // add the pattern to the tdata patterns array
      tdata.patterns.push(pattern)

      // add the pattern refrerence to the journey object
      journey.segments.push({
        type: 'TRANSIT',
        patterns: [{
          pattern_id: ptnId,
          from_stop_index: 0,
          to_stop_index: (leg.intermediateStops.length + 2) - 1
        }]
      })

      patternId++
    }
  })

  // add the routes and stops to the tdata arrays
  for (let k in routes) tdata.routes.push(routes[k])
  for (let k in stops) tdata.stops.push(stops[k])

  // add the journey to the tdata journeys array
  tdata.journeys.push(journey)

  // console.log('derived tdata', tdata);
  return tdata
}

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  let transitiveData = null
  if (activeSearch && activeSearch.query.routingType === 'ITINERARY' && activeSearch.response && activeSearch.response.plan) {
    transitiveData = itineraryToTransitive(activeSearch.response.plan.itineraries[activeSearch.activeItinerary])
  } else if (activeSearch && activeSearch.response && activeSearch.response.otp) {
    transitiveData = activeSearch.response.otp
  }

  return {
    transitiveData,
    activeItinerary: activeSearch && activeSearch.activeItinerary
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TransitiveOverlay)
