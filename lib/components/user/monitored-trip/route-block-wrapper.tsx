import { ComponentContext } from '../../../util/contexts'
import { Itinerary } from '@opentripplanner/types'
import React, { useContext } from 'react'

interface Props {
  itinerary: Itinerary
}
const RouteBlockWrapper = ({ itinerary }: Props) => {
  // @ts-expect-error TODO: add ModesAndRoutes to ItineraryBody attribute of ComponentContext
  const { ItineraryBody, LegIcon } = useContext(ComponentContext)
  const ModesAndRoutes = ItineraryBody.ModesAndRoutes
  return <ModesAndRoutes itinerary={itinerary} LegIcon={LegIcon} />
}

export default RouteBlockWrapper
