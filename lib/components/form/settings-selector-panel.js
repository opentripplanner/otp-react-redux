import React, { Component } from 'react'
import { Button, ButtonGroup } from 'react-bootstrap'

import ModesPanel from './modes-panel'
import GeneralSettingsPanel from './general-settings-panel'

const panels = [
  {
    key: 'MODES',
    text: 'Modes',
    component: <ModesPanel />
  }, {
    key: 'GENERAL',
    text: 'General',
    component: <GeneralSettingsPanel />
  }
]

export default class SettingsSelectorPanel extends Component {
  constructor (props) {
    super(props)
    this.state = { activePanel: 'MODES' }
  }

  render () {
    return (
      <div className='settings-selector-panel'>
        <div className='button-row'>
          <ButtonGroup justified>
            {panels.map(panel => {
              return (
                <ButtonGroup key={panel.key}>
                  <Button
                    className={panel.key === this.state.activePanel ? 'selected' : ''}
                    onClick={() => this.setState({ activePanel: panel.key })}
                  >{panel.text}</Button>
                </ButtonGroup>
              )
            })}
          </ButtonGroup>
        </div>
        {panels.find(p => p.key === this.state.activePanel).component}
      </div>
    )
  }
}
