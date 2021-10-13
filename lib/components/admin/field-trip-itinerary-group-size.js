import React from 'react'
import { Badge } from 'react-bootstrap'

import Icon from '../util/icon'

export default function FieldTripGroupSize ({ itinerary }) {
  return itinerary.fieldTripGroupSize > 0 && (
    <Badge>
      <Icon type='user' />
      {itinerary.fieldTripGroupSize}
    </Badge>
  )
}
