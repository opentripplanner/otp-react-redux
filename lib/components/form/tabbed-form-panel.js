import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'

import DateTimePreview from './date-time-preview'
import SettingsPreview from './settings-preview'
import DateTimeModal from './date-time-modal'
import SettingsSelectorPanel from './settings-selector-panel'

export default class TabbedFormPanel extends Component {
  static propTypes = {
    icons: PropTypes.object
  }

  constructor (props) {
    super(props)
    this.state = {
      expandedDisplay: null
    }
  }

  _onEditDateTimeClick = () => {
    const expandedDisplay = this._isExpanded('DATETIME')
      ? null
      : 'DATETIME'
    this.setState({ expandedDisplay })
  }

  _onEditSettingsClick = () => {
    const expandedDisplay = this._isExpanded('SETTINGS')
      ? null
      : 'SETTINGS'
    this.setState({ expandedDisplay })
  }

  _isExpanded = (value) => this.state.expandedDisplay === value

  _onHideClick = () => this.setState({ expandedDisplay: null })

  render () {
    const { expandedDisplay } = this.state
    const { icons } = this.props

    return (
      <div className='tabbed-form-panel'>
        <div className='tab-row'>
          <div className={`tab${this._isExpanded('DATETIME') ? ' selected' : ''}`}>
            <DateTimePreview
              onClick={this._onEditDateTimeClick}
            />
          </div>
          <div className={`tab${this._isExpanded('SETTINGS') ? ' selected' : ''}`}>
            <SettingsPreview
              icons={icons}
              onClick={this._onEditSettingsClick}
            />
          </div>
        </div>
        <VelocityTransitionGroup
          enter={{ animation: 'slideDown' }}
          leave={{ animation: 'slideUp' }}>
          {expandedDisplay && (
            <div className='active-panel'>
              {this._isExpanded('DATETIME') && (<DateTimeModal />)}
              {this._isExpanded('SETTINGS') && (<SettingsSelectorPanel icons={icons} />)}
              <div className='hide-button-row'>
                <Button className='hide-button clear-button-formatting' onClick={this._onHideClick}>
                  <i className='fa fa-caret-up' /> Hide Settings
                </Button>
              </div>
            </div>
          )}
        </VelocityTransitionGroup>
      </div>
    )
  }
}
