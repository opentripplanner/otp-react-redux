import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import { FormattedMessage } from 'react-intl'
import { connect } from 'react-redux'

import Icon from '../util/icon'
import { setMainPanelContent } from '../../actions/ui'

import DateTimePreview from './date-time-preview'
import SettingsPreview from './settings-preview'
import DateTimeModal from './date-time-modal'
import ConnectedSettingsSelectorPanel from './connected-settings-selector-panel'

class TabbedFormPanel extends Component {
  _onEditDateTimeClick = () => {
    const { mainPanelContent, setMainPanelContent } = this.props
    setMainPanelContent(mainPanelContent === 'EDIT_DATETIME' ? null : 'EDIT_DATETIME')
  }

  _onEditSettingsClick = () => {
    const { mainPanelContent, setMainPanelContent } = this.props
    setMainPanelContent(mainPanelContent === 'EDIT_SETTINGS' ? null : 'EDIT_SETTINGS')
  }

  _onHideClick = () => this.props.setMainPanelContent(null)

  render () {
    const { mainPanelContent } = this.props

    return (
      <div className='tabbed-form-panel'>
        <div className='tab-row'>
          <div className={`tab left ${mainPanelContent === 'EDIT_DATETIME' ? ' selected' : ''}`}>
            <div className='tab-content'>
              <DateTimePreview
                onClick={this._onEditDateTimeClick}
              />
            </div>
          </div>
          <div className={`tab right ${mainPanelContent === 'EDIT_SETTINGS' ? ' selected' : ''}`}>
            <div className='tab-content'>
              <SettingsPreview onClick={this._onEditSettingsClick} />
            </div>
          </div>
        </div>
        {(mainPanelContent === 'EDIT_DATETIME' || mainPanelContent === 'EDIT_SETTINGS') && (
          <div className='active-panel'>
            {mainPanelContent === 'EDIT_DATETIME' && (<DateTimeModal />)}
            {mainPanelContent === 'EDIT_SETTINGS' && (<ConnectedSettingsSelectorPanel />)}
            <div className='hide-button-row'>
              <Button className='hide-button clear-button-formatting' onClick={this._onHideClick}>
                <Icon type='caret-up' withSpace />
                <FormattedMessage
                  id='components.TabbedFormPanel.hideSettings'
                />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  return {
    mainPanelContent: state.otp.ui.mainPanelContent
  }
}

const mapDispatchToProps = {
  setMainPanelContent
}

export default connect(mapStateToProps, mapDispatchToProps)(TabbedFormPanel)
