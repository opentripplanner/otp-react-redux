import { MapControl } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.polylinemeasure/Leaflet.PolylineMeasure.js'

export default class DistanceMeasure extends MapControl {
  createLeafletElement (props) {
    return L.control.polylineMeasure({
      unit: 'landmiles',
      measureControlLabel: '&#x1f4cf;',
      backgroundColor: '#f3dd2d',
      clearMeasurementsOnStop: true
    })
  }

  componentDidMount () {
    const { map } = this.context
    this.leafletElement.addTo(map)
  }
}
