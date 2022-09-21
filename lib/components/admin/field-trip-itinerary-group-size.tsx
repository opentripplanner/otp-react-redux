import { Badge } from 'react-bootstrap'
import { Itinerary } from '@opentripplanner/types'
import React from 'react'

import Icon from '../util/icon'

type Props = {
  itinerary: Itinerary & { fieldTripGroupSize: number }
}

export default function FieldTripGroupSize({
  itinerary
}: Props): React.ReactNode {
  if (!itinerary.fieldTripGroupSize || itinerary.fieldTripGroupSize <= 0)
    return null
  return (
    <Badge>
      <Icon type="user" />
      {itinerary.fieldTripGroupSize}
    </Badge>
  )
}
