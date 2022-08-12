import { Clock } from '@styled-icons/fa-regular/Clock'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import StyledIconWrapper from '../util/styledIcon'

const SimpleRealtimeAnnotation = () => (
  <div className="simple-realtime-annotation">
    <StyledIconWrapper spaceRight>
      <Clock />
    </StyledIconWrapper>
    <FormattedMessage id="components.SimpleRealtimeAnnotation.usingRealtimeInfo" />
  </div>
)

export default SimpleRealtimeAnnotation
