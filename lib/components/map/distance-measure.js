import { MapControl, withLeaflet } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet.polylinemeasure/Leaflet.PolylineMeasure.js'

class DistanceMeasure extends MapControl {
  createLeafletElement (props) {
    return L.control.polylineMeasure({
      unit: 'landmiles',
      measureControlLabel: '&#x1f4cf;',
      backgroundColor: '#f3dd2d',
      clearMeasurementsOnStop: true
    })
  }

  componentDidMount () {
    const { map } = this.props.leaflet
    this.leafletElement.addTo(map)
  }
}

export default withLeaflet(DistanceMeasure)
