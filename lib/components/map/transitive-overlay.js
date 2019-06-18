import { PropTypes } from 'react'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import { connect } from 'react-redux'
import Transitive from 'transitive-js'
import isEqual from 'lodash.isequal'

import { getActiveSearch, getActiveItineraries } from '../../util/state'
import { itineraryToTransitive } from '../../util/map'

require('./leaflet-canvas-layer')

// TODO: move to util?
function checkHiPPI (canvas) {
  if (window.devicePixelRatio > 1) {
    const PIXEL_RATIO = 2
    canvas.style.width = canvas.width + 'px'
    canvas.style.height = canvas.height + 'px'

    canvas.width *= PIXEL_RATIO
    canvas.height *= PIXEL_RATIO

    var context = canvas.getContext('2d')
    context.scale(PIXEL_RATIO, PIXEL_RATIO)
  }
}

const zoomFactors = [{
  minScale: 0,
  gridCellSize: 0,
  internalVertexFactor: 0,
  angleConstraint: 5,
  mergeVertexThreshold: 0,
  useGeographicRendering: true
}]

class TransitiveCanvasOverlay extends MapLayer {
  static propTypes = {
    transitiveData: PropTypes.object
  }

  // React Lifecycle Methods

  componentDidMount () {
    const map = this.context.map
    // FIXME: hack because L is undefined for some reason
    const LEAFLET = L || window.L
    LEAFLET.canvasLayer()
      .delegate(this) // -- if we do not inherit from L.CanvasLayer  we can setup a delegate to receive events from L.CanvasLayer
      .addTo(map)
  }

  componentWillReceiveProps (nextProps) {
    // Check if we received new transitive data
    if (this._transitive && !isEqual(nextProps.transitiveData, this.props.transitiveData)) {
      this._transitive.updateData(nextProps.transitiveData)
      if (!nextProps.transitiveData) this._transitive.render()
      else this._updateBoundsAndRender()
    }

    if ( // this block only applies for profile trips where active option changed
      nextProps.routingType === 'PROFILE' &&
      nextProps.activeItinerary !== this.props.activeItinerary
    ) {
      if (nextProps.activeItinerary == null) { // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.render()
      } else if (nextProps.transitiveData) {
        this._transitive.focusJourney(nextProps.transitiveData.journeys[nextProps.activeItinerary].journey_id)
        this._transitive.render()
      }
    }
  }

  componentWillUnmount () {
    if (this._transitive) {
      this._transitive.updateData(null)
      this._transitive.render()
    }
  }

  // Internal Methods

  _initTransitive (canvas) {
    const map = this.context.map

    // set up the transitive instance
    const mapBounds = map.getBounds()
    this._transitive = new Transitive({
      data: this.props.transitiveData,
      initialBounds: [[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]],
      zoomEnabled: false,
      autoResize: false,
      styles: require('./transitive-styles'),
      zoomFactors,
      display: 'canvas',
      canvas
    })

    checkHiPPI(canvas)

    // the initial map draw
    this._updateBoundsAndRender()
  }

  _updateBoundsAndRender () {
    if (!this._transitive) {
      console.log('WARNING: Transitive object not set in transitive-canvas-overlay')
      return
    }

    const mapBounds = this.context.map.getBounds()
    this._transitive.setDisplayBounds([[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]])
    this._transitive.render()
  }

  // Leaflet Layer API Methods

  onDrawLayer (info) {
    if (!this._transitive) this._initTransitive(info.canvas)

    const mapSize = this.context.map.getSize()
    if (
      this._lastMapSize && (
        mapSize.x !== this._lastMapSize.x ||
        mapSize.y !== this._lastMapSize.y
      )
    ) {
      const canvas = info.canvas
      checkHiPPI(canvas)
      this._transitive.display.setDimensions(mapSize.x, mapSize.y)
      this._transitive.display.setCanvas(canvas)
    }

    this._updateBoundsAndRender()

    this._lastMapSize = this.context.map.getSize()
  }

  createTile (coords) {
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

export default connect(mapStateToProps, mapDispatchToProps)(TransitiveCanvasOverlay)
