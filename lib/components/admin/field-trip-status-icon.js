/* eslint-disable react/prop-types */
import { CheckCircle } from '@styled-icons/fa-solid/CheckCircle'
import { ExclamationCircle } from '@styled-icons/fa-solid/ExclamationCircle'
import React from 'react'

import { StyledIconWrapper } from '../util/styledIcon'

const FieldTripStatusIcon = ({ ok }) =>
  ok ? (
    <StyledIconWrapper className="text-success">
      <CheckCircle />
    </StyledIconWrapper>
  ) : (
    <StyledIconWrapper className="text-warning">
      <ExclamationCircle />
    </StyledIconWrapper>
  )

export default FieldTripStatusIcon
