import { Clock } from '@styled-icons/fa-regular/Clock'
import { FormattedMessage } from 'react-intl'
import React from 'react'

import { IconWithText } from '../util/styledIcon'

const SimpleRealtimeAnnotation = () => (
  <div className="simple-realtime-annotation">
    <IconWithText Icon={Clock}>
      <FormattedMessage id="components.SimpleRealtimeAnnotation.usingRealtimeInfo" />
    </IconWithText>
  </div>
)

export default SimpleRealtimeAnnotation
