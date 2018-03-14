import { PropTypes } from 'react'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import { connect } from 'react-redux'
import * as d3 from 'd3'
import Transitive from 'transitive-js'
import isEqual from 'lodash.isequal'

import { getActiveSearch, getActiveItineraries } from '../../util/state'
import { itineraryToTransitive } from '../../util/map'

const zoomFactors = [{
  minScale: 0,
  gridCellSize: 0,
  internalVertexFactor: 0,
  angleConstraint: 5,
  mergeVertexThreshold: 0,
  useGeographicRendering: true
}]

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

    // the current map pixel dimensions
    this._mapWidth = map.getSize().x
    this._mapHeight = map.getSize().y

    // zoom handler
    map.on('zoom', () => {
      // reset the initial pixel bounds for this zoom level
      this._initialPixelBounds = map.getPixelBounds()

      // calculate the new zoom-based offsets based on the previous zoom level's final state
      this._zdx = this._zdx + this._pdx
      this._zdy = this._zdy + this._pdy
    })

    // move-end handler -- called at end of pan/zoom/resize action
    map.on('moveend', () => {
      // calculate the pan-based offsets
      const pxBounds = map.getPixelBounds()
      this._pdx = pxBounds.min.x - this._initialPixelBounds.min.x
      this._pdy = pxBounds.min.y - this._initialPixelBounds.min.y

      // offset the main SVG group by the combined zoom- and pan-based offsets
      this._svgMain.attr('transform', 'translate(' + (this._zdx + this._pdx) + ',' + (this._zdy + this._pdy) + ')')

      // check if the map pixel dimensions changed (i.e. window was resized)
      const width = map.getSize().x
      const height = map.getSize().y
      if (width !== this._mapWidth || height !== this._mapHeight) {
        this._transitive.resized()
        this._mapWidth = width
        this._mapHeight = height
      }

      // refresh the transitive map
      this._redraw()
    })

    this._initTransitive()
  }

  componentWillUnmount () { }

  _initTransitive () {
    const map = this.context.map
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
      zoomFactors
    })

    // the initial map draw
    this._redraw()
  }

  componentWillReceiveProps (nextProps) {
    // Check if we received new transitive data
    if (!isEqual(nextProps.transitiveData, this.props.transitiveData)) {
      this._transitive.updateData(nextProps.transitiveData)
      this._transitive.render()
      this._redraw()
    }

    if ( // this block only applies for profile trips where active option changed
      nextProps.routingType === 'PROFILE' &&
      nextProps.activeItinerary !== this.props.activeItinerary
    ) {
      if (nextProps.activeItinerary == null) { // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.refresh()
      } else if (nextProps.transitiveData) {
        this._transitive.focusJourney(nextProps.transitiveData.journeys[nextProps.activeItinerary].journey_id)
        this._transitive.refresh()
      }
    }
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

// connect to the redux store

const mapStateToProps = (state, ownProps) => {
  const activeSearch = getActiveSearch(state.otp)
  let transitiveData = null
  if (activeSearch && activeSearch.query.routingType === 'ITINERARY' && activeSearch.response && activeSearch.response.plan) {
    const itins = getActiveItineraries(state.otp)
    // TODO: prevent itineraryToTransitive() from being called more than needed
    transitiveData = itineraryToTransitive(itins[activeSearch.activeItinerary])
  } else if (activeSearch && activeSearch.response && activeSearch.response.otp) {
    transitiveData = activeSearch.response.otp
  }

  return {
    transitiveData,
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TransitiveOverlay)
