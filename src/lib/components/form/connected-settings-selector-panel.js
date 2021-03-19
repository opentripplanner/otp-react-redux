import React, { Component } from 'react'
import { connect } from 'react-redux'

import { setQueryParam } from '../../actions/form'
import { ComponentContext } from '../../util/contexts'
import { getShowUserSettings } from '../../util/state'

import { StyledSettingsSelectorPanel } from './styled'
import UserTripSettings from './user-trip-settings'

// TODO: Button title should be bold when button is selected.

class ConnectedSettingsSelectorPanel extends Component {
  static contextType = ComponentContext

  render () {
    const {
      config,
      query,
      setQueryParam,
      showUserSettings
    } = this.props
    const { ModeIcon } = this.context

    return (
      <div className='settings-selector-panel'>
        <div className='modes-panel'>
          {showUserSettings && <UserTripSettings />}

          <StyledSettingsSelectorPanel
            ModeIcon={ModeIcon}
            queryParams={query}
            supportedModes={config.modes}
            supportedCompanies={config.companies}
            onQueryParamChange={setQueryParam}
          />
        </div>
      </div>
    )
  }
}

// connect to redux store

const mapStateToProps = (state, ownProps) => {
  const { config, currentQuery } = state.otp
  return {
    query: currentQuery,
    config,
    showUserSettings: getShowUserSettings(state.otp)
  }
}

const mapDispatchToProps = {
  setQueryParam
}

export default connect(mapStateToProps, mapDispatchToProps)(ConnectedSettingsSelectorPanel)
