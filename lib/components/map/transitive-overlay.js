import { PropTypes } from 'react'
import { MapLayer } from 'react-leaflet'
import L from 'leaflet'

import * as d3 from 'd3'

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

    // set up the transitive instance
    const mapBounds = map.getBounds()
    this._transitive = new Transitive({
      data: this.props.transitiveData,
      svgContainer: document.getElementsByClassName('leaflet-container')[0],
      svg: this._svgMain,
      initialBounds: [[mapBounds.getWest(), mapBounds.getSouth()], [mapBounds.getEast(), mapBounds.getNorth()]],
      zoomEnabled: false,
      autoResize: false
    })

    // the initial map draw
    this._redraw()
  }

  componentWillReceiveProps (nextProps) {
    if (nextProps.transitiveData !== this.props.transitiveData) {
      this._transitive.updateData(nextProps.transitiveData)
      this._redraw()
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

export default TransitiveOverlay
