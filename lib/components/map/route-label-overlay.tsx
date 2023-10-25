import { connect } from 'react-redux'
import { Itinerary, Location } from '@opentripplanner/types'
import { Layer, Source } from 'react-map-gl'
import React from 'react'

import { getActiveItinerary } from '../../util/state'

type Props = {
  itineraries: Itinerary[]
  labelText: string
  locations: Location[]
}

const RouteLabelOverlay: React.FC<Props> = ({
  itineraries,
  labelText,
  locations
}) => {
  if (!itineraries || itineraries.length === 0) {
    return <></>
  }

  const geojson: GeoJSON.FeatureCollection = {
    features: itineraries.map((itinerary, index) => {
      const location = locations[index]
      const coordinates = [location.lon, location.lat]
      return {
        geometry: {
          coordinates: coordinates,
          type: 'Point'
        },
        id: index.toString(),
        properties: {
          labelText: labelText
        },
        type: 'Feature'
      }
    }),
    type: 'FeatureCollection'
  }

  return (
    <Source data={geojson} id="itinerary-labels-source" type="geojson">
      <Layer
        id="itinerary-label-layer"
        layout={{
          'text-allow-overlap': true,
          'text-field': ['get', 'labelText'],
          'text-size': 12
        }}
        type="symbol"
      />
    </Source>
  )
}

const mapStateToProps = (state: any) => {
  const { activeSearchId, config } = state.otp
  if (config.itinerary?.showFirstResultByDefault !== false) {
    return {
      itineraries: [],
      labelText: 'My Route',
      visible: false
    }
  }
  if (!activeSearchId) {
    return {
      itineraries: [],
      visible: false
    }
  }

  const activeItinerary = getActiveItinerary(state)
  const itineraries = activeItinerary ? [activeItinerary] : []

  return {
    itineraries: itineraries,
    labelText: 'My Route',
    visible: true
  }
}

export default connect(mapStateToProps)(RouteLabelOverlay)
