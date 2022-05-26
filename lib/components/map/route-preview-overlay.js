/* eslint-disable @typescript-eslint/no-empty-function */
import { connect } from 'react-redux'
import { FeatureGroup, MapLayer, Polyline, withLeaflet } from 'react-leaflet'
import polyline from '@mapbox/polyline'
import React from 'react'

import {
  getActiveItinerary,
  getActiveSearch,
  getVisibleItineraryIndex
} from '../../util/state'

/**
 * This overlay will display thin gray lines for a set of geometries. It's to be used
 * as a stopgap until we make full use of Transitive!
 */
class GeometryPreviewOverlay extends MapLayer {
  componentDidMount() {}

  // TODO: determine why the default MapLayer componentWillUnmount() method throws an error
  componentWillUnmount() {}

  createLeafletElement() {}

  updateLeafletElement() {}

  render() {
    const { geometries, leafletPath } = this.props

    if (!geometries) return <FeatureGroup />

    const uniqueGeometries = Array.from(new Set(geometries))
    return (
      <FeatureGroup>
        {uniqueGeometries.map((geometry, index) => {
          if (!geometry) return null
          const pts = polyline.decode(geometry)
          if (!pts) return null

          return (
            <Polyline
              key={index}
              /* eslint-disable-next-line react/jsx-props-no-spreading */
              {...leafletPath}
              positions={pts}
            />
          )
        })}
      </FeatureGroup>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  const { activeSearchId, config } = state.otp
  // Only show this overlay if the metro UI is explicitly enabled
  if (config.itinerary?.showFirstResultByDefault !== false) {
    return {}
  }
  if (!activeSearchId) return {}

  const visibleItinerary = getVisibleItineraryIndex(state)
  const activeItinerary = getActiveItinerary(state)

  const geometries = getActiveSearch(state)?.response.flatMap((response) =>
    response?.plan?.itineraries?.flatMap((itinerary) => {
      return itinerary.legs?.map((leg) => leg.legGeometry.points)
    })
  )

  return {
    geometries,

    leafletPath: {
      color: 'gray',
      dashArray: '3, 8',
      opacity:
        // We need an explicit check for undefined and null because 0
        // is for us true
        (visibleItinerary === undefined || visibleItinerary === null) &&
        (activeItinerary === undefined || activeItinerary === null)
          ? 0.5
          : 0,
      weight: 4
    }
  }
}

const mapDispatchToProps = {}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withLeaflet(GeometryPreviewOverlay))
