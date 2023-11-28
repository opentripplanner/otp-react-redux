import { connect } from 'react-redux'
import { getFitBoundsPadding } from '@opentripplanner/base-map/lib/util'
import { Itinerary, Location } from '@opentripplanner/types'
import { Layer, Source, useMap } from 'react-map-gl'
import polyline from '@mapbox/polyline'
import React, { useEffect } from 'react'

import {
  getActiveItinerary,
  getActiveSearch,
  getVisibleItineraryIndex
} from '../../util/state'

type Props = {
  from: Location
  geometries: string[]
  to: Location
  visible?: boolean
}
/**
 * This overlay will display thin gray lines for a set of geometries. It's to be used
 * as a stopgap until we make full use of Transitive!
 */
const RoutePreviewOverlay = ({ from, geometries, to, visible }: Props) => {
  // Center the map over the endpoints when this overlay is shown.
  const { current: map } = useMap()
  useEffect(() => {
    if (visible) {
      map?.fitBounds([from, to], {
        duration: 500,
        padding: getFitBoundsPadding(map, 0.2)
      })
    }
  }, [map, visible, from, to])

  if (!geometries || !visible) return <></>

  const uniqueGeometries = Array.from(new Set(geometries))
  try {
    const geojson: GeoJSON.FeatureCollection = {
      features: uniqueGeometries
        .filter((s) => !!s)
        .map((segment) => {
          return {
            geometry: polyline.toGeoJSON(segment),
            properties: [],
            type: 'Feature'
          }
        }),
      type: 'FeatureCollection'
    }
    return (
      <Source data={geojson} id="route-preview-source" type="geojson">
        <Layer
          id="route-preview"
          layout={{
            'line-cap': 'round',
            'line-join': 'round'
          }}
          paint={{
            'line-blur': 4,
            'line-color': '#333',
            'line-dasharray': [1, 2],
            'line-opacity': 0.6,
            'line-width': 4
          }}
          type="line"
        />
      </Source>
    )
  } catch (error) {
    console.warn(`Can't create geojson from route ${geometries}: ${error}`)
    return <></>
  }
}

// TODO: Typescript state
const mapStateToProps = (state: any) => {
  const { activeSearchId, config } = state.otp
  // Only show this overlay if the metro UI is explicitly enabled
  if (config.itinerary?.showFirstResultByDefault !== false) {
    return {}
  }
  if (!activeSearchId) return {}

  const visibleItinerary = getVisibleItineraryIndex(state)
  const activeItinerary = getActiveItinerary(state)

  const activeSearch = getActiveSearch(state)
  // @ts-expect-error state is not typed
  const geometries = activeSearch?.response.flatMap(
    (serverResponse: { plan?: { itineraries?: Itinerary[] } }) =>
      serverResponse?.plan?.itineraries?.flatMap((itinerary) => {
        return itinerary.legs?.map((leg) => leg.legGeometry.points)
      })
  )

  // @ts-expect-error state is not typed
  const query = activeSearch ? activeSearch?.query : state.otp.currentQuery
  const { from, to } = query

  return {
    from,
    geometries,
    to,
    visible:
      // We need an explicit check for undefined and null because 0
      // is for us true
      (visibleItinerary === undefined || visibleItinerary === null) &&
      (activeItinerary === undefined || activeItinerary === null)
  }
}

export default connect(mapStateToProps)(RoutePreviewOverlay)
