import { ArrowRight } from '@styled-icons/fa-solid/ArrowRight'
import { connect } from 'react-redux'
import { Itinerary, Leg, Location } from '@opentripplanner/types'
import { Marker } from 'react-map-gl'
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
import DefaultRouteRenderer from '../narrative/metro/default-route-renderer'
import MetroItineraryRoutes from '../narrative/metro/metro-itinerary-routes'

type Props = {
  from: Location
  itins: Itinerary[]
  to: Location
  visible?: boolean
}

const getItinMidpoint = (itin: Itinerary, index: number, itinCount = 1) => {
  const geometries = itin.legs.flatMap((leg) =>
    polyline.decode(leg.legGeometry.points)
  )

  // Each itinerary will render the marker at a different spot along the itinerary
  // 0.8 prevents any items from appearing at the very end of a leg
  const midPoint =
    geometries[
      Math.floor((geometries.length / (itinCount + 1)) * 0.8) * (index + 1)
    ]

  return midPoint
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
    height: 20px;
  }
}
`

const ItinerarySummaryOverlay = ({ from, itins, to, visible }: Props) => {
  // @ts-expect-error React context is populated dynamically
  const { LegIcon } = useContext(ComponentContext)

  if (!itins || !visible) return <></>
  const mergedItins = doMergeItineraries(itins).mergedItineraries
  const midPoints = mergedItins.map((itin: Itinerary, index: number) =>
    getItinMidpoint(itin, index, mergedItins.length)
  )

  try {
    return (
      <>
        {midPoints.map((mp: number[], key: number) => (
          <Marker key={key} latitude={mp[0]} longitude={mp[1]}>
            <Card>
              <MetroItineraryRoutes
                expanded={false}
                itinerary={mergedItins[key]}
                LegIcon={LegIcon}
              />
            </Card>
          </Marker>
        ))}
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
