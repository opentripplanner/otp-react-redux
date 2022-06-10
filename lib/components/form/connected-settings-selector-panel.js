/* eslint-disable react/prop-types */
import { connect } from 'react-redux'
import { injectIntl } from 'react-intl'
import React, { Component } from 'react'

import { ComponentContext } from '../../util/contexts'
import { getShowUserSettings } from '../../util/state'
import { getSupportedModes } from '../../util/i18n'
import { setQueryParam } from '../../actions/form'

import { StyledSettingsSelectorPanel } from './styled'
import UserTripSettings from './user-trip-settings'

// TODO: Button title should be bold when button is selected.

class ConnectedSettingsSelectorPanel extends Component {
  static contextType = ComponentContext

  render() {
    const { config, intl, query, setQueryParam, showUserSettings } = this.props
    const { ModeIcon } = this.context
    return (
      <div className="settings-selector-panel">
        <div className="modes-panel">
          {showUserSettings && <UserTripSettings />}

          <StyledSettingsSelectorPanel
            ModeIcon={ModeIcon}
            onQueryParamChange={setQueryParam}
            queryParams={query}
            supportedCompanies={config.companies}
            supportedModes={getSupportedModes(config, intl)}
          />
        </div>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state) => {
  const { config, currentQuery } = state.otp
  return {
    config,
    query: currentQuery,
    showUserSettings: getShowUserSettings(state)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(ConnectedSettingsSelectorPanel))
