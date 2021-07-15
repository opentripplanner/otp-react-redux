import React from 'react'
import { FormattedMessage } from 'react-intl'

const SimpleRealtimeAnnotation = () => (
  <div className='simple-realtime-annotation'>
    <i className='fa fa-clock-o' />
    {' '}
    <FormattedMessage id='components.SimpleRealtimeAnnotation.usingRealtimeInfo' />
  </div>
)

export default SimpleRealtimeAnnotation
