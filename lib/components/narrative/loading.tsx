import React, { Component } from 'react'

import Icon from '../util/icon'

type Props = {
  small?: boolean
}

export default class Loading extends Component<Props> {
  render(): JSX.Element {
    const { small } = this.props
    return (
      <p className="text-center percy-hide" style={{ marginTop: '15px' }}>
        <Icon
          className={`${small ? 'fa-3x' : 'fa-5x'} fa-spin`}
          type="refresh"
        />
      </p>
    )
  }
}
