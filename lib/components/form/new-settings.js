import React, { Component } from 'react'

import SettingsSelectorPanel from './settings-1'

export default class NewSettings extends Component {
  render () {
    return <SettingsSelectorPanel {...this.props} />
  }
}
