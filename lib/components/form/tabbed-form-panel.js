import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button } from 'react-bootstrap'
import { VelocityTransitionGroup } from 'velocity-react'

import DateTimePreview from './date-time-preview'
import SettingsPreview from './settings-preview'
import DateTimeModal from './date-time-modal'
import SettingsSelectorPanel from './settings-selector-panel'

export default class TabbedFormPanel extends Component {
  constructor (props) {
    super(props)
    this.state = {
      expandedDisplay: null
    }
  }

  _onEditDateTimeClick = () => {
    this.setState({ expandedDisplay: 'DATETIME' })
  }

  _onEditSettingsClick = () => {
    this.setState({ expandedDisplay: 'SETTINGS' })
  }

  _onHideClick = () => {
    this.setState({ expandedDisplay: null })
  }

  render () {
    const { expandedDisplay } = this.state
    const { icons } = this.props

    return (
      <div className='tabbed-form-panel'>
        <div className='tab-row'>
          <div className={`tab${expandedDisplay === 'DATETIME' ? ' selected' : ''}`}>
            <DateTimePreview
              onClick={this._onEditDateTimeClick}
            />
          </div>
          <div className={`tab${expandedDisplay === 'SETTINGS' ? ' selected' : ''}`}>
            <SettingsPreview
              icons={icons}
              onClick={this._onEditSettingsClick}
            />
          </div>
        </div>
        <VelocityTransitionGroup enter={{animation: 'slideDown'}} leave={{animation: 'slideUp'}}>
          {expandedDisplay && (
            <div className='active-panel'>
              {expandedDisplay === 'DATETIME' && (<DateTimeModal />)}
              {expandedDisplay === 'SETTINGS' && (<SettingsSelectorPanel icons={icons} />)}
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
