import React from 'react'
import { FormattedMessage } from 'react-intl'

import IconWithSpace from '../util/icon-with-space'

const SimpleRealtimeAnnotation = () => (
  <div className='simple-realtime-annotation'>
    <IconWithSpace type='clock-o' />
    <FormattedMessage id='components.SimpleRealtimeAnnotation.usingRealtimeInfo' />
  </div>
)

export default SimpleRealtimeAnnotation
