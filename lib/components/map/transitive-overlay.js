import { MapLayer } from 'react-leaflet'
import L from 'leaflet'

require('./d3l')

class TransitiveOverlay extends MapLayer {
  createLeafletElement (props) {
    const dataset = [{ latLng: L.latLng(45.52, -122.682) }]
    const d3Overlay = L.d3SvgOverlay((selection, projection) => {
      var updateSelection = selection.selectAll('circle').data(dataset)
      updateSelection.enter()
        .append('circle')
        .attr('cx', d => { return projection.latLngToLayerPoint(d.latLng).x })
        .attr('cy', d => { return projection.latLngToLayerPoint(d.latLng).y })
        .attr('r', d => { return 10 })
    })

    return d3Overlay
  }

  updateLeafletElement (fromProps, toProps) {
    console.log('update', toProps)
  }
}

export default TransitiveOverlay
