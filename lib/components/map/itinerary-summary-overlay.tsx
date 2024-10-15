import { connect } from 'react-redux'
import { Feature, lineString, LineString, Position } from '@turf/helpers'
import { Itinerary, Leg, Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
import centroid from '@turf/centroid'
import distance from '@turf/distance'
import polyline from '@mapbox/polyline'
import React, { useContext, useState } from 'react'
import styled from 'styled-components'

import * as narriativeActions from '../../actions/narrative'
import { AppReduxState } from '../../util/state-types'
import { boxShadowCss } from '../form/batch-styled'
import { ComponentContext } from '../../util/contexts'
import { doMergeItineraries } from '../narrative/narrative-itineraries'
import {
  getActiveItinerary,
  getActiveSearch,
  getVisibleItineraryIndex
} from '../../util/state'
import { isDefined } from '../../util/ui'
import FormattedDuration from '../util/formatted-duration'
import MetroItineraryRoutes from '../narrative/metro/metro-itinerary-routes'

type ItinWithGeometry = Itinerary & {
  allLegGeometry: Feature<LineString>
  allStartTimes?: Itinerary[]
  index?: number
}

type Props = {
  from: Location
  itins: Itinerary[]
  setActiveItinerary: ({ index }: { index: number | null | undefined }) => void
  setVisibleItinerary: ({ index }: { index: number | null | undefined }) => void
  to: Location
  visible?: boolean
  visibleItinerary?: number
}

const TimeWrapper = styled.span`
  align-items: center;
  background: black;
  border-radius: 5px;
  color: white;
  display: inline-flex;
  font-weight: 600;
  justify-content: center;
  margin-left: 24px;
  padding: 0px 8px;
`

const Card = styled.div`
  ${boxShadowCss}

  background: #fffffffa;
  border-radius: 5px;
  padding: 8px;
  align-items: center;
  display: flex;
  flex-wrap: wrap;

  
  span {
    span {
      span {
        max-height: 28px;
        min-height: 20px;
      }
    }
  }
  div {
    margin-top: -0px !important;
    transform: scale(0.9);
  }
  .route-block-wrapper span {
    padding: 0px;
  }
  * {
    height: 26px;
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
function addTrueIndex(array: ItinWithGeometry[]): ItinWithGeometry[] {
  for (let i = 0; i < array.length; i++) {
    const prevIndex = array?.[i - 1]?.index
    const itin = array[i]
    const nextIndex = itin?.allStartTimes?.length ?? 1
    array[i] = {
      ...itin,
      index: (prevIndex ?? -1) + nextIndex
    }
  }
  return array
}

type ItinUniquePoint = {
  itin: ItinWithGeometry
  uniquePoint: Position
}

function getUniquePoint(
  thisItin: ItinWithGeometry,
  otherPoints: ItinUniquePoint[]
): ItinUniquePoint {
  const otherMidpoints = otherPoints.map((mp) => mp.uniquePoint)
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
    const averageDistance =
      1.2 * (totalDistance / otherMidpoints.length) - selfDistance

    if (averageDistance > maxDistance) {
      maxDistance = averageDistance
      uniquePoint = point
    }
  })
  return { itin: thisItin, uniquePoint }
}

const ItinerarySummaryOverlay = ({
  itins,
  setActiveItinerary: setActive,
  setVisibleItinerary: setVisible,
  visible,
  visibleItinerary
}: Props) => {
  // @ts-expect-error React context is populated dynamically
  const { LegIcon } = useContext(ComponentContext)

  const [sharedTimeout, setSharedTimeout] = useState<null | NodeJS.Timeout>(
    null
  )

  if (!itins || !visible) return <></>
  const indexedItins: ItinWithGeometry[] = addTrueIndex(
    itins.map(addItinLineString)
  )
  const mergedItins = doMergeItineraries(indexedItins).mergedItineraries

  const midPoints = mergedItins.reduce(
    (prev: ItinUniquePoint[], curItin: ItinWithGeometry) => {
      prev.push(getUniquePoint(curItin, prev))
      return prev
    },
    []
  )
  // The first point is probably not well placed, so let's run the algorithm again
  if (midPoints.length > 1) {
    midPoints[0] = getUniquePoint(mergedItins[0], midPoints)
  }

  try {
    return (
      <>
        {midPoints.map(
          (mp) =>
            // If no itinerary is hovered, show all of them. If one is selected, show only that one
            // TODO: clean up conditionals, move these to a more appropriate place without breaking indexing
            (isDefined(visibleItinerary)
              ? visibleItinerary === mp.itin.index
              : true) &&
            mp.uniquePoint && (
              <Marker
                key={mp.itin.duration}
                latitude={mp.uniquePoint[0]}
                longitude={mp.uniquePoint[1]}
                style={{ cursor: 'pointer' }}
              >
                <Card
                  onClick={() => {
                    setActive({ index: mp.itin.index })
                  }}
                  // TODO: restore setting visible itinerary on hover without
                  // causing endless re-render?
                >
                  <MetroItineraryRoutes
                    expanded={false}
                    itinerary={mp.itin}
                    LegIcon={LegIcon}
                  />
                  <TimeWrapper>
                    <FormattedDuration duration={mp.itin.duration} />
                  </TimeWrapper>
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

const mapStateToProps = (state: AppReduxState) => {
  const { activeSearchId, config } = state.otp
  if (config.itinerary?.previewOverlay !== true) {
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
    visible: activeItinerary === undefined || activeItinerary === null,
    visibleItinerary
  }
}

const mapDispatchToProps = {
  setActiveItinerary: narriativeActions.setActiveItinerary,
  setVisibleItinerary: narriativeActions.setVisibleItinerary
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(ItinerarySummaryOverlay)
