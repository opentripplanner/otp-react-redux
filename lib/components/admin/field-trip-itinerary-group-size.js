/* eslint-disable react/prop-types */
import { Badge } from 'react-bootstrap'
import { User } from '@styled-icons/fa-solid/User'
import React from 'react'

import StyledIconWrapper from '../util/styledIcon'

export default function FieldTripGroupSize({ itinerary }) {
  return (
    itinerary.fieldTripGroupSize >= 0 && (
      <Badge>
        <StyledIconWrapper spaceAfter>
          <User />
        </StyledIconWrapper>
        {itinerary.fieldTripGroupSize}
      </Badge>
    )
  )
}
