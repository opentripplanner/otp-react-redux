import React from 'react'

import Icon from '../narrative/icon'

const FieldTripStatusIcon = ({ status }) => {
  return status
    ? <Icon className='text-success' type='check' />
    : <Icon className='text-warning' type='exclamation-circle' />
}

export default FieldTripStatusIcon
