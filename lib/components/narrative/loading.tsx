import React from 'react'

import Icon from '../util/icon'

type Props = {
  small?: boolean
}

const Loading = ({ small }: Props): JSX.Element => {
  return (
    <p className="text-center percy-hide" style={{ marginTop: '15px' }}>
      <Icon className={`${small ? 'fa-3x' : 'fa-5x'} fa-spin`} type="refresh" />
    </p>
  )
}

export default Loading
