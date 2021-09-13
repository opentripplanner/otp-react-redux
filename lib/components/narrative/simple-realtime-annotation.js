import React from 'react'
import { FormattedMessage } from 'react-intl'

import Icon from '../util/icon'

const SimpleRealtimeAnnotation = () => (
  <div className='simple-realtime-annotation'>
    <Icon type='clock-o' withSpace />
    <FormattedMessage id='components.SimpleRealtimeAnnotation.usingRealtimeInfo' />
  </div>
)

export default SimpleRealtimeAnnotation
