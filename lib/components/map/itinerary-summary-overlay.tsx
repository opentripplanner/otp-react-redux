import { connect } from 'react-redux'
import { Feature, lineString, LineString } from '@turf/helpers'
import { Itinerary, Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import centroid from '@turf/centroid'
import distance from '@turf/distance'
import polyline from '@mapbox/polyline'
import React, { useContext } from 'react'
import styled from 'styled-components'

import { boxShadowCss } from '../form/batch-styled'
import { ComponentContext } from '../../util/contexts'
import { doMergeItineraries } from '../narrative/narrative-itineraries'
import {
  getActiveItinerary,
  getActiveSearch,
  getVisibleItineraryIndex
} from '../../util/state'
import MetroItineraryRoutes from '../narrative/metro/metro-itinerary-routes'

type ItinWithGeometry = Itinerary & { allLegGeometry: Feature<LineString> }

type Props = {
  from: Location
  itins: Itinerary[]
  to: Location
  visible?: boolean
}

const Card = styled.div`
  ${boxShadowCss}

  background: #fffffffa;
  border-radius: 5px;
  padding: 5px;
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  
  div {
    margin-top: -0px!important;
  }
  .route-block-wrapper span {
    padding: 0px;
  }
  * {
    height: 25px;
  }
}
`

function addItinLineString(itin: Itinerary): ItinWithGeometry {
  return {
    ...itin,
    allLegGeometry: lineString(
      itin.legs.flatMap((leg) => polyline.decode(leg.legGeometry.points))
    )
  }
}

function getUniquePoint(
  thisItin: ItinWithGeometry,
  otherMidpoints: [number, number][]
) {
  let maxDistance = -Infinity
  const line = thisItin.allLegGeometry
  const centerOfLine = centroid(line).geometry.coordinates
  let uniquePoint = centerOfLine

  line.geometry.coordinates.forEach((point) => {
    const totalDistance = otherMidpoints.reduce(
      (prev, cur) => (prev += distance(point, cur)),
      0
    )

    const selfDistance = distance(point, centerOfLine)
    // maximize distance from all other points while minimizing distance to center of our own line
    const averageDistance = totalDistance / otherMidpoints.length - selfDistance

    if (averageDistance > maxDistance) {
      maxDistance = averageDistance
      uniquePoint = point
    }
  })
  return { itin: thisItin, uniquePoint }
}

const ItinerarySummaryOverlay = ({ from, itins, to, visible }: Props) => {
  // @ts-expect-error React context is populated dynamically
  const { LegIcon } = useContext(ComponentContext)

  if (!itins || !visible) return <></>
  const mergedItins: ItinWithGeometry[] =
    doMergeItineraries(itins).mergedItineraries.map(addItinLineString)
  const midPoints = []
  mergedItins.forEach((itin, index) => {
    midPoints.push(
      getUniquePoint(
        itin,
        midPoints.map((mp) => mp.uniquePoint)
      )
    )
  })
  // The first point is probably not well placed, so let's run the algorithm again
  if (midPoints.length > 1) {
    midPoints[0] = getUniquePoint(
      mergedItins[0],
      midPoints.map((mp) => mp.uniquePoint)
    )
  }

  try {
    return (
      <>
        {midPoints.map(
          (mp) =>
            mp.uniquePoint && (
              <Marker
                key={mp.itin.duration}
                latitude={mp.uniquePoint[0]}
                longitude={mp.uniquePoint[1]}
              >
                <Card>
                  <MetroItineraryRoutes
                    expanded={false}
                    itinerary={mp.itin}
                    LegIcon={LegIcon}
                  />
                </Card>
              </Marker>
            )
        )}
      </>
    )
  } catch (error) {
    console.warn(`Can't create geojson from route: ${error}`)
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
  const itins = activeSearch?.response.flatMap(
    (serverResponse: { plan?: { itineraries?: Itinerary[] } }) =>
      serverResponse?.plan?.itineraries
  )

  // @ts-expect-error state is not typed
  const query = activeSearch ? activeSearch?.query : state.otp.currentQuery
  const { from, to } = query

  return {
    from,
    itins,
    to,
    visible:
      // We need an explicit check for undefined and null because 0
      // is for us true
      (visibleItinerary === undefined || visibleItinerary === null) &&
      (activeItinerary === undefined || activeItinerary === null)
  }
}

export default connect(mapStateToProps)(ItinerarySummaryOverlay)
