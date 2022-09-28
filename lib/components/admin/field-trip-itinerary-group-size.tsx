import { Badge } from 'react-bootstrap'
import { Itinerary } from '@opentripplanner/types'
import { User } from '@styled-icons/fa-solid/User'
import React from 'react'

import { IconWithText } from '../util/styledIcon'

type Props = {
  itinerary: Itinerary & { fieldTripGroupSize: number }
}

export default function FieldTripGroupSize({
  itinerary
}: Props): React.ReactNode {
  if (!itinerary.fieldTripGroupSize || itinerary.fieldTripGroupSize < 0) {
    return null
  }
  return (
    <Badge>
      <IconWithText Icon={User}>{itinerary.fieldTripGroupSize}</IconWithText>
    </Badge>
  )
}
