import { PropTypes } from 'react'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'
import { connect } from 'react-redux'

import * as d3 from 'd3'

import { getActiveSearch } from '../../util/state'
import { itineraryToTransitive } from '../../util/map'

const zoomFactors = [{
  minScale: 0,
  gridCellSize: 0,
  internalVertexFactor: 0,
  angleConstraint: 5,
  mergeVertexThreshold: 0,
  useGeographicRendering: true
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

    if ( // this block only applies for profile trips where active option changed
      nextProps.routingType === 'PROFILE' &&
      nextProps.activeItinerary !== this.props.activeItinerary
    ) {
      if (nextProps.activeItinerary == null) { // no option selected; clear focus
        this._transitive.focusJourney(null)
        this._transitive.refresh()
      } else if (nextProps.transitiveData) {
        console.log(nextProps);
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
    activeItinerary: activeSearch && activeSearch.activeItinerary,
    routingType: activeSearch && activeSearch.query && activeSearch.query.routingType
  }
}

const mapDispatchToProps = {
}

export default connect(mapStateToProps, mapDispatchToProps)(TransitiveOverlay)
