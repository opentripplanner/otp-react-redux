// TODO: Typescript
/* eslint-disable react/prop-types */
// There are some strange indentation problems in this file with jsx-index and prettier.
/* eslint-disable react/jsx-indent */
import { Button } from 'react-bootstrap'
import { CaretUp } from '@styled-icons/fa-solid/CaretUp'
import { connect } from 'react-redux'
import { FormattedMessage } from 'react-intl'
import React, { Component } from 'react'

import { IconWithText } from '../util/styledIcon'
import { setMainPanelContent } from '../../actions/ui'

import ConnectedSettingsSelectorPanel from './connected-settings-selector-panel'
import DateTimeModal from './date-time-modal'
import DateTimePreview from './date-time-preview'
import SettingsPreview from './settings-preview'

class TabbedFormPanel extends Component {
  _onEditDateTimeClick = () => {
    const { mainPanelContent, setMainPanelContent } = this.props
    setMainPanelContent(
      mainPanelContent === 'EDIT_DATETIME' ? null : 'EDIT_DATETIME'
    )
  }

  _onEditSettingsClick = () => {
    const { mainPanelContent, setMainPanelContent } = this.props
    setMainPanelContent(
      mainPanelContent === 'EDIT_SETTINGS' ? null : 'EDIT_SETTINGS'
    )
  }

  _onHideClick = () => this.props.setMainPanelContent(null)

  render() {
    const { mainPanelContent } = this.props

    return (
      <div className="tabbed-form-panel">
        <div className="tab-row">
          <div
            className={`tab left ${
              mainPanelContent === 'EDIT_DATETIME' ? ' selected' : ''
            }`}
          >
            <div className="tab-content">
              <DateTimePreview onClick={this._onEditDateTimeClick} />
            </div>
          </div>
          <div
            className={`tab right ${
              mainPanelContent === 'EDIT_SETTINGS' ? ' selected' : ''
            }`}
          >
            <div className="tab-content">
              <SettingsPreview onClick={this._onEditSettingsClick} />
            </div>
          </div>
        </div>
        {(mainPanelContent === 'EDIT_DATETIME' ||
          mainPanelContent === 'EDIT_SETTINGS') && (
          <div className="active-panel">
            {mainPanelContent === 'EDIT_DATETIME' && <DateTimeModal />}
            {mainPanelContent === 'EDIT_SETTINGS' && (
              <ConnectedSettingsSelectorPanel />
            )}
            <div className="hide-button-row">
              <Button
                className="hide-button clear-button-formatting"
                onClick={this._onHideClick}
              >
                <IconWithText Icon={CaretUp}>
                  <FormattedMessage id="components.TabbedFormPanel.hideSettings" />
                </IconWithText>
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
